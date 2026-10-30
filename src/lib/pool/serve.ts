import "server-only";

import type { z } from "zod";
import type { Json } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decide, type PoolRow } from "./rotate";

/** CEFR, easiest first. A preteen starting English sits at the bottom of this. */
export const LEVELS = ["pre-a1", "a1", "a2", "b1"] as const;
export type Level = (typeof LEVELS)[number];

export const SKILLS = ["listening", "reading", "writing", "speaking"] as const;
export type Skill = (typeof SKILLS)[number];

/** The slice of the bank one request is asking for. */
export interface PoolKey {
  skill: Skill;
  level: Level;
  /** Activity shape within the skill. Names the Zod schema that owns `payload`. */
  kind: string;
  locale?: string;
  /** Pin a subject. Omit for "anything at this level". */
  topic?: string;
  /** Bump in lockstep with an incompatible change to the payload schema. */
  payloadVersion?: number;
}

export interface Served<T> {
  /** `content_pool.id`. Store this on the attempt row so history survives. */
  id: string;
  payload: T;
  /** The child has had this one before -- the pool was deep enough to recycle. */
  repeat: boolean;
  /** This request paid for a generation. True at most once per pool slice. */
  generated: boolean;
}

/**
 * Serve one activity, generating it only if nobody has ever needed it before.
 *
 * The shape the whole bank runs on:
 *
 *   1. find a row in this slice the child has not seen, least-used first
 *   2. nothing unseen, but the pool is deep -> give back the oldest one again
 *   3. nothing at all -> generate it, store it, and serve it
 *
 * So the first child to ask for a (skill, level, kind) waits for the model;
 * every child after them gets an indexed read. The bank grows as the product is
 * used and never runs out, which is the whole point of not shipping it as a
 * fixed file.
 *
 * `generate` is supplied by the caller rather than built here: the prompt for a
 * listening passage has nothing in common with the prompt for a speaking cue,
 * and the one thing they must share -- that a malformed generation never
 * reaches the shared bank -- is already guaranteed by `generateJson()` parsing
 * against `schema` before it returns.
 */
export async function serveFromPool<S extends z.ZodType>(opts: {
  childId: string;
  key: PoolKey;
  schema: S;
  generate: () => Promise<{ data: z.infer<S>; model: string }>;
}): Promise<Served<z.infer<S>>> {
  const { childId, key, schema, generate } = opts;
  const locale = key.locale ?? "en";
  const payloadVersion = key.payloadVersion ?? 1;

  const db = await createClient();

  /**
   * Every pool row this child has already been handed.
   *
   * Deliberately NOT narrowed to this slice. Ids are unique across the whole
   * table, so an id from another skill simply cannot match the query below --
   * excluding it costs nothing and saves a join on every single request.
   */
  const { data: seenRows } = await db
    .from("content_seen")
    .select("pool_id")
    .eq("child_id", childId);

  const seenIds = (seenRows ?? []).map((r) => r.pool_id as string);

  /**
   * Servable rows in this slice.
   *
   * The filter chain is spelled out again in the count below rather than
   * factored into one helper: a `head: true` count has to pass its options to
   * `.select()` itself, so a shared builder would have to be built before the
   * select and loses the column types that make the rest of this function
   * safe. Two readable chains beat one clever one.
   */
  const rows = () => {
    const q = db
      .from("content_pool")
      .select("id, usage_count, payload")
      .eq("skill", key.skill)
      .eq("level", key.level)
      .eq("kind", key.kind)
      .eq("locale", locale)
      .eq("payload_version", payloadVersion)
      .eq("status", "ready");
    return key.topic ? q.eq("topic", key.topic) : q;
  };

  const sliceCount = () => {
    const q = db
      .from("content_pool")
      .select("id", { count: "exact", head: true })
      .eq("skill", key.skill)
      .eq("level", key.level)
      .eq("kind", key.kind)
      .eq("locale", locale)
      .eq("payload_version", payloadVersion)
      .eq("status", "ready");
    return key.topic ? q.eq("topic", key.topic) : q;
  };

  type Candidate = PoolRow & { payload: unknown };
  const asCandidate = (r: { id: string; usage_count: number; payload: unknown }): Candidate => ({
    id: r.id,
    usageCount: r.usage_count,
    payload: r.payload,
  });

  // Least-used row this child has not had. One row is enough: the sort already
  // put the best candidate first, so fetching more would only be thrown away.
  let unseenQuery = rows().order("usage_count", { ascending: true }).order("id").limit(1);
  if (seenIds.length > 0) {
    unseenQuery = unseenQuery.not("id", "in", `(${seenIds.join(",")})`);
  }
  const { data: unseen, error: unseenError } = await unseenQuery;
  if (unseenError) throw unseenError;

  let candidatesSeen: Candidate[] = [];
  let poolSize = unseen?.length ?? 0;

  // Only worth asking how deep the pool is when there is nothing fresh left.
  if (!unseen || unseen.length === 0) {
    const [{ count }, { data: oldest }] = await Promise.all([
      sliceCount(),
      rows().order("usage_count", { ascending: true }).order("id").limit(1),
    ]);
    poolSize = count ?? 0;
    candidatesSeen = (oldest ?? []).map(asCandidate);
  }

  const decision = decide<Candidate>({
    unseen: (unseen ?? []).map(asCandidate),
    seen: candidatesSeen,
    poolSize,
  });

  if (decision.action === "serve") {
    const parsed = schema.safeParse(decision.row.payload);

    // A stored row that no longer parses is a schema change that forgot to bump
    // payload_version. Retire it so it stops being served, and fall through to
    // a generation rather than handing a child a half-rendered activity.
    if (!parsed.success) {
      await createAdminClient()
        .from("content_pool")
        .update({ status: "retired" })
        .eq("id", decision.row.id);
    } else {
      await Promise.all([
        db.rpc("bump_pool_usage", { target: decision.row.id }),
        markSeen(db, childId, decision.row.id),
      ]);
      return {
        id: decision.row.id,
        payload: parsed.data as z.infer<S>,
        repeat: decision.repeat,
        generated: false,
      };
    }
  }

  // Nothing servable. Pay for it once, on behalf of everyone who asks next.
  const { data, model } = await generate();

  /**
   * Written with the service-role client, not the caller's session.
   *
   * The row is system-authored content that every other child will be served,
   * and `content_pool` has no insert policy for `authenticated` precisely so
   * that a signed-in account cannot put anything into the shared bank. The
   * child's request is what triggered this; it is not what authored it.
   */
  const admin = createAdminClient();
  const { data: saved, error: saveError } = await admin
    .from("content_pool")
    .insert({
      skill: key.skill,
      level: key.level,
      kind: key.kind,
      topic: key.topic ?? "any",
      locale,
      // Validated against `schema` by generateJson before it got here, so the
      // cast asserts what Zod already proved; jsonb has no narrower type.
      payload: data as NonNullable<Json>,
      payload_version: payloadVersion,
      usage_count: 1,
      source: "ai",
      model,
      status: "ready",
    })
    .select("id")
    .single();

  if (saveError) throw saveError;

  await markSeen(db, childId, saved.id);

  return { id: saved.id, payload: data, repeat: false, generated: true };
}

/**
 * Record that this child has been handed this row.
 *
 * At SERVE time, not on completion: a child who opens an activity and wanders
 * off should get something new next time. Being handed back the thing you just
 * abandoned reads as the product being broken, not as a second chance.
 */
async function markSeen(
  db: Awaited<ReturnType<typeof createClient>>,
  childId: string,
  poolId: string,
) {
  await db
    .from("content_seen")
    .upsert({ child_id: childId, pool_id: poolId }, { onConflict: "child_id,pool_id" });
}
