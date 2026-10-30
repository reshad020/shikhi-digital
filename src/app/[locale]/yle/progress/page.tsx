import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Shield, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { yleProgress, nextUp } from "@/lib/yle/progress";
import { dailyGoal } from "@/lib/yle/goal";
import { GoalRing } from "@/components/yle/goal-ring";
import { getActivityStreak } from "@/lib/daily/data";
import { NextUpCard } from "@/components/yle/next-up-card";
import {
  LEVELS,
  MAX_SHIELDS_PER_PAPER,
  PAPER_LABELS,
  levelBySlug,
} from "@/lib/yle/syllabus";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/yle/progress">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "yleProgress" });
  // Nobody else's business, and nothing here should ever be indexed.
  return { title: t("title"), robots: { index: false, follow: false } };
}

/**
 * Where this child actually is, paper by paper and part by part.
 *
 * This is the thing an account is for. Practice itself is public and free, and
 * it stays that way; what cannot exist without an account is the record of
 * having done it — the shields that accumulate, the part that keeps going
 * wrong, the answer to the only question a parent is really asking, which is
 * "is she ready?".
 *
 * Two rules govern the whole page:
 *
 * - **It never flatters.** A shield estimate drawn from one part of seven is
 *   not a prediction about a paper, so the page refuses to show one as if it
 *   were and says how much of the paper has actually been tried instead. A
 *   readiness number that is wrong in the reassuring direction is worse than
 *   no number at all, because a parent acts on it.
 * - **Every weak spot is a link.** Naming a problem and not offering the fix
 *   is how reports get read once and never opened again.
 */
export default async function YleProgressPage({
  params,
}: PageProps<"/[locale]/yle/progress">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const [t, progress, next, goal, streak] = await Promise.all([
    getTranslations("yleProgress"),
    yleProgress(child.id),
    nextUp(child.id),
    dailyGoal(child.id, child.daily_goal ?? 2),
    getActivityStreak(child.id),
  ]);

  const started = progress.filter((p) => p.attempts > 0);

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <header>
          <h1 className="font-heading text-3xl font-extrabold text-balance">
            {t("heading", { name: child.name })}
          </h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">{t("lead")}</p>
        </header>

        <div className="mt-7">
          <GoalRing goal={goal} streak={streak.days} />
        </div>

        {next && (
          <div className="mt-4">
            <NextUpCard next={next} />
          </div>
        )}

        {started.length === 0 ? (
          <section className="mt-8 flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border p-10 text-center">
            <Target className="size-10 text-muted-foreground" aria-hidden />
            <p className="font-heading text-xl font-extrabold">{t("emptyTitle")}</p>
            <p className="max-w-sm leading-relaxed text-muted-foreground">{t("emptyBody")}</p>
            <Link
              href="/yle"
              className="btn-pop mt-2 rounded-full bg-primary px-6 py-3 font-heading font-extrabold text-primary-foreground"
            >
              {t("startPractising")}
            </Link>
          </section>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {started.map((levelProgress) => {
              const level = levelBySlug(levelProgress.level as "starters" | "movers" | "flyers");
              if (!level) return null;

              return (
                <section
                  key={levelProgress.level}
                  className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-heading text-2xl font-extrabold">{level.name}</h2>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t("setsSat", { n: levelProgress.attempts })}
                    </p>
                  </div>

                  {levelProgress.papers
                    .filter((paper) => paper.total > 0)
                    .map((paper) => (
                      <div key={paper.paper} className="mt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-heading text-lg font-extrabold">
                            {PAPER_LABELS[paper.paper]}
                          </h3>

                          <div className="flex items-center gap-1" aria-hidden>
                            {Array.from({ length: MAX_SHIELDS_PER_PAPER }).map((_, i) => (
                              <Shield
                                key={i}
                                className={`size-5 ${
                                  i < paper.shields
                                    ? "fill-sunny text-sunny"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* How much of the paper this estimate rests on. Said
                            before the number is trusted, not after. */}
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          {paper.covered < paper.partsTotal
                            ? t("partialCover", {
                                covered: paper.covered,
                                total: paper.partsTotal,
                              })
                            : t("fullCover", { pct: Math.round((paper.correct / paper.total) * 100) })}
                        </p>

                        <ul className="mt-3 flex flex-col gap-1.5">
                          {paper.parts.map((part) => {
                            const spec = level.papers
                              .find((p) => p.kind === paper.paper)
                              ?.parts.find((p) => p.part === part.part);

                            const pct =
                              part.accuracy === null ? null : Math.round(part.accuracy * 100);
                            // Below 70% on a part is the thing worth naming.
                            const weak = pct !== null && pct < 70;

                            return (
                              <li
                                key={part.part}
                                className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-2.5 ${
                                  pct === null
                                    ? "border-dashed border-border text-muted-foreground"
                                    : weak
                                      ? "border-tangerine/50 bg-tangerine/8"
                                      : "border-mint/50 bg-mint/8"
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block font-heading text-sm font-extrabold">
                                    {t("partLabel", { part: part.part })}
                                  </span>
                                  {spec && (
                                    <span className="block truncate text-xs font-semibold text-muted-foreground">
                                      {spec.tests}
                                    </span>
                                  )}
                                </span>

                                <span className="shrink-0 text-end">
                                  {pct === null ? (
                                    <span className="text-xs font-bold">{t("notTried")}</span>
                                  ) : (
                                    <>
                                      <span className="block font-heading text-base font-extrabold tabular-nums">
                                        {pct}%
                                      </span>
                                      <span className="block text-xs font-semibold text-muted-foreground">
                                        {t("setsDone", { n: part.setsDone })}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>

                        <Link
                          href={`/yle/${level.slug}`}
                          className="mt-3 inline-block font-bold text-primary underline underline-offset-4"
                        >
                          {t("practiseThis")}
                        </Link>
                      </div>
                    ))}
                </section>
              );
            })}
          </div>
        )}

        {/* Said plainly, because the number above is an estimate from our own
            material and Cambridge does not publish its boundaries. */}
        <p className="mt-8 rounded-2xl border-2 border-dashed border-border px-5 py-4 text-sm leading-relaxed font-semibold text-muted-foreground">
          {t("honesty", { levels: LEVELS.length })}
        </p>
      </main>
    </>
  );
}
