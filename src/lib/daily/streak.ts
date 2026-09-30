/**
 * The streak rule.
 *
 * Two changes from the original, both taken from what actually keeps a daily
 * habit alive rather than from what looks strict:
 *
 * 1. **Every activity counts.** The old rule counted only Fake or Real, so a
 *    child who played three lessons and argued a steelman but skipped the
 *    ninety-second daily challenge lost their streak — the product punished
 *    exactly the behaviour it most wants. Lowering the bar to "did something"
 *    matters more for habit formation than what was done on the day.
 *
 * 2. **One missed day in seven is forgiven.** A streak that shatters on the
 *    first bad evening teaches children to fear it and then to abandon it, and
 *    the shame of losing a long run is a bigger risk than the day off. The
 *    forgiveness is deliberately shown in the UI rather than applied silently:
 *    a hidden mechanic that quietly rescues you is a lie, and being told "we
 *    forgave Tuesday" is the part that makes a child feel the system is on
 *    their side.
 */

/** UTC day key, so "today" means the same thing on the server and in the database. */
export function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

const FORGIVENESS_WINDOW_DAYS = 7;
const MAX_SCAN_DAYS = 400;

export type Streak = {
  /** Days actually active. A forgiven day is never counted as activity. */
  days: number;
  /** Missed days that did not break the run, newest first. */
  forgiven: string[];
};

function key(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive active days ending today or yesterday.
 *
 * Yesterday still keeps a streak alive: a child who has not played *yet today*
 * has not broken anything, and zeroing the number before they have had the
 * chance is both wrong and discouraging.
 */
export function computeStreak(days: Set<string>, today = todayKey()): Streak {
  if (days.size === 0) return { days: 0, forgiven: [] };

  const cursor = new Date(`${today}T00:00:00Z`);
  if (!days.has(key(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let count = 0;
  let lastCountedOffset = -1;
  let lastForgivenOffset: number | null = null;
  const forgiven: { day: string; offset: number }[] = [];

  for (let offset = 0; offset < MAX_SCAN_DAYS; offset++) {
    const day = key(cursor);

    if (days.has(day)) {
      count++;
      lastCountedOffset = offset;
    } else {
      // Nothing counted yet means there is no run to rescue.
      if (count === 0) break;

      const windowSpent =
        lastForgivenOffset !== null && offset - lastForgivenOffset < FORGIVENESS_WINDOW_DAYS;
      if (windowSpent) break;

      forgiven.push({ day, offset });
      lastForgivenOffset = offset;
    }

    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    days: count,
    // A forgiven day past the last active day protected nothing — the run had
    // already ended behind it, so reporting it would claim a rescue that never
    // happened.
    forgiven: forgiven.filter((f) => f.offset < lastCountedOffset).map((f) => f.day),
  };
}
