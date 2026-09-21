import { STRONG_MOVES, isStrongMove, type StrongMove, type ThinkingMove } from "@/lib/reasoning/moves";

/**
 * Everything a parent is told about their child is decided here, in code, from
 * rows in the database — never by asking a model what it thinks happened. The
 * model only phrases the findings; it does not choose them.
 */

export type AttemptRow = {
  id: string;
  text: string;
  quality: string;
  moves: string;
  createdAt: Date;
  questionId: string;
};

const QUALITY_RANK: Record<string, number> = { excellent: 3, solid: 2, developing: 1 };

/**
 * Rough order of how hard each move is to learn, so "what to try next" suggests
 * the nearest reachable step rather than the most impressive-sounding one.
 */
const TEACHING_ORDER: StrongMove[] = [
  "gave-evidence",
  "made-connection",
  "considered-alternative",
  "used-scale",
  "admitted-uncertainty",
  "spotted-assumption",
  "questioned-source",
  // Hardest, so last: arguing a side you disagree with is the final step.
  "steelmanned",
];

export function parseMoves(raw: string): ThinkingMove[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ThinkingMove[]) : [];
  } catch {
    return [];
  }
}

/** Monday 00:00 UTC of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // getUTCDay: 0 = Sunday. Shift so Monday is day 0.
  const offset = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - offset);
  return d;
}

export function endOfWeek(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

/**
 * The quote the parent reads. Ranked by reasoning quality, then by how many
 * distinct strong moves it shows, then by length — a longer answer at equal
 * quality gives a parent more to recognise their child in. Ties break on
 * recency so the result is stable for a given week.
 */
export function pickQuote(attempts: AttemptRow[]): AttemptRow | null {
  if (attempts.length === 0) return null;

  return [...attempts].sort((a, b) => {
    const quality = (QUALITY_RANK[b.quality] ?? 0) - (QUALITY_RANK[a.quality] ?? 0);
    if (quality !== 0) return quality;

    const strong =
      parseMoves(b.moves).filter(isStrongMove).length -
      parseMoves(a.moves).filter(isStrongMove).length;
    if (strong !== 0) return strong;

    if (b.text.length !== a.text.length) return b.text.length - a.text.length;
    return b.createdAt.getTime() - a.createdAt.getTime();
  })[0];
}

export function tallyMoves(attempts: AttemptRow[]): Map<ThinkingMove, number> {
  const counts = new Map<ThinkingMove, number>();
  for (const attempt of attempts) {
    for (const move of parseMoves(attempt.moves)) {
      counts.set(move, (counts.get(move) ?? 0) + 1);
    }
  }
  return counts;
}

/** The strong move seen most often. Ties break on TEACHING_ORDER, so it is deterministic. */
export function climbingMove(attempts: AttemptRow[]): StrongMove {
  const counts = tallyMoves(attempts);
  let best: StrongMove = TEACHING_ORDER[0];
  let bestCount = -1;

  for (const move of TEACHING_ORDER) {
    const count = counts.get(move) ?? 0;
    if (count > bestCount) {
      best = move;
      bestCount = count;
    }
  }
  return best;
}

/**
 * The growth edge: the easiest strong move they have not shown this week. If
 * they have shown all of them, the least frequent one. Always a strong move —
 * a parent is told what to look for next, never what their child failed to do.
 */
export function nextMove(attempts: AttemptRow[]): StrongMove {
  const counts = tallyMoves(attempts);
  const climbing = climbingMove(attempts);

  const unseen = TEACHING_ORDER.find((m) => (counts.get(m) ?? 0) === 0 && m !== climbing);
  if (unseen) return unseen;

  let least: StrongMove = TEACHING_ORDER[0];
  let leastCount = Number.POSITIVE_INFINITY;
  for (const move of TEACHING_ORDER) {
    if (move === climbing) continue;
    const count = counts.get(move) ?? 0;
    if (count < leastCount) {
      least = move;
      leastCount = count;
    }
  }
  return least;
}

/** Below this there is nothing honest to report, and a thin report is worse than none. */
export const MIN_ATTEMPTS_FOR_REPORT = 3;

export { STRONG_MOVES, TEACHING_ORDER };
