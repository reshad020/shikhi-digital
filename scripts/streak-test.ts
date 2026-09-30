import { computeStreak } from "../src/lib/daily/streak";

/**
 * Assertions for the streak rule.
 *
 *   npm run test:streak
 *
 * There is no test runner in this project, and adding one for a single pure
 * function would be heavier than the function. But streak arithmetic is the
 * kind of code that is easy to get subtly wrong and impossible to notice: an
 * off-by-one here silently tells a child their eleven-day run is over.
 * `computeStreak` is pure precisely so this file can exist.
 */

const TODAY = "2026-09-30";

function days(...list: string[]) {
  return new Set(list.map((d) => `2026-09-${d.padStart(2, "0")}`));
}

const cases: { name: string; set: Set<string>; days: number; forgiven: number }[] = [
  { name: "empty", set: days(), days: 0, forgiven: 0 },
  { name: "today only", set: days("30"), days: 1, forgiven: 0 },
  // Not played yet today: yesterday must still keep it alive.
  { name: "yesterday only", set: days("29"), days: 1, forgiven: 0 },
  { name: "three in a row ending today", set: days("28", "29", "30"), days: 3, forgiven: 0 },
  // The whole point: one gap inside the run is forgiven, not fatal.
  { name: "gap on 28 forgiven", set: days("26", "27", "29", "30"), days: 4, forgiven: 1 },
  // Two gaps closer together than the window must break the run.
  { name: "two gaps in one week breaks", set: days("25", "27", "29", "30"), days: 3, forgiven: 1 },
  // Gaps more than seven days apart each get their own forgiveness.
  {
    name: "two gaps a fortnight apart both forgiven",
    set: days(
      "14", "15", "16", "17", "18", "19",
      "21", "22", "23", "24", "25", "26", "27",
      "29", "30",
    ),
    days: 15,
    forgiven: 2,
  },
  // Nothing recent: there is no run to rescue, so forgiveness must not start one.
  { name: "stale streak is zero", set: days("20", "21"), days: 0, forgiven: 0 },
  // A gap behind the last active day protected nothing and must not be claimed.
  { name: "no phantom rescue", set: days("29", "30"), days: 2, forgiven: 0 },
];

let failed = 0;
for (const c of cases) {
  const got = computeStreak(c.set, TODAY);
  const ok = got.days === c.days && got.forgiven.length === c.forgiven;
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${c.name.padEnd(42)} days=${got.days} (want ${c.days})  ` +
      `forgiven=${got.forgiven.length} (want ${c.forgiven})` +
      (got.forgiven.length ? `  [${got.forgiven.join(", ")}]` : ""),
  );
}

console.log(failed === 0 ? "\nall passed" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
