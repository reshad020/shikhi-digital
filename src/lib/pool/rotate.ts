/**
 * Pool rotation, as pure functions.
 *
 * Deliberately imports neither Supabase nor Gemini, so the rule that decides
 * what a child is served next can be tested without a database, a network or
 * an API key -- and so that rule stays one readable decision instead of being
 * spread through a query builder.
 */

export interface PoolRow {
  id: string;
  usageCount: number;
}

/**
 * How deep a pool must be before a child is allowed to see something twice.
 *
 * Below this, a repeat means "we have almost nothing" and the honest answer is
 * to generate. Above it, a repeat is a genuinely old activity coming round
 * again, which for a learner is useful rather than embarrassing.
 */
export const RECYCLE_THRESHOLD = 12;

export type PoolDecision<T> =
  /** Serve this row. `repeat` is true when the child has had it before. */
  | { action: "serve"; row: T; repeat: boolean }
  /** Nothing suitable and the pool is too thin -- generate and cache. */
  | { action: "generate" };

/**
 * Least-used first, ties broken by id.
 *
 * The tie-break is not decoration: without it two rows on usage_count 0 come
 * back in whatever order the index felt like, so the "same child, same request,
 * same answer" property disappears and a flaky test looks like a real bug.
 */
export function leastUsed<T extends PoolRow>(rows: readonly T[]): T | null {
  if (rows.length === 0) return null;
  return [...rows].sort(
    (a, b) => a.usageCount - b.usageCount || (a.id < b.id ? -1 : 1),
  )[0];
}

/**
 * What to do for one (skill, level, kind) request.
 *
 * `unseen` are servable rows this child has NOT had, `seen` are servable rows
 * they have. Both are passed in rather than fetched here -- the caller already
 * has to talk to the database, and this stays a decision rather than a query.
 */
export function decide<T extends PoolRow>(opts: {
  unseen: readonly T[];
  seen: readonly T[];
  /**
   * Total servable rows in this slice. Defaults to what was passed in, which
   * is right for a test; the real caller passes a SQL `count` instead, because
   * it only fetches the handful of candidate rows it might actually serve.
   */
  poolSize?: number;
  recycleThreshold?: number;
}): PoolDecision<T> {
  const { unseen, seen, recycleThreshold = RECYCLE_THRESHOLD } = opts;
  const poolSize = opts.poolSize ?? unseen.length + seen.length;

  const fresh = leastUsed(unseen);
  if (fresh) return { action: "serve", row: fresh, repeat: false };

  // Everything in this slice has been seen. Repeat only out of a deep pool.
  if (poolSize >= recycleThreshold) {
    const again = leastUsed(seen);
    if (again) return { action: "serve", row: again, repeat: true };
  }

  return { action: "generate" };
}
