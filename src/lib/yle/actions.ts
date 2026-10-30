"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { isCorrect } from "./items";
import { shieldsFor } from "./syllabus";
import { ALL_SETS } from "../../../content/yle-practice";

export type SaveResult =
  | { saved: true; shields: number; correct: number; total: number }
  | { saved: false; reason: "anonymous" };

/**
 * Records one go at a practice set.
 *
 * ## The marking is redone here
 *
 * The browser marks the set so a child sees the result instantly and so the
 * bank costs nothing to serve. But the browser is not trusted to *report* that
 * result: the client sends the answers it was given, and the score is computed
 * again on the server from the set in the catalogue. A tampered payload can
 * therefore waste a row, which nobody cares about, instead of inventing a
 * shield, which would make the whole progress view worthless.
 *
 * This is the same rule `submitStory` already follows for the story task, and
 * it is why the client sends answers rather than a score.
 *
 * ## Anonymous practice still works
 *
 * YLE practice is deliberately open to anyone without an account, so no child
 * means no row and no error. The practice itself is unaffected; what the
 * account buys is that it counted.
 */
export async function recordAttempt(input: {
  setId: string;
  /** Question id to the answer the child gave. */
  answers: Record<string, string>;
  seconds?: number;
}): Promise<SaveResult> {
  const child = await getActiveChild();
  if (!child) return { saved: false, reason: "anonymous" };

  const set = ALL_SETS.find((s) => s.id === input.setId);
  if (!set) return { saved: false, reason: "anonymous" };

  const answers = set.questions.map((q) => ({
    id: q.id,
    correct: isCorrect(q, input.answers?.[q.id] ?? ""),
  }));

  const correct = answers.filter((a) => a.correct).length;
  const total = set.questions.length;
  const shields = shieldsFor(correct, total);

  const supabase = await createClient();
  const { error } = await supabase.from("yle_attempts").insert({
    child_id: child.id,
    set_id: set.id,
    level: set.level,
    paper: set.paper,
    part: set.part,
    kind: set.kind,
    correct,
    total,
    shields,
    answers,
    // Clamped to the column's range rather than rejected: a wrong clock should
    // never cost a child the record of work they actually did.
    seconds:
      typeof input.seconds === "number" && Number.isFinite(input.seconds)
        ? Math.min(Math.max(Math.round(input.seconds), 0), 7200)
        : null,
  });

  if (error) {
    console.error("[yle] could not record attempt:", error.message);
    return { saved: false, reason: "anonymous" };
  }

  return { saved: true, shields, correct, total };
}
