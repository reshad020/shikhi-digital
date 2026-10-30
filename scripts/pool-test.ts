import { decide, leastUsed, RECYCLE_THRESHOLD, type PoolRow } from "../src/lib/pool/rotate";

/**
 * The rule that decides which activity a child is handed next.
 *
 *   npm run test:pool
 *
 * Pure, so no database and no API key: `decide` was split out of
 * `serveFromPool` for exactly this. Two branches are worth guarding.
 *
 * **A thin pool must generate rather than repeat.** The promise is that the
 * bank never runs out; handing back the same passage because only three exist
 * is how that promise quietly stops being true.
 *
 * **Rotation has to be deterministic.** Two rows on usage_count 0 are ordered
 * by id, not by whatever the index returned — without that, the same child
 * making the same request twice can get different answers, and a flaky test
 * looks exactly like a real bug.
 */

let failed = 0;
function check(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

const row = (id: string, usageCount: number): PoolRow => ({ id, usageCount });

console.log("\nleastUsed\n");

check(leastUsed([]) === null, "empty pool returns null");
check(leastUsed([row("a", 5), row("b", 2), row("c", 9)])?.id === "b", "picks the lowest count");
check(
  leastUsed([row("z", 0), row("a", 0), row("m", 0)])?.id === "a",
  "ties break by id, not insertion order",
);
check(
  leastUsed([row("z", 0), row("a", 0)])?.id === leastUsed([row("a", 0), row("z", 0)])?.id,
  "same rows in any order give the same winner",
);

console.log("\ndecide — something fresh exists\n");

{
  const d = decide({ unseen: [row("a", 3), row("b", 1)], seen: [row("c", 0)] });
  check(d.action === "serve", "serves rather than generates");
  check(d.action === "serve" && d.row.id === "b", "serves the least-used unseen row");
  check(d.action === "serve" && d.repeat === false, "not flagged as a repeat");
  check(
    d.action === "serve" && d.row.id !== "c",
    "a less-used SEEN row never beats an unseen one",
    "repeating is worse than serving a busier passage",
  );
}

console.log("\ndecide — nothing fresh left\n");

{
  const seen = Array.from({ length: RECYCLE_THRESHOLD - 1 }, (_, i) =>
    row(`s${String(i).padStart(2, "0")}`, i),
  );
  const d = decide({ unseen: [], seen, poolSize: seen.length });
  check(d.action === "generate", `pool of ${seen.length} is too thin — generates`);
}

{
  const seen = Array.from({ length: RECYCLE_THRESHOLD }, (_, i) =>
    row(`s${String(i).padStart(2, "0")}`, i),
  );
  const d = decide({ unseen: [], seen, poolSize: seen.length });
  check(d.action === "serve", `pool of ${seen.length} is deep enough — recycles`);
  check(d.action === "serve" && d.repeat === true, "flagged as a repeat");
  check(d.action === "serve" && d.row.id === "s00", "recycles the least-used seen row");
}

{
  const d = decide({ unseen: [], seen: [], poolSize: 0 });
  check(d.action === "generate", "cold pool generates");
}

console.log("\ndecide — poolSize comes from SQL, not the arrays\n");

{
  // What the real caller does: one candidate row fetched, the true depth
  // counted separately. Judging depth by the array would see 1 and generate.
  const d = decide({ unseen: [], seen: [row("x", 7)], poolSize: 40 });
  check(d.action === "serve", "a deep pool recycles even though one row was fetched");
  check(d.action === "serve" && d.row.id === "x", "serves the fetched candidate");
}

{
  const d = decide({ unseen: [], seen: [row("x", 7)], poolSize: 2 });
  check(d.action === "generate", "a shallow pool generates despite a candidate being present");
}

console.log(failed === 0 ? "\nall passed\n" : `\n${failed} FAILED\n`);
process.exit(failed === 0 ? 0 : 1);
