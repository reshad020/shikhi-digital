import "server-only";

import { createClient } from "@/lib/supabase/server";
import { LEVELS, shieldsFor, type PaperKind } from "./syllabus";
import { chooseNext, type AttemptRow, type NextUp } from "./next";

/**
 * What a child has actually done, per part of per paper.
 *
 * ## Best, not latest
 *
 * Every figure here comes from the **best** attempt at each set, never the
 * most recent. A child preparing for an exam is meant to sit the same part
 * again next week; if the newest score replaced the old one, a bad morning
 * would erase a good one and trying again would carry a risk. Repetition is
 * the product, so repetition must be safe.
 *
 * ## Why the paper estimate is pooled rather than averaged
 *
 * The real paper awards up to five shields for a whole paper, not per part. So
 * the estimate pools the correct answers and the question counts across each
 * part's best attempt and runs the same curve once, which is what the exam
 * does. Averaging per-part shields would quietly round a child upward: five
 * parts at 2.6 shields each is not a 3-shield paper.
 *
 * ## What it refuses to say
 *
 * `covered` reports how many of the paper's parts the child has attempted at
 * all. A shield estimate drawn from two parts out of seven is not a prediction
 * about the paper and the UI must not render it as one, so the number it would
 * need to say that is returned alongside rather than folded in.
 */

export type PartProgress = {
  paper: PaperKind;
  part: number;
  /** Distinct sets tried. The bank is large, so this is the useful count. */
  setsDone: number;
  attempts: number;
  /** Pooled across the best attempt at each set in this part. */
  correct: number;
  total: number;
  /** Null until something has been attempted. */
  accuracy: number | null;
};

export type PaperProgress = {
  paper: PaperKind;
  parts: PartProgress[];
  /** Parts of this paper the child has attempted, out of the parts that exist. */
  covered: number;
  partsTotal: number;
  correct: number;
  total: number;
  /** The five-shield estimate. Meaningless until `covered` is most of the paper. */
  shields: number;
};

export type LevelProgress = {
  level: string;
  papers: PaperProgress[];
  /** Out of 15, as the certificate reports it. Speaking is never included. */
  shields: number;
  attempts: number;
  lastAt: string | null;
};

type Row = {
  set_id: string;
  level: string;
  paper: string;
  part: number;
  correct: number;
  total: number;
  created_at: string;
};

export async function yleProgress(childId: string): Promise<LevelProgress[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("yle_attempts")
    .select("set_id, level, paper, part, correct, total, created_at")
    .eq("child_id", childId);

  const rows = (data ?? []) as Row[];

  // Best attempt per set. Ties go to whichever came first, which does not
  // matter — the score is the same.
  const best = new Map<string, Row>();
  for (const row of rows) {
    const key = `${row.level}/${row.set_id}`;
    const seen = best.get(key);
    const better =
      !seen || row.correct / row.total > seen.correct / seen.total;
    if (better) best.set(key, row);
  }

  const attemptsBySet = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.level}/${row.set_id}`;
    attemptsBySet.set(key, (attemptsBySet.get(key) ?? 0) + 1);
  }

  return LEVELS.map((level) => {
    const mine = [...best.entries()].filter(([key]) => key.startsWith(`${level.slug}/`));

    const papers: PaperProgress[] = level.papers
      // Speaking is face to face and cannot be practised here, so it is absent
      // rather than shown at zero — a nought a child cannot move is
      // discouraging and says nothing true.
      .filter((paper) => paper.kind !== "speaking")
      .map((paper) => {
        const parts: PartProgress[] = paper.parts.map((part) => {
          const forPart = mine.filter(
            ([, r]) => r.paper === paper.kind && r.part === part.part,
          );

          const correct = forPart.reduce((n, [, r]) => n + r.correct, 0);
          const total = forPart.reduce((n, [, r]) => n + r.total, 0);

          return {
            paper: paper.kind,
            part: part.part,
            setsDone: forPart.length,
            attempts: forPart.reduce((n, [key]) => n + (attemptsBySet.get(key) ?? 0), 0),
            correct,
            total,
            accuracy: total > 0 ? correct / total : null,
          };
        });

        const correct = parts.reduce((n, p) => n + p.correct, 0);
        const total = parts.reduce((n, p) => n + p.total, 0);

        return {
          paper: paper.kind,
          parts,
          covered: parts.filter((p) => p.setsDone > 0).length,
          partsTotal: paper.parts.length,
          correct,
          total,
          shields: shieldsFor(correct, total),
        };
      });

    const levelRows = rows.filter((r) => r.level === level.slug);

    return {
      level: level.slug,
      papers,
      // Out of 15 on the certificate, but speaking is not practised here, so
      // only the two papers that can be are counted and the UI says so.
      shields: papers.reduce((n, p) => n + (p.total > 0 ? p.shields : 0), 0),
      attempts: levelRows.length,
      lastAt:
        levelRows.length > 0
          ? levelRows.map((r) => r.created_at).sort().at(-1)!
          : null,
    };
  });
}

/**
 * Sets this child has already seen, so practice can serve something new.
 *
 * Returned as a Set of ids rather than filtered in SQL: the bank lives in
 * content files, so the database has no table to exclude against.
 */
export async function seenSetIds(childId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("yle_attempts")
    .select("set_id")
    .eq("child_id", childId);

  return new Set((data ?? []).map((r) => r.set_id));
}

/**
 * What to practise next, fetched.
 *
 * The decision is in `next.ts` and has no database in it; this is only the
 * read. It sits beside `yleProgress` because the two want the same rows, and
 * the two must never disagree about which part is the weak one.
 */
export async function nextUp(childId: string, preferLevel?: string): Promise<NextUp | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("yle_attempts")
    .select("set_id, level, paper, part, correct, total, created_at")
    .eq("child_id", childId);

  return chooseNext((data ?? []) as AttemptRow[], preferLevel);
}
