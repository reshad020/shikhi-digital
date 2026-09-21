import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type DailyChallenge = Tables<"daily_challenges">;
export type ChallengeAttempt = Tables<"challenge_attempts">;

/** UTC day key, so "today" means the same thing on the server and in the database. */
export function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

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
 * Consecutive days ending today or yesterday.
 *
 * Yesterday still counts as alive: a child who has not played *yet today* has
 * not broken anything, and showing a zeroed streak before they have had the
 * chance is both wrong and discouraging.
 */
export async function getStreak(childId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("challenge_attempts")
    .select("created_at, daily_challenges(publish_on)")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(400);

  const days = new Set<string>();
  for (const row of data ?? []) {
    const publishOn = (row.daily_challenges as { publish_on: string } | null)?.publish_on;
    days.add(publishOn ?? String(row.created_at).slice(0, 10));
  }
  if (days.size === 0) return 0;

  const cursor = new Date(`${todayKey()}T00:00:00Z`);
  if (!days.has(todayKey())) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
