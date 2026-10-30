import { chooseNext, type AttemptRow } from "../src/lib/yle/next";
import { ALL_SETS } from "../content/yle-practice";

/**
 * The rules that decide what every child practises next.
 *
 *   npm run test:next
 *
 * Pure, so no database: `chooseNext` was split out of `nextUp` for exactly
 * this. The branch worth guarding is **breadth before depth** — a child who
 * has sat one set badly has one measured part, and "weakest" then means "the
 * only one we know about". Serving that part again on that evidence would
 * build a learning path out of a single bad morning and would never find the
 * part they are genuinely worse at.
 */

let failed = 0;
function check(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

const LEVEL = "flyers";
const sets = ALL_SETS.filter((s) => s.level === LEVEL);
const parts = [...new Set(sets.map((s) => `${s.paper}#${s.part}`))];

function row(set: (typeof sets)[number], correct: number, when = "2026-10-01T10:00:00Z"): AttemptRow {
  return {
    set_id: set.id,
    level: set.level,
    paper: set.paper,
    part: set.part,
    correct,
    total: set.questions.length,
    created_at: when,
  };
}

console.log(`\n${sets.length} ${LEVEL} sets across ${parts.length} parts\n`);

// 1. Nothing done anywhere.
{
  const next = chooseNext([], LEVEL);
  check(next !== null, "recommends something to a brand new child");
  check(next?.reason === "start", "and says it is a starting point", `reason=${next?.reason}`);
  check(next?.accuracy === null, "with no accuracy to report yet");
}

// 2. One part done badly. Coverage must still win.
{
  const first = sets.find((s) => `${s.paper}#${s.part}` === parts[0])!;
  const next = chooseNext([row(first, 0)], LEVEL);

  check(
    next?.reason === "coverage",
    "a single bad set does not make that part the target",
    `reason=${next?.reason}`,
  );
  check(
    `${next?.paper}#${next?.part}` !== parts[0],
    "it moves on to a part that has never been measured",
    `went to ${next?.paper}#${next?.part}, away from ${parts[0]}`,
  );
}

// 3. Every part tried once; the weakest should now be targeted.
{
  const oneEach = parts.map((key) => sets.find((s) => `${s.paper}#${s.part}` === key)!);
  // Everything strong except the last part, which is the intended target.
  const weakKey = parts.at(-1)!;
  const rows = oneEach.map((set) =>
    row(set, `${set.paper}#${set.part}` === weakKey ? 0 : set.questions.length),
  );

  const next = chooseNext(rows, LEVEL);
  check(next?.reason === "weakest", "with full coverage it targets a weakness", `reason=${next?.reason}`);
  check(
    `${next?.paper}#${next?.part}` === weakKey,
    "and picks the part that actually went worst",
    `chose ${next?.paper}#${next?.part}, want ${weakKey}`,
  );
  check(next?.accuracy === 0, "reporting that part's real accuracy", `${next?.accuracy}`);
}

// 4. Never re-serve a set while an unseen one exists in the same part.
{
  const weakKey = parts.at(-1)!;
  const inWeak = sets.filter((s) => `${s.paper}#${s.part}` === weakKey);
  const oneEach = parts.map((key) => sets.find((s) => `${s.paper}#${s.part}` === key)!);
  const rows = oneEach.map((set) =>
    row(set, `${set.paper}#${set.part}` === weakKey ? 0 : set.questions.length),
  );

  const next = chooseNext(rows, LEVEL);
  const alreadySeen = new Set(rows.map((r) => r.set_id));
  if (inWeak.length > 1) {
    check(!alreadySeen.has(next!.set.id), "serves a set the child has not seen", next!.set.id);
    check(next!.fresh > 0, "and says how many are left", `fresh=${next!.fresh}`);
  }
}

// 5. Every set in the weak part seen: round again on the worst one.
{
  const weakKey = parts.at(-1)!;
  const inWeak = sets.filter((s) => `${s.paper}#${s.part}` === weakKey);
  const others = parts.slice(0, -1).map((key) => sets.find((s) => `${s.paper}#${s.part}` === key)!);

  const rows: AttemptRow[] = [
    ...others.map((set) => row(set, set.questions.length)),
    // Every set in the weak part attempted; the FIRST went worst.
    ...inWeak.map((set, i) => row(set, i === 0 ? 0 : set.questions.length)),
  ];

  const next = chooseNext(rows, LEVEL);
  check(next?.reason === "revisit", "with nothing fresh left it says so", `reason=${next?.reason}`);
  check(next?.fresh === 0, "and reports nothing unseen", `fresh=${next?.fresh}`);
  if (inWeak.length > 1) {
    check(
      next?.set.id === inWeak[0].id,
      "re-serving the set that went worst, not the last one opened",
      `chose ${next?.set.id}, want ${inWeak[0].id}`,
    );
  }
}

// 6. A better later attempt must not make a part look weak forever.
{
  const oneEach = parts.map((key) => sets.find((s) => `${s.paper}#${s.part}` === key)!);
  const target = oneEach[0];
  const rows: AttemptRow[] = [
    ...oneEach.map((set) => row(set, set.questions.length)),
    // A terrible FIRST go at one set, already covered by a perfect one above.
    row(target, 0, "2026-09-01T10:00:00Z"),
  ];

  const next = chooseNext(rows, LEVEL);
  check(
    `${next?.paper}#${next?.part}` !== `${target.paper}#${target.part}` ||
      (next?.accuracy ?? 0) > 0,
    "a later better attempt is what counts, not the worst one",
    `chose ${next?.paper}#${next?.part} at ${next?.accuracy}`,
  );
}

console.log(failed === 0 ? "\nthe path rules hold\n" : `\n${failed} CHECK(S) FAILED\n`);
process.exit(failed === 0 ? 0 : 1);
