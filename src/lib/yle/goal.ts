import "server-only";

import { createClient } from "@/lib/supabase/server";
import { todayKey } from "@/lib/daily/streak";

export type DailyGoal = {
  goal: number;
  doneToday: number;
  met: boolean;
};

/**
 * How much practice this child has done today, against what they were aiming
 * for.
 *
 * ## What counts
 *
 * Practice sets and marked stories, both of which are real work the child
 * chose to do. Lessons and the daily games are deliberately NOT counted here:
 * they feed the streak, which answers "did you show up", while this answers
 * "have you done your exam practice today". Rolling everything into one number
 * would let a child meet an exam-practice goal without doing any exam
 * practice.
 *
 * ## Counted by day, not by rolling 24 hours
 *
 * A child practising at 23:50 and again at 00:10 has practised on two days and
 * should see two days. The alternative punishes late evenings for no reason a
 * ten-year-old would accept.
 */
export async function dailyGoal(childId: string, goal: number): Promise<DailyGoal> {
  const supabase = await createClient();
  const since = `${todayKey()}T00:00:00`;

  const [sets, stories] = await Promise.all([
    supabase
      .from("yle_attempts")
      .select("*", { count: "exact", head: true })
      .eq("child_id", childId)
      .gte("created_at", since),
    supabase
      .from("yle_story_attempts")
      .select("*", { count: "exact", head: true })
      .eq("child_id", childId)
      .gte("created_at", since),
  ]);

  const doneToday = (sets.count ?? 0) + (stories.count ?? 0);

  return { goal, doneToday, met: doneToday >= goal };
}
