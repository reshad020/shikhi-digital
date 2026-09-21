"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { TECHNIQUE_SLUGS, getTechnique } from "./techniques";

export type PuzzleResult =
  | { ok: true; correct: boolean; answer: string; answerLabel: string; explanation: string }
  | { ok: false; error: string };

export async function submitPuzzle(input: {
  puzzleId: string;
  chosen: string;
}): Promise<PuzzleResult> {
  if (!TECHNIQUE_SLUGS.includes(input.chosen)) return { ok: false, error: "badInput" };

  try {
    const child = await getActiveChild();
    if (!child) return { ok: false, error: "noChild" };

    const supabase = await createClient();

    // The answer is never sent to the client with the puzzle — it is read back
    // here, so the correct technique cannot be found in the page payload.
    const { data: puzzle } = await supabase
      .from("trick_puzzles")
      .select("id, technique, explanation")
      .eq("id", input.puzzleId)
      .eq("status", "ready")
      .maybeSingle();

    if (!puzzle) return { ok: false, error: "notFound" };

    const correct = input.chosen === puzzle.technique;

    const { error } = await supabase.from("puzzle_attempts").insert({
      child_id: child.id,
      puzzle_id: puzzle.id,
      correct,
      chosen: input.chosen,
    });
    if (error && error.code !== "23505") throw error;

    return {
      ok: true,
      correct,
      answer: puzzle.technique,
      answerLabel: getTechnique(puzzle.technique)?.label ?? puzzle.technique,
      explanation: puzzle.explanation,
    };
  } catch (error) {
    console.error("[tricks] submit failed:", error);
    return { ok: false, error: "service" };
  }
}
