import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";

/**
 * The content pool, against a real database.
 *
 *   npm run test:pool-db
 *
 * `npm run test:pool` covers the rotation RULE as pure logic. This covers
 * everything that rule depends on and that a unit test cannot see: the schema
 * accepts the payload, the serve query orders by usage_count, the seen-filter
 * actually excludes, `bump_pool_usage` increments atomically, and -- the one
 * worth guarding hardest -- row level security stops an outsider from writing
 * to a bank that every other child reads.
 *
 * No model is called. Payloads here are hand-built, so this passes with the
 * Gemini key empty, out of credit, or rate limited.
 *
 * Creates its own parent, child and pool rows, and deletes all of them.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key || !anonKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env",
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });

let failed = 0;
function check(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

const KIND = "zz-pool-test";
const cue = (title: string) => ({
  title,
  topic: "Testing",
  prompt: `Tell me about ${title}.`,
  bullets: ["one", "two", "three"],
  usefulWords: ["a", "b", "c", "d"],
  modelAnswer: "Well, I would say it is quite good.",
  secondsTarget: 30,
});

async function main() {
  // -- setup ---------------------------------------------------------------
  const email = `zz-pool-${Date.now()}@example.test`;
  const { data: created, error: userError } = await db.auth.admin.createUser({
    email,
    password: "zz-pool-test-password",
    email_confirm: true,
  });
  if (userError || !created.user) {
    console.error("could not create a test parent:", userError?.message);
    process.exit(1);
  }
  const parentId = created.user.id;

  const { data: child, error: childError } = await db
    .from("children")
    .insert({ parent_id: parentId, name: "ZZ pool child", avatar: "fox" })
    .select("id")
    .single();
  if (childError || !child) {
    console.error("could not create a test child:", childError?.message);
    await db.auth.admin.deleteUser(parentId);
    process.exit(1);
  }

  const poolIds: string[] = [];

  try {
    // -- the schema accepts a payload --------------------------------------
    const { data: rows, error: insertError } = await db
      .from("content_pool")
      .insert([
        {
          skill: "speaking", level: "a1", kind: KIND, topic: "any", locale: "en",
          payload: cue("the busy one"), usage_count: 5, source: "hand", status: "ready",
        },
        {
          skill: "speaking", level: "a1", kind: KIND, topic: "any", locale: "en",
          payload: cue("the quiet one"), usage_count: 1, source: "hand", status: "ready",
        },
        {
          skill: "speaking", level: "a1", kind: KIND, topic: "any", locale: "en",
          payload: cue("the draft one"), usage_count: 0, source: "hand", status: "draft",
        },
      ])
      .select("id, usage_count, status");

    check(!insertError, "pool accepts a generated payload", insertError?.message ?? "");
    if (!rows) throw new Error("insert returned nothing");
    rows.forEach((r) => poolIds.push(r.id));

    const busy = rows.find((r) => r.usage_count === 5)!;
    const quiet = rows.find((r) => r.usage_count === 1)!;
    const draft = rows.find((r) => r.status === "draft")!;

    // -- constraints actually constrain ------------------------------------
    const { error: badSkill } = await db
      .from("content_pool")
      .insert({ skill: "juggling", level: "a1", kind: KIND, payload: cue("nope") });
    check(!!badSkill, "an unknown skill is rejected");

    const { error: badLevel } = await db
      .from("content_pool")
      .insert({ skill: "speaking", level: "c2", kind: KIND, payload: cue("nope") });
    check(!!badLevel, "a level outside the CEFR ladder is rejected");

    // -- the serve query ---------------------------------------------------
    const slice = () =>
      db
        .from("content_pool")
        .select("id, usage_count")
        .eq("skill", "speaking")
        .eq("level", "a1")
        .eq("kind", KIND)
        .eq("locale", "en")
        .eq("payload_version", 1)
        .eq("status", "ready");

    const { data: first } = await slice()
      .order("usage_count", { ascending: true })
      .order("id")
      .limit(1);
    check(first?.[0]?.id === quiet.id, "least-used row is served first");

    const { data: ready } = await slice();
    check(
      !ready?.some((r) => r.id === draft.id),
      "a draft row is never servable",
      "generated-but-unreviewed content must not reach a child",
    );

    // -- the seen filter ---------------------------------------------------
    const { error: seenError } = await db
      .from("content_seen")
      .insert({ child_id: child.id, pool_id: quiet.id });
    check(!seenError, "a seen row can be recorded", seenError?.message ?? "");

    const { data: afterSeen } = await slice()
      .not("id", "in", `(${quiet.id})`)
      .order("usage_count", { ascending: true })
      .order("id")
      .limit(1);
    check(afterSeen?.[0]?.id === busy.id, "a seen row is skipped for the next serve");

    const { error: dupe } = await db
      .from("content_seen")
      .upsert({ child_id: child.id, pool_id: quiet.id }, { onConflict: "child_id,pool_id" });
    check(!dupe, "re-serving the same row is idempotent", dupe?.message ?? "");

    // -- the counter -------------------------------------------------------
    const { error: rpcError } = await db.rpc("bump_pool_usage", { target: quiet.id });
    check(!rpcError, "bump_pool_usage runs", rpcError?.message ?? "");

    const { data: bumped } = await db
      .from("content_pool")
      .select("usage_count")
      .eq("id", quiet.id)
      .single();
    check(
      bumped?.usage_count === 2,
      "usage_count incremented by exactly one",
      `was 1, now ${bumped?.usage_count}`,
    );

    // -- row level security ------------------------------------------------
    const { data: anonRead } = await anon.from("content_pool").select("id").eq("kind", KIND);
    check((anonRead?.length ?? 0) === 0, "a signed-OUT visitor reads no pool content");

    const { error: anonWrite } = await anon
      .from("content_pool")
      .insert({ skill: "speaking", level: "a1", kind: KIND, payload: cue("injected") });
    check(
      !!anonWrite,
      "a signed-out visitor cannot write to the shared bank",
      anonWrite?.code ?? "",
    );

    const { error: anonSeen } = await anon
      .from("content_seen")
      .insert({ child_id: child.id, pool_id: busy.id });
    check(!!anonSeen, "a signed-out visitor cannot forge a seen row", anonSeen?.code ?? "");
  } finally {
    // -- teardown ----------------------------------------------------------
    if (poolIds.length > 0) await db.from("content_pool").delete().in("id", poolIds);
    await db.from("children").delete().eq("id", child.id);
    await db.auth.admin.deleteUser(parentId);
  }

  console.log(failed === 0 ? "\nall passed\n" : `\n${failed} FAILED\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
