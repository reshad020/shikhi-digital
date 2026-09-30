import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listChildren } from "@/lib/data/children";
import { computeProfile } from "@/lib/levels/compute";
import { rankFor, type Profile, type Rank } from "@/lib/levels/ranks";
import { MIN_ATTEMPTS_FOR_REPORT, startOfWeek } from "@/lib/report/analyse";
import { todayKey } from "@/lib/daily/data";
import { computeStreak } from "@/lib/daily/streak";
import type { Child, WeeklyReportRow } from "@/lib/supabase/types";

/**
 * Everything the parent hub shows, for every child, in one call.
 *
 * Two things this deliberately does NOT do:
 *
 * 1. **It does not estimate minutes.** Every other dashboard in this category
 *    reports time-on-app, and doing so would quietly make "longer" look like
 *    "better" — which is the opposite of what this product sells. Days active
 *    and activities completed are real counts from real rows; a minutes figure
 *    would be a guess dressed as a measurement.
 *
 * 2. **It does not hide a bad week.** The single biggest reason a family
 *    cancels a children's learning subscription is that the child quietly
 *    stopped using it, and the product kept saying nothing. `attention` is
 *    computed honestly and can say "nobody has been here in eleven days" on a
 *    page whose job is to justify a subscription.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** What needs saying about this child, if anything. Ordered by urgency. */
export type Attention =
  | { kind: "never-started" }
  | { kind: "quiet"; days: number }
  | { kind: "slipping"; thisWeek: number; lastWeek: number }
  | { kind: "steady"; daysActive: number }
  | { kind: "first-week" };

export type ChildOverview = {
  child: Child;
  rank: Rank;
  next: Rank | null;
  /** Returned so callers can render a progress bar without recomputing it. */
  profile: Profile;
  /** Written explanations this week — what the weekly report is gated on. */
  writtenThisWeek: number;
  needsForReport: number;
  activitiesThisWeek: number;
  activitiesLastWeek: number;
  daysActiveThisWeek: number;
  dailyStreak: number;
  lastActiveAt: Date | null;
  report: WeeklyReportRow | null;
  attention: Attention;
};

type Row = { childId: string; at: Date; written: boolean };

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function decideAttention(input: {
  total: number;
  lastActiveAt: Date | null;
  thisWeek: number;
  lastWeek: number;
  daysActiveThisWeek: number;
  createdAt: Date;
}): Attention {
  if (input.total === 0) return { kind: "never-started" };

  const quietDays = input.lastActiveAt
    ? Math.floor((Date.now() - input.lastActiveAt.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  // Seven days of nothing is the signal worth interrupting a parent for. Said
  // plainly, because a dashboard that only ever reports good news is one a
  // parent learns to stop reading.
  if (quietDays >= 7) return { kind: "quiet", days: quietDays };

  // A profile younger than a week has no previous week to fall from, so the
  // trend comparison below would read every new child as "slipping".
  if (Date.now() - input.createdAt.getTime() < WEEK_MS) return { kind: "first-week" };

  if (input.lastWeek >= 3 && input.thisWeek < Math.ceil(input.lastWeek / 2)) {
    return { kind: "slipping", thisWeek: input.thisWeek, lastWeek: input.lastWeek };
  }

  return { kind: "steady", daysActive: input.daysActiveThisWeek };
}

export async function getFamilyOverview(): Promise<ChildOverview[]> {
  const children = await listChildren();
  if (children.length === 0) return [];

  const supabase = await createClient();
  const ids = children.map((c) => c.id);
  const week = startOfWeek(new Date());
  const weekKey = dayKey(week);

  // One read per activity table for the WHOLE family rather than per child.
  // Row level security still scopes these to this parent's children; the `in`
  // filter is about the number of round trips, not about access.
  const [reasoning, steelman, daily, puzzles, reports] = await Promise.all([
    supabase.from("reasoning_attempts").select("child_id, created_at").in("child_id", ids),
    supabase.from("steelman_attempts").select("child_id, created_at").in("child_id", ids),
    supabase
      .from("challenge_attempts")
      .select("child_id, created_at, daily_challenges(publish_on)")
      .in("child_id", ids),
    supabase.from("puzzle_attempts").select("child_id, created_at").in("child_id", ids),
    supabase.from("weekly_reports").select("*").in("child_id", ids).eq("week_start", weekKey),
  ]);

  const rows: Row[] = [
    ...(reasoning.data ?? []).map((r) => ({
      childId: r.child_id,
      at: new Date(r.created_at),
      written: true,
    })),
    ...(steelman.data ?? []).map((r) => ({
      childId: r.child_id,
      at: new Date(r.created_at),
      written: true,
    })),
    ...(daily.data ?? []).map((r) => ({
      childId: r.child_id,
      at: new Date(r.created_at),
      written: false,
    })),
    ...(puzzles.data ?? []).map((r) => ({
      childId: r.child_id,
      at: new Date(r.created_at),
      written: false,
    })),
  ];

  // Streaks come from the same batched read, and count EVERY activity — the
  // same rule the child is shown, so the two never disagree.
  const streakDays = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = streakDays.get(row.childId) ?? new Set<string>();
    set.add(dayKey(row.at));
    streakDays.set(row.childId, set);
  }
  // Fake or Real is dated by the day it was published for, not the moment it
  // was answered, so a late-night play still lands on its own day.
  for (const row of daily.data ?? []) {
    const publishOn = (row.daily_challenges as { publish_on: string } | null)?.publish_on;
    if (!publishOn) continue;
    streakDays.get(row.child_id)?.add(publishOn);
  }

  const weekStartMs = week.getTime();
  const prevWeekStartMs = weekStartMs - WEEK_MS;

  // The rank is the one figure a parent reads as "is this working", so it is
  // taken from computeProfile rather than recalculated here — one source of
  // truth for a rank, even at the cost of a few extra round trips per child.
  const profiles = await Promise.all(children.map((c) => computeProfile(c.id)));

  return children.map((child, i) => {
    const mine = rows.filter((r) => r.childId === child.id);

    const thisWeek = mine.filter((r) => r.at.getTime() >= weekStartMs);
    const lastWeek = mine.filter(
      (r) => r.at.getTime() >= prevWeekStartMs && r.at.getTime() < weekStartMs,
    );

    const lastActiveAt = mine.reduce<Date | null>(
      (latest, r) => (!latest || r.at > latest ? r.at : latest),
      null,
    );

    const writtenThisWeek = thisWeek.filter((r) => r.written).length;
    const { current, next } = rankFor(profiles[i]);

    return {
      child,
      rank: current,
      next,
      profile: profiles[i],
      writtenThisWeek,
      needsForReport: Math.max(MIN_ATTEMPTS_FOR_REPORT - writtenThisWeek, 0),
      activitiesThisWeek: thisWeek.length,
      activitiesLastWeek: lastWeek.length,
      daysActiveThisWeek: new Set(thisWeek.map((r) => dayKey(r.at))).size,
      dailyStreak: computeStreak(streakDays.get(child.id) ?? new Set()).days,
      lastActiveAt,
      report: (reports.data ?? []).find((r) => r.child_id === child.id) ?? null,
      attention: decideAttention({
        total: mine.length,
        lastActiveAt,
        thisWeek: thisWeek.length,
        lastWeek: lastWeek.length,
        daysActiveThisWeek: new Set(thisWeek.map((r) => dayKey(r.at))).size,
        createdAt: new Date(child.created_at),
      }),
    };
  });
}

/** Whether today's daily challenge is still unplayed, across the family. */
export function playedToday(overview: ChildOverview) {
  return overview.lastActiveAt ? dayKey(overview.lastActiveAt) === todayKey() : false;
}
