import { STRONG_MOVES, type StrongMove } from "@/lib/reasoning/moves";

/**
 * Thinking Levels.
 *
 * The rule that makes this different from every other progress bar in kids'
 * software: **you cannot level up by doing more.** Ranks are gated on the
 * *breadth* of thinking you have demonstrated and the *quality* of your
 * explanations. A child who answers two hundred questions by guessing stays a
 * Noticer; a child who reasons carefully twelve times is a Connector.
 *
 * Rank names are deliberately sayable. "Steelmanner" is something a
 * twelve-year-old will use out loud to a friend. "Level 14" is not.
 */

export type Rank = {
  slug: string;
  name: string;
  /** What this rank means, in the child's own terms. */
  blurb: string;
  /** Distinct strong moves the child must have demonstrated at least once. */
  distinctMoves: number;
  /** Explanations graded solid or better. */
  goodExplanations: number;
  /** Explanations graded excellent. */
  excellentExplanations: number;
};

export const RANKS: Rank[] = [
  {
    slug: "noticer",
    name: "Noticer",
    blurb: "You have started paying attention to how things are said, not just what they say.",
    distinctMoves: 0,
    goodExplanations: 0,
    excellentExplanations: 0,
  },
  {
    slug: "questioner",
    name: "Questioner",
    blurb: "You ask why. Three different kinds of thinking now show up in your answers.",
    distinctMoves: 3,
    goodExplanations: 2,
    excellentExplanations: 0,
  },
  {
    slug: "evidence-hunter",
    name: "Evidence Hunter",
    blurb: "You point at the actual thing that proves your case, instead of just asserting it.",
    distinctMoves: 4,
    goodExplanations: 6,
    excellentExplanations: 0,
  },
  {
    slug: "connector",
    name: "Connector",
    blurb: "You link ideas that were not sitting next to each other, and reason about size.",
    distinctMoves: 5,
    goodExplanations: 12,
    excellentExplanations: 1,
  },
  {
    slug: "challenger",
    name: "Challenger",
    blurb: "You spot the assumption underneath a claim and ask who says so.",
    distinctMoves: 6,
    goodExplanations: 20,
    excellentExplanations: 3,
  },
  {
    slug: "steelmanner",
    name: "Steelmanner",
    blurb:
      "You can make the strongest possible case against yourself. This is the rarest one, and the most useful.",
    distinctMoves: STRONG_MOVES.length,
    goodExplanations: 30,
    excellentExplanations: 6,
  },
];

export type Profile = {
  /** How many times each strong move has been demonstrated. */
  moveCounts: Record<StrongMove, number>;
  distinctMoves: number;
  goodExplanations: number;
  excellentExplanations: number;
  totalActivities: number;
};

export function rankFor(profile: Profile): { current: Rank; next: Rank | null } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    const r = RANKS[i];
    const met =
      profile.distinctMoves >= r.distinctMoves &&
      profile.goodExplanations >= r.goodExplanations &&
      profile.excellentExplanations >= r.excellentExplanations;
    if (met) index = i;
    else break;
  }
  return { current: RANKS[index], next: RANKS[index + 1] ?? null };
}

/**
 * What is actually standing between the child and the next rank.
 *
 * Returned as sentences rather than as a percentage on purpose: "you have never
 * questioned where something came from" tells a child what to do next, and a
 * bar at 64% does not.
 */
export function gapsTo(next: Rank, profile: Profile): string[] {
  const gaps: string[] = [];

  const moreMoves = next.distinctMoves - profile.distinctMoves;
  if (moreMoves > 0) {
    gaps.push(
      moreMoves === 1
        ? "Show one kind of thinking you have not used yet"
        : `Show ${moreMoves} kinds of thinking you have not used yet`,
    );
  }

  const moreGood = next.goodExplanations - profile.goodExplanations;
  if (moreGood > 0) {
    gaps.push(
      moreGood === 1
        ? "Write one more good explanation"
        : `Write ${moreGood} more good explanations`,
    );
  }

  const moreExcellent = next.excellentExplanations - profile.excellentExplanations;
  if (moreExcellent > 0) {
    gaps.push(
      moreExcellent === 1
        ? "Write one really sharp explanation"
        : `Write ${moreExcellent} really sharp explanations`,
    );
  }

  return gaps;
}

/**
 * 0-1, for the bar. Averaged across the requirements so no single one dominates.
 *
 * Requirements the rank does not actually impose are excluded rather than
 * counted as satisfied. Counting them showed a brand new child a bar already at
 * 33% for having done nothing, which is the fake-progress pattern this whole
 * feature exists to avoid.
 */
export function progressTo(next: Rank, profile: Profile): number {
  const parts: number[] = [];
  const consider = (have: number, need: number) => {
    if (need <= 0) return;
    parts.push(Math.min(have / need, 1));
  };

  consider(profile.distinctMoves, next.distinctMoves);
  consider(profile.goodExplanations, next.goodExplanations);
  consider(profile.excellentExplanations, next.excellentExplanations);

  if (parts.length === 0) return 1;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

/** Badge tier for one move. Collecting these is collecting skills. */
export function tierFor(count: number): "none" | "bronze" | "silver" | "gold" {
  if (count >= 25) return "gold";
  if (count >= 10) return "silver";
  if (count >= 3) return "bronze";
  return count > 0 ? "bronze" : "none";
}
