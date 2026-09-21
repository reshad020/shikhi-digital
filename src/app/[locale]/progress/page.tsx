import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { MoveBadge } from "@/components/levels/move-badge";
import { RankUp } from "@/components/levels/rank-up";
import { Link } from "@/i18n/navigation";
import { Progress } from "@/components/ui/progress";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { computeProfile } from "@/lib/levels/compute";
import { RANKS, gapsTo, progressTo, rankFor } from "@/lib/levels/ranks";
import { STRONG_MOVES } from "@/lib/reasoning/moves";

export default async function ProgressPage({ params }: PageProps<"/[locale]/progress">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const profile = await computeProfile(child.id);
  const { current, next } = rankFor(profile);
  const gaps = next ? gapsTo(next, profile) : [];
  const pct = next ? Math.round(progressTo(next, profile) * 100) : 100;

  const currentIndex = RANKS.findIndex((r) => r.slug === current.slug);
  const seenIndex = RANKS.findIndex((r) => r.slug === child.seen_rank);
  const promoted = currentIndex > seenIndex;

  return (
    <>
      <SiteHeader child={child} signedIn />
      {promoted && <RankUp childId={child.id} rankSlug={current.slug} rankName={current.name} />}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <section className="rounded-4xl border-2 bg-card p-7 text-center shadow-pop">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Your thinking level
          </p>
          <h1 className="mt-1 font-heading text-4xl font-extrabold text-balance">{current.name}</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground text-balance">
            {current.blurb}
          </p>

          {next && (
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <Progress value={pct} className="min-w-0 flex-1" />
                <span className="shrink-0 text-sm font-bold text-muted-foreground">
                  {next.name}
                </span>
              </div>

              {/* Named gaps rather than a bare percentage: a child can act on
                  "show one kind of thinking you have not used yet". */}
              <ul className="mt-4 flex flex-col gap-2 text-start">
                {gaps.map((gap) => (
                  <li key={gap} className="flex items-start gap-2 text-sm font-semibold">
                    <Target className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="font-heading text-2xl font-extrabold">Your thinking moves</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every kind of thinking you have shown. The grey ones are waiting for you.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STRONG_MOVES.map((move) => (
              <MoveBadge key={move} move={move} count={profile.moveCounts[move]} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6">
          <p className="flex items-center gap-2 font-heading text-lg font-bold">
            <Sparkles className="size-5 text-primary" aria-hidden />
            Where to earn the ones you are missing
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                href="/daily"
                className="flex items-center gap-2 font-bold text-primary underline underline-offset-4"
              >
                Fake or Real
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <span className="block text-sm text-muted-foreground">
                Naming the tell earns questioning and scale.
              </span>
            </li>
            <li>
              <Link
                href="/tricks"
                className="flex items-center gap-2 font-bold text-primary underline underline-offset-4"
              >
                Spot the Trick
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <span className="block text-sm text-muted-foreground">
                Earns spotting assumptions and other explanations.
              </span>
            </li>
            <li>
              <Link
                href="/learn"
                className="flex items-center gap-2 font-bold text-primary underline underline-offset-4"
              >
                Lessons
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <span className="block text-sm text-muted-foreground">
                Explaining your answer is the only way to earn the top levels.
              </span>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
