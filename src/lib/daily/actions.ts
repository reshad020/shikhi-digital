"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { TELLS, type Tell } from "./tells";
import { todayKey } from "./data";

export type ChallengeResult =
  | {
      ok: true;
      pickedCorrectly: boolean;
      tellCorrect: boolean;
      correctTell: Tell;
      explanation: string;
      sourceNote: string;
      streak: number;
    }
  | { ok: false; error: string };

/**
 * One submission per child per challenge, enforced by a unique constraint. A
 * daily challenge you can retry until it is right is not a habit, and the
 * "picked correctly" figure would stop meaning anything.
 */
export async function submitChallenge(input: {
  challengeId: string;
  pickedFalse: "true_claim" | "false_claim";
  chosenTell: string;
}): Promise<ChallengeResult> {
  if (!TELLS.includes(input.chosenTell as Tell)) {
    return { ok: false, error: "badInput" };
  }

  try {
    const child = await getActiveChild();
    if (!child) return { ok: false, error: "noChild" };

    const supabase = await createClient();

    // Re-read the challenge server-side: the client never tells us which claim
    // was false, and the RLS policy refuses anything dated in the future.
    const { data: challenge } = await supabase
      .from("daily_challenges")
      .select("id, tell, explanation, source_note, publish_on")
      .eq("id", input.challengeId)
      .eq("status", "ready")
      .lte("publish_on", todayKey())
      .maybeSingle();

    if (!challenge) return { ok: false, error: "notFound" };

    const pickedCorrectly = input.pickedFalse === "false_claim";
    const tellCorrect = input.chosenTell === challenge.tell;

    const { error } = await supabase.from("challenge_attempts").insert({
      child_id: child.id,
      challenge_id: challenge.id,
      picked_correctly: pickedCorrectly,
      tell_correct: tellCorrect,
      chosen_tell: input.chosenTell,
    });

    // 23505 = already answered today. Not an error worth showing a child.
    if (error && error.code !== "23505") throw error;

    const { getStreak } = await import("./data");
    const streak = await getStreak(child.id);

    // Deliberately NOT revalidating this path. The result — why the false claim
    // fails, and where the true one came from — is the entire point of the
    // exercise, and it is rendered client-side from what we return here.
    // Invalidating the page swaps in the "already played" card and takes the
    // explanation away the instant the child earns it.
    return {
      ok: true,
      pickedCorrectly,
      tellCorrect,
      correctTell: challenge.tell as Tell,
      explanation: challenge.explanation,
      sourceNote: challenge.source_note,
      streak,
    };
  } catch (error) {
    console.error("[daily] submit failed:", error);
    return { ok: false, error: "service" };
  }
}
