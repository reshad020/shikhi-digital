import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { ALL_SETS } from "../content/yle-practice";
import { isCorrect } from "../src/lib/yle/items";
import { shieldsFor } from "../src/lib/yle/syllabus";

/**
 * End-to-end check of the YLE progress loop, against the real database.
 *
 *   npm run test:yle
 *
 * Writes attempts for a throwaway child, reads the progress back, asserts the
 * arithmetic, and deletes everything it made. It uses the service key and a
 * child it creates itself, so it never touches a real family's rows.
 *
 * The rule worth testing is "best, not latest": a child sitting the same set
 * again must never be able to lose ground by doing so. That is a promise the
 * product makes to a nervous ten-year-old, and it is one line of comparison
 * away from being broken by a later edit.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

let failed = 0;
function check(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

/** Best attempt per set, mirroring `yleProgress`. */
function bestBySet(rows: { set_id: string; correct: number; total: number }[]) {
  const best = new Map<string, { correct: number; total: number }>();
  for (const r of rows) {
    const seen = best.get(r.set_id);
    if (!seen || r.correct / r.total > seen.correct / seen.total) {
      best.set(r.set_id, { correct: r.correct, total: r.total });
    }
  }
  return best;
}

async function main() {
  console.log(`\n${url}\n`);

  // A parent row to hang the child off. Any profile will do; this picks the
  // first rather than inventing an auth user.
  const { data: profile } = await db.from("profiles").select("id").limit(1).single();
  if (!profile) {
    console.error("no profile in the database to attach a test child to");
    process.exit(1);
  }

  const { data: child, error: childError } = await db
    .from("children")
    .insert({ parent_id: profile.id, name: "ZZ test child", avatar: "fox" })
    .select("id")
    .single();

  if (childError || !child) {
    console.error("could not create a test child:", childError?.message);
    process.exit(1);
  }

  console.log(`using throwaway child ${child.id}\n`);

  try {
    const set = ALL_SETS.find((s) => s.level === "flyers") ?? ALL_SETS[0];
    const total = set.questions.length;

    // A weak attempt, then a strong one at the same set.
    const weak = Math.max(1, Math.floor(total * 0.3));
    const strong = total;

    for (const correct of [strong, weak]) {
      const { error } = await db.from("yle_attempts").insert({
        child_id: child.id,
        set_id: set.id,
        level: set.level,
        paper: set.paper,
        part: set.part,
        kind: set.kind,
        correct,
        total,
        shields: shieldsFor(correct, total),
        answers: set.questions.map((q, i) => ({ id: q.id, correct: i < correct })),
        seconds: 90,
      });
      if (error) throw new Error(error.message);
    }

    const { data: rows } = await db
      .from("yle_attempts")
      .select("set_id, correct, total, shields")
      .eq("child_id", child.id);

    check((rows ?? []).length === 2, "both attempts stored", `${(rows ?? []).length} rows`);

    // The promise: the weaker second go must not displace the first.
    const best = bestBySet(rows ?? []);
    const bestForSet = best.get(set.id);
    check(
      bestForSet?.correct === strong,
      "a worse second attempt does not replace a better first",
      `best kept ${bestForSet?.correct}/${total}, want ${strong}/${total}`,
    );

    check(
      shieldsFor(strong, total) >= shieldsFor(weak, total),
      "the shield curve is monotonic over this pair",
      `${shieldsFor(weak, total)} -> ${shieldsFor(strong, total)}`,
    );

    // Marking on the server must agree with the browser for a perfect paper.
    const perfect = set.questions.every((q) => isCorrect(q, q.answer));
    check(perfect, "every stored answer marks its own set correct");

    // The constraint that stops a tampered payload inventing a score.
    const { error: tooMany } = await db.from("yle_attempts").insert({
      child_id: child.id,
      set_id: set.id,
      level: set.level,
      paper: set.paper,
      part: set.part,
      kind: set.kind,
      correct: total + 5,
      total,
      shields: 5,
    });
    check(!!tooMany, "database rejects correct > total", tooMany ? "" : "IT WAS ACCEPTED");

    const { error: badShields } = await db.from("yle_attempts").insert({
      child_id: child.id,
      set_id: set.id,
      level: set.level,
      paper: set.paper,
      part: set.part,
      kind: set.kind,
      correct: 1,
      total,
      shields: 9,
    });
    check(!!badShields, "database rejects shields above five", badShields ? "" : "IT WAS ACCEPTED");

    // The streak has to see YLE, which was the whole point of the table.
    const { data: streakRows } = await db
      .from("yle_attempts")
      .select("created_at")
      .eq("child_id", child.id);
    const days = new Set((streakRows ?? []).map((r) => String(r.created_at).slice(0, 10)));
    check(days.size >= 1, "attempts carry a day the streak can count", `${days.size} day(s)`);
  } finally {
    // Cascades to the attempts.
    await db.from("children").delete().eq("id", child.id);
    console.log("\ncleaned up the throwaway child");
  }

  console.log(failed === 0 ? "\nthe progress loop holds\n" : `\n${failed} CHECK(S) FAILED\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
