"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { parseStoryboard } from "@/lib/storyboard/schema";
import { routing, type Locale } from "@/i18n/routing";
import { gradeReasoning } from "./grade";
import { MAX_REASONING_CHARS, MIN_REASONING_CHARS, type Verdict } from "./schema";

export type SubmitResult =
  | { ok: true; verdict: Verdict }
  | { ok: false; error: string; kind: "input" | "service" };

/** A child re-reading and re-answering is good. A loop hammering the API is not. */
const MAX_ATTEMPTS_PER_QUESTION = 3;

export async function submitReasoning(input: {
  lessonId: string;
  questionId: string;
  choiceIndex: number;
  text: string;
}): Promise<SubmitResult> {
  const text = input.text.trim();

  if (text.length < MIN_REASONING_CHARS) {
    return { ok: false, kind: "input", error: "tooShort" };
  }
  if (text.length > MAX_REASONING_CHARS) {
    return { ok: false, kind: "input", error: "tooLong" };
  }

  try {
    // Whose work this is comes from the session and the active-child cookie,
    // never from the client. A caller cannot write into another child's history.
    const child = await getActiveChild();
    if (!child) return { ok: false, kind: "input", error: "noChild" };

    const supabase = await createClient();

    // Re-derived from the database: the client sends a question id and a choice
    // index, never the wording and never which option is correct.
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, locale, storyboard")
      .eq("id", input.lessonId)
      .eq("status", "ready")
      .maybeSingle();

    const storyboard = parseStoryboard(lesson?.storyboard);
    if (!lesson || !storyboard) {
      return { ok: false, kind: "input", error: "notFound" };
    }

    const question = storyboard.quiz.find((q) => q.id === input.questionId);
    const chosen = question?.options[input.choiceIndex];
    const correct = question?.options.find((o) => o.isCorrect);
    if (!question || !chosen || !correct) {
      return { ok: false, kind: "input", error: "notFound" };
    }

    const { count } = await supabase
      .from("reasoning_attempts")
      .select("id", { count: "exact", head: true })
      .eq("child_id", child.id)
      .eq("lesson_id", lesson.id)
      .eq("question_id", question.id);

    if ((count ?? 0) >= MAX_ATTEMPTS_PER_QUESTION) {
      return { ok: false, kind: "input", error: "tooMany" };
    }

    const locale = (
      routing.locales.includes(lesson.locale as Locale) ? lesson.locale : routing.defaultLocale
    ) as Locale;

    const { verdict } = await gradeReasoning({
      locale,
      // Pushback has to stay answerable from what the child actually read.
      sceneSummary: storyboard.scenes
        .map((scene) => `${scene.title}: ${scene.narration}`)
        .join("\n"),
      question: question.question,
      chosenAnswer: chosen.text,
      answerCorrect: chosen.isCorrect,
      correctAnswer: correct.text,
      childText: text,
    });

    // Written after grading, so a failed call leaves no half-row. Flagged
    // attempts are stored too — those are precisely the ones a human needs.
    const { error } = await supabase.from("reasoning_attempts").insert({
      child_id: child.id,
      lesson_id: lesson.id,
      question_id: question.id,
      answer_correct: chosen.isCorrect,
      text,
      quality: verdict.quality,
      moves: verdict.moves,
      response: verdict.response,
      pushback: verdict.pushback,
      flagged: verdict.flagged,
    });
    if (error) throw error;

    return { ok: true, verdict };
  } catch (error) {
    // A child must never meet a stack trace. They wrote something thoughtful;
    // the least we owe them is a calm reply with their words still on screen.
    console.error("[reasoning] submit failed:", error);
    return { ok: false, kind: "service", error: "service" };
  }
}
