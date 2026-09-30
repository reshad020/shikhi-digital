"use client";

import { useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations, useFormatter } from "next-intl";
import { ArrowRight, Flame, PenLine, TrendingUp } from "lucide-react";
import { ChildAvatar } from "@/components/child-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useRouter } from "@/i18n/navigation";
import { selectChild } from "@/lib/data/children-actions";
import type { Attention } from "@/lib/parent/overview";

/**
 * One child, as their parent needs to see them.
 *
 * The status line is the first thing on the card and it is allowed to deliver
 * bad news. Dashboards in this category report streaks and stars and never
 * mention that nobody has opened the app in a fortnight — which is precisely
 * the fortnight the parent needed to know about, and precisely why the
 * cancellation arrives as a surprise.
 */

export type ChildCardData = {
  id: string;
  name: string;
  avatar: string;
  rankName: string;
  rankBlurb: string;
  nextRankName: string | null;
  progressPct: number;
  writtenThisWeek: number;
  needsForReport: number;
  activitiesThisWeek: number;
  daysActiveThisWeek: number;
  dailyStreak: number;
  lastActiveAt: string | null;
  reportReady: boolean;
  attention: Attention;
};

const TONE: Record<Attention["kind"], string> = {
  "never-started": "border-border bg-muted/50 text-muted-foreground",
  quiet: "border-tangerine/60 bg-tangerine/10 text-tangerine",
  slipping: "border-sunny bg-sunny/15 text-[oklch(0.42_0.1_70)] dark:text-sunny",
  steady: "border-mint/60 bg-mint/15 text-[oklch(0.38_0.09_165)] dark:text-mint",
  "first-week": "border-sky/50 bg-sky/12 text-sky",
};

export function ChildCard({ data, index }: { data: ChildCardData; index: number }) {
  const t = useTranslations("parent");
  const format = useFormatter();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // "Hand it over" is the physical reality of a family sharing one device:
  // the parent picks who is learning, then passes the tablet across.
  function handOver() {
    startTransition(async () => {
      await selectChild(data.id);
      router.push("/learn");
    });
  }

  const a = data.attention;
  const statusText =
    a.kind === "never-started"
      ? t("statusNeverStarted")
      : a.kind === "quiet"
        ? t("statusQuiet", { days: a.days })
        : a.kind === "slipping"
          ? t("statusSlipping", { thisWeek: a.thisWeek, lastWeek: a.lastWeek })
          : a.kind === "first-week"
            ? t("statusFirstWeek")
            : t("statusSteady", { days: a.daysActive });

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 24, delay: index * 0.07 }}
      className="flex flex-col gap-4 rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm"
    >
      <header className="flex items-center gap-3">
        <ChildAvatar avatar={data.avatar} className="size-12" />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl leading-tight font-extrabold">{data.name}</h3>
          <p className="text-sm font-semibold text-muted-foreground">{data.rankName}</p>
        </div>
        {data.dailyStreak > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tangerine/15 px-3 py-1 text-sm font-bold text-tangerine">
            <Flame className="size-4" aria-hidden />
            {data.dailyStreak}
          </span>
        )}
      </header>

      {/* The honest line. First, and not softened. */}
      <p className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold ${TONE[a.kind]}`}>
        {statusText}
      </p>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label={t("statExplanations")} value={data.writtenThisWeek} />
        <Stat label={t("statActivities")} value={data.activitiesThisWeek} />
        <Stat label={t("statDays")} value={data.daysActiveThisWeek} />
      </dl>

      {data.nextRankName && (
        <div>
          <div className="flex items-center gap-3">
            <Progress value={data.progressPct} className="min-w-0 flex-1" />
            <span className="shrink-0 text-xs font-bold text-muted-foreground">
              <TrendingUp className="me-1 inline size-3.5" aria-hidden />
              {data.nextRankName}
            </span>
          </div>
        </div>
      )}

      {/* The report, or an honest account of why there is not one yet. */}
      {data.reportReady ? (
        <Button
          nativeButton={false}
          className="btn-pop h-12 rounded-full font-bold"
          render={<Link href={`/report/${data.id}`} />}
        >
          {t("readReport")}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Button>
      ) : (
        <p className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground">
          <PenLine className="mt-0.5 size-4 shrink-0" aria-hidden />
          {data.needsForReport > 0
            ? t("reportNeeds", { count: data.needsForReport })
            : t("reportPending")}
        </p>
      )}

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-xs font-semibold text-muted-foreground">
          {data.lastActiveAt
            ? t("lastSeen", {
                when: format.relativeTime(new Date(data.lastActiveAt), new Date()),
              })
            : t("lastSeenNever")}
        </span>
        <Button
          variant="outline"
          disabled={pending}
          onClick={handOver}
          className="h-10 rounded-full border-2 font-bold"
        >
          {t("handOver", { name: data.name })}
        </Button>
      </footer>
    </motion.article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-2 py-3">
      <dd className="font-heading text-2xl font-extrabold">{value}</dd>
      <dt className="mt-0.5 text-[0.7rem] leading-tight font-bold text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}
