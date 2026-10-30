"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { routing, type Locale } from "@/i18n/routing";
import { MOVE_LABELS, type ThinkingMove } from "@/lib/reasoning/moves";
import { gradeReasoning } from "@/lib/reasoning/grade";
import { MAX_REASONING_CHARS, MIN_REASONING_CHARS } from "@/lib/reasoning/schema";
import { getTranscriptForPlayback, type ListeningOption } from "./data";

/** Fetches the words to speak. Kept out of the page payload until play is pressed. */
export async function fetchTranscript(passageId: string): Promise<string | null> {
  const child = await getActiveChild();
  if (!child) return null;
  return getTranscriptForPlayback(passageId);
}

export type ListeningResult =
  | {
      ok: true;
      recallCorrect: boolean;
      inferenceCorrect: boolean;
      recallFeedback: string;
      inferenceFeedback: string;
      quality: "developing" | "solid" | "excellent";
      moves: { slug: string; label: string }[];
      response: string;
      pushback: string;
      /** Revealed only now, so a child can check what they actually missed. */
      title: string;
      transcript: string;
    }
  | { ok: false; error: string };

/**
 * Grades one listening attempt.
 *
 * Everything that decides the outcome is re-read from the database: the client
 * sends two option indexes, the number of times it played the audio, and the
 * child's written reason. It never sends the transcript, which option was
 * right, or any feedback text — so a modified payload cannot mark itself
 * correct, and the transcript cannot be fished out before the questions are
 * answered.
 *
 * The written reason goes through the same grader every other written activity
 * uses, with the transcript as the context it is allowed to push back from.
 */
export async function submitListening(input: {
  passageId: string;
  recallIndex: number;
  inferenceIndex: number;
  plays: number;
  text: string;
}): Promise<ListeningResult> {
  const text = input.text.trim();

  if (text.length < MIN_REASONING_CHARS) return { ok: false, error: "tooShort" };
  if (text.length > MAX_REASONING_CHARS) return { ok: false, error: "tooLong" };

  try {
    const child = await getActiveChild();
    if (!child) return { ok: false, error: "noChild" };

    const supabase = await createClient();

    const { data: passage } = await supabase
      .from("listening_passages")
      .select("*")
      .eq("id", input.passageId)
      .eq("status", "ready")
      .maybeSingle();

    if (!passage) return { ok: false, error: "notFound" };

    const recall = (passage.recall_options as ListeningOption[]) ?? [];
    const inference = (passage.inference_options as ListeningOption[]) ?? [];

    const pickedRecall = recall[input.recallIndex];
    const pickedInference = inference[input.inferenceIndex];
    if (!pickedRecall || !pickedInference) return { ok: false, error: "badInput" };

    const locale = (
      routing.locales.includes(passage.locale as Locale) ? passage.locale : routing.defaultLocale
    ) as Locale;

    const correctInference = inference.find((o) => o.isCorrect);

    // The transcript is the "what they just read" context, so pushback can stay
    // inside the passage instead of becoming homework.
    const { verdict } = await gradeReasoning({
      locale,
      sceneSummary: passage.transcript,
      question: passage.inference_question,
      chosenAnswer: pickedInference.text,
      answerCorrect: pickedInference.isCorrect,
      correctAnswer: correctInference?.text ?? "",
      childText: text,
    });

    const { error } = await supabase.from("listening_attempts").insert({
      child_id: child.id,
      passage_id: passage.id,
      // Clamped to the column's check constraint: a client claiming it played
      // the audio four hundred times should not fail the insert.
      plays: Math.min(Math.max(Math.round(input.plays) || 1, 1), 20),
      recall_correct: pickedRecall.isCorrect,
      inference_correct: pickedInference.isCorrect,
      text,
      quality: verdict.quality,
      moves: verdict.moves,
      response: verdict.response,
      pushback: verdict.pushback,
      flagged: verdict.flagged,
    });

    // 23505 = already done this passage. Not worth an error screen; they still
    // get to read the verdict they just earned.
    if (error && error.code !== "23505") throw error;

    // Deliberately not revalidating: the verdict, the transcript reveal and the
    // pushback are the whole payoff, and re-rendering would swap in the next
    // passage the instant the child earned them.
    return {
      ok: true,
      recallCorrect: pickedRecall.isCorrect,
      inferenceCorrect: pickedInference.isCorrect,
      recallFeedback: pickedRecall.feedback,
      inferenceFeedback: pickedInference.feedback,
      quality: verdict.quality,
      moves: verdict.moves.map((slug) => ({
        slug,
        label: MOVE_LABELS[slug as ThinkingMove] ?? slug,
      })),
      response: verdict.response,
      pushback: verdict.pushback,
      title: passage.title,
      transcript: passage.transcript,
    };
  } catch (error) {
    console.error("[listening] submit failed:", error);
    return { ok: false, error: "service" };
  }
}
