import { LEVELS, type PaperKind } from "./syllabus";
import { ALL_SETS } from "../../../content/yle-practice";
import type { PracticeSet } from "./items";

/**
 * What this child should do next, and why.
 *
 * Ninety practice sets presented as a list is a filing cabinet. A child opens
 * it, picks whatever is at the top, and the one part they are actually weak at
 * goes untouched because nothing ever pointed at it. The bank only becomes
 * practice when something decides the order.
 *
 * ## Breadth before depth
 *
 * The obvious rule — always serve the weakest part — is wrong at the start,
 * and wrong in a way that compounds. A child who has sat one set, badly, has
 * exactly one measured part, so "weakest" means "the only one we know about".
 * Sending them back to it again and again on that evidence would build a whole
 * learning path out of a single bad morning, and would never discover the part
 * they are genuinely worse at.
 *
 * So coverage comes first: every practisable part of the paper gets tried once
 * before anything is called a weakness. Only then does the recommendation turn
 * to targeting, which is when it has something real to target.
 *
 * ## Why it explains itself
 *
 * `reason` exists so the UI can say *why* this one. "You have not tried Part 4
 * yet" and "Part 4 is your weakest, at 48%" are different messages and a child
 * can act on both. A recommendation that arrives unexplained is just another
 * item at the top of a list, which is where this started.
 */

export type NextReason =
  /** Nothing attempted yet anywhere. */
  | "start"
  /** This part has never been tried, so it cannot be judged yet. */
  | "coverage"
  /** Measured, and the weakest of the measured parts. */
  | "weakest"
  /** Weakest part, but every set in it has been seen — so round again. */
  | "revisit";

export type NextUp = {
  set: PracticeSet;
  reason: NextReason;
  paper: PaperKind;
  part: number;
  /** Accuracy on this part so far, 0–1. Null when it has never been tried. */
  accuracy: number | null;
  /** How many sets in this part the child has not yet seen. */
  fresh: number;
};

export type AttemptRow = {
  set_id: string;
  level: string;
  paper: string;
  part: number;
  correct: number;
  total: number;
  created_at: string;
};

/** The parts that actually have practice material, for one level. */
function partsWithSets(level: string) {
  const seen = new Map<string, { paper: PaperKind; part: number; sets: PracticeSet[] }>();
  for (const set of ALL_SETS) {
    if (set.level !== level) continue;
    const key = `${set.paper}#${set.part}`;
    const entry = seen.get(key);
    if (entry) entry.sets.push(set);
    else seen.set(key, { paper: set.paper as PaperKind, part: set.part, sets: [set] });
  }
  return [...seen.values()].sort((a, b) => a.paper.localeCompare(b.paper) || a.part - b.part);
}

/**
 * The decision itself, with no database in it.
 *
 * This file holds no database access on purpose. The rules here choose what
 * every child does next, and while they were welded to a Supabase call nothing
 * could exercise them — importing them for a test dragged in `server-only` and
 * threw. The fetch lives in `progress.ts`, which was already reading these
 * same rows. `npm run test:next` walks each branch.
 */
export function chooseNext(rows: AttemptRow[], preferLevel?: string): NextUp | null {
  // The level the child is actually working on: the one they touched most
  // recently, unless the caller is standing on a level page and said which.
  const recent = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1);
  const level =
    preferLevel ??
    recent?.level ??
    // Nothing to go on. Movers is the middle level and the commonest entry
    // point, so it is a better guess than the easiest or the hardest.
    LEVELS.find((l) => l.slug === "movers")?.slug ??
    LEVELS[0].slug;

  const groups = partsWithSets(level);
  if (groups.length === 0) return null;

  const forLevel = rows.filter((r) => r.level === level);
  const seenIds = new Set(rows.map((r) => r.set_id));

  /** Pick the set this child has not seen; else the one they did worst at. */
  function pickFrom(group: { sets: PracticeSet[] }) {
    const unseen = group.sets.filter((s) => !seenIds.has(s.id));
    if (unseen.length > 0) return { set: unseen[0], fresh: unseen.length };

    // Everything seen. Serve whichever went worst, by their best score at it —
    // the set they have least mastered rather than the one they last opened.
    const scored = group.sets
      .map((set) => {
        const mine = rows.filter((r) => r.set_id === set.id);
        const best = mine.length > 0 ? Math.max(...mine.map((r) => r.correct / r.total)) : 0;
        return { set, best };
      })
      .sort((a, b) => a.best - b.best);

    return { set: scored[0].set, fresh: 0 };
  }

  // 1. Never practised at this level at all.
  if (forLevel.length === 0) {
    const first = groups[0];
    return {
      ...pickFrom(first),
      reason: "start",
      paper: first.paper,
      part: first.part,
      accuracy: null,
    };
  }

  // 2. Coverage: a part nobody has measured yet beats a part that merely
  //    scored badly once.
  const untried = groups.find(
    (g) => !forLevel.some((r) => r.paper === g.paper && r.part === g.part),
  );
  if (untried) {
    return {
      ...pickFrom(untried),
      reason: "coverage",
      paper: untried.paper,
      part: untried.part,
      accuracy: null,
    };
  }

  // 3. Everything tried, so target the weakest. Accuracy is pooled from the
  //    BEST attempt at each set, exactly as the progress page computes it —
  //    the two must never disagree about which part is the weak one.
  const scored = groups.map((group) => {
    const best = new Map<string, { correct: number; total: number }>();
    for (const row of forLevel) {
      if (row.paper !== group.paper || row.part !== group.part) continue;
      const seen = best.get(row.set_id);
      if (!seen || row.correct / row.total > seen.correct / seen.total) {
        best.set(row.set_id, { correct: row.correct, total: row.total });
      }
    }
    const correct = [...best.values()].reduce((n, b) => n + b.correct, 0);
    const total = [...best.values()].reduce((n, b) => n + b.total, 0);
    return { group, accuracy: total > 0 ? correct / total : 1 };
  });

  scored.sort((a, b) => a.accuracy - b.accuracy);
  const weakest = scored[0];
  const picked = pickFrom(weakest.group);

  return {
    ...picked,
    reason: picked.fresh > 0 ? "weakest" : "revisit",
    paper: weakest.group.paper,
    part: weakest.group.part,
    accuracy: weakest.accuracy,
  };
}
