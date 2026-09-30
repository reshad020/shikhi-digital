import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type DailyChallenge = Tables<"daily_challenges">;
export type ChallengeAttempt = Tables<"challenge_attempts">;

// Defined in ./streak, which is pure so the streak rule can be tested outside
// a request. Re-exported here because every existing caller imports it from
// this module.
export { todayKey } from "./streak";
import { computeStreak, todayKey, type Streak } from "./streak";

/**
 * Today's challenge for a locale, falling back to English.
 *
 * The RLS policy already refuses any row dated in the future, so a child cannot
 * fetch tomorrow's answer even by guessing an id.
 */
export async function getTodaysChallenge(locale: string): Promise<DailyChallenge | null> {
  const supabase = await createClient();

  for (const code of [locale, "en"]) {
    const { data } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("locale", code)
      .eq("status", "ready")
      .lte("publish_on", todayKey())
      .order("publish_on", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }
  return null;
}

export async function getAttempt(
  childId: string,
  challengeId: string,
): Promise<ChallengeAttempt | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("challenge_attempts")
    .select("*")
    .eq("child_id", childId)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  return data;
}

/**
 * The streak a child actually sees: any activity, in any part of the product.
 *
 * `getStreak` above counts Fake or Real alone and is kept only for the daily
 * game's own "you have played N days running" line. This is the one every
 * other surface uses, because a child who wrote three explanations and argued
 * a steelman has plainly shown up — and telling them otherwise punishes the
 * exact behaviour the product wants most.
 */
export async function getActivityStreak(childId: string): Promise<Streak> {
  const supabase = await createClient();

  const [reasoning, steelman, daily, puzzles] = await Promise.all([
    supabase.from("reasoning_attempts").select("created_at").eq("child_id", childId),
    supabase.from("steelman_attempts").select("created_at").eq("child_id", childId),
    supabase
      .from("challenge_attempts")
      .select("created_at, daily_challenges(publish_on)")
      .eq("child_id", childId),
    supabase.from("puzzle_attempts").select("created_at").eq("child_id", childId),
  ]);

  const days = new Set<string>();
  for (const row of [
    ...(reasoning.data ?? []),
    ...(steelman.data ?? []),
    ...(puzzles.data ?? []),
  ]) {
    days.add(String(row.created_at).slice(0, 10));
  }
  for (const row of daily.data ?? []) {
    const publishOn = (row.daily_challenges as { publish_on: string } | null)?.publish_on;
    days.add(publishOn ?? String(row.created_at).slice(0, 10));
  }

  return computeStreak(days);
}
