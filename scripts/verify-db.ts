import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { parseStoryboard } from "../src/lib/storyboard/schema";

/**
 * Checks that a database has every migration applied and the seed loaded.
 *
 *   npm run db:verify
 *
 * Written for the hosted project, where `supabase db push` reports success
 * per-migration but nothing confirms the end state — and where a half-applied
 * schema shows up much later as a confusing runtime error in one feature.
 *
 * Uses the service key because it has to see tables regardless of row level
 * security; it only ever counts rows and reads one column per check.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

/**
 * A second client holding only the publishable key, used for one check: that a
 * stranger cannot write to the shared content pool. Row level security is the
 * real boundary there, and a boundary nothing tests is a boundary that quietly
 * stops existing the next time the policies are edited.
 */
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const pub = anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

/** Every table the seven migrations should have created. */
const TABLES = [
  "profiles",
  "children",
  "lessons",
  "reasoning_attempts",
  "weekly_reports",
  "daily_challenges",
  "challenge_attempts",
  "attempt_reviews",
  "trick_puzzles",
  "puzzle_attempts",
  "steelman_prompts",
  "steelman_attempts",
  "listening_passages",
  "listening_attempts",
  "content_pool",
  "content_seen",
];

/** Columns added or reshaped by the more recent migrations. */
const COLUMNS: [table: string, column: string][] = [
  ["children", "seen_rank"],
  ["profiles", "weekly_email"],
  ["weekly_reports", "emailed_at"],
  ["attempt_reviews", "steelman_attempt_id"],
  ["attempt_reviews", "listening_attempt_id"],
];

let failed = 0;

function report(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

async function main() {
  console.log(`\nchecking ${url}\n`);

  console.log("tables");
  for (const table of TABLES) {
    // A real GET, not `head: true`. A HEAD request against a table PostgREST
    // does not know about comes back 200 with a null count rather than an
    // error, so the head form reported "ok" for tables that were in the
    // database but missing from the schema cache — a false pass that hid the
    // exact problem this script exists to find.
    const { error } = await db.from(table).select("*").limit(1);
    report(!error, table, error ? `${error.code}: ${error.message}` : "");
  }

  console.log("\ncolumns");
  for (const [table, column] of COLUMNS) {
    const { error } = await db.from(table).select(column).limit(1);
    report(!error, `${table}.${column}`, error ? error.message : "");
  }

  console.log("\nseed");
  const lessons = await db
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("status", "ready");
  report((lessons.count ?? 0) >= 1, "published lessons", `found ${lessons.count ?? 0}, want >= 1`);

  const claims = await db
    .from("steelman_prompts")
    .select("*", { count: "exact", head: true })
    .eq("status", "ready");
  report(
    (claims.count ?? 0) >= 3,
    "published steelman claims",
    `found ${claims.count ?? 0}, want >= 3`,
  );

  const passages = await db
    .from("listening_passages")
    .select("*", { count: "exact", head: true })
    .eq("status", "ready");
  report(
    (passages.count ?? 0) >= 1,
    "published listening passages",
    `found ${passages.count ?? 0}, want >= 1`,
  );

  // Not seeded: these are generated, then published by a person.
  // Reported rather than failed, so the output doubles as a to-do list.
  //
  // Drafts are counted separately and deliberately. Counting only `ready` once
  // printed "found 0 (generate these in /admin)" while a full week of checked
  // challenges sat in the table waiting to be published — advice that would
  // have had someone generate the whole lot a second time.
  for (const [table, label] of [
    ["daily_challenges", "Fake or Real challenges"],
    ["trick_puzzles", "Spot the Trick puzzles"],
  ] as const) {
    const ready = await db
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("status", "ready");
    const draft = await db
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");

    const live = ready.count ?? 0;
    const waiting = draft.count ?? 0;

    const next =
      live > 0
        ? ""
        : waiting > 0
          ? `  (${waiting} draft(s) waiting — publish in /admin)`
          : "  (run npm run gen:daily, or generate in /admin)";

    console.log(`${live > 0 ? "ok  " : "--  "}  ${label}  ${live} published` + next);
  }

  /**
   * The content pool is what every skill now serves from, so "is it empty" is
   * the single most useful thing to know about a database. A thin pool is not
   * a failure -- `serveFromPool` generates on a miss -- but the first child of
   * the day then waits fifteen seconds for a model call, so it is worth saying
   * out loud rather than discovering from a slow page.
   */
  console.log("\ncontent pool");
  const { data: poolRows } = await db.from("content_pool").select("skill, level").eq("status", "ready");

  const bySkill = new Map<string, Map<string, number>>();
  for (const row of poolRows ?? []) {
    const levels = bySkill.get(row.skill) ?? new Map<string, number>();
    levels.set(row.level, (levels.get(row.level) ?? 0) + 1);
    bySkill.set(row.skill, levels);
  }

  if (bySkill.size === 0) {
    console.log("--    empty  (run npm run seed:speaking, then npm run seed:pool)");
  }
  for (const [skill, levels] of bySkill) {
    const breakdown = [...levels].map(([level, n]) => `${level} ${n}`).join(" · ");
    const total = [...levels.values()].reduce((a, b) => a + b, 0);
    console.log(`ok    ${skill}  ${total} ready  (${breakdown})`);
  }

  // Generated rows are written with the service key on purpose. If the
  // publishable key can insert here, one account can poison the bank every
  // other child reads from.
  if (pub) {
    const { error } = await pub
      .from("content_pool")
      .insert({ skill: "speaking", level: "a1", kind: "cue-card", payload: {} });
    report(Boolean(error), "pool is read-only to the publishable key", error ? "" : "IT IS NOT");
  }

  // A storyboard that does not validate is silently dropped by the browse grid
  // and the player: the lesson row exists and the child never sees it, which
  // is the worst kind of failure to discover in production.
  console.log("\nstoryboards");
  const { data: published } = await db
    .from("lessons")
    .select("subject, storyboard")
    .eq("status", "ready");

  for (const lesson of published ?? []) {
    const sb = parseStoryboard(lesson.storyboard);
    if (!sb) {
      report(false, lesson.subject, "does not validate — will not appear in the grid");
      continue;
    }
    const defends = sb.quiz.filter((q) => q.defend).length;
    report(
      defends === 2,
      `${sb.heroEmoji} ${sb.title}`,
      `${sb.scenes.length} scenes · ${sb.quiz.length} q · ${defends} to defend` +
        (defends === 2 ? "" : "  (should be exactly 2)"),
    );
  }

  console.log(failed === 0 ? "\nschema and seed look right\n" : `\n${failed} CHECK(S) FAILED\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
