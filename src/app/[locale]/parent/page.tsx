import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircleQuestion, Plus, Ruler, Settings2 } from "lucide-react";
import { ChildCard, type ChildCardData } from "@/components/parent/child-card";
import { EmailToggle } from "@/components/parent/email-toggle";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getActiveChild } from "@/lib/data/children";
import { getFamilyOverview } from "@/lib/parent/overview";
import { progressTo } from "@/lib/levels/ranks";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your family",
  // Everything on this page is about a named child. It has no business in an index.
  robots: { index: false, follow: false },
};

/**
 * The parent hub.
 *
 * Before this existed the product had no adult surface at all: signing in
 * dropped you into the child's lesson library, and the only parent-facing page
 * was one child's frozen weekly report — reachable only if that child handed
 * the device over at the right moment. A parent who wanted to know how things
 * were going had nowhere to go.
 *
 * The order of the page is the order a parent's questions arrive in:
 * who is doing what, is anyone drifting, what came back this week, what do I
 * do about it tonight, and then the settings.
 */
export default async function ParentPage({ params }: PageProps<"/[locale]/parent">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("parent");

  const [overview, activeChild] = await Promise.all([getFamilyOverview(), getActiveChild()]);

  if (overview.length === 0) redirect(`/${locale}/children?add=1`);

  const cards: ChildCardData[] = overview.map((o) => ({
    id: o.child.id,
    name: o.child.name,
    avatar: o.child.avatar,
    rankName: o.rank.name,
    rankBlurb: o.rank.blurb,
    nextRankName: o.next?.name ?? null,
    progressPct: o.next ? Math.round(progressTo(o.next, o.profile) * 100) : 100,
    writtenThisWeek: o.writtenThisWeek,
    needsForReport: o.needsForReport,
    activitiesThisWeek: o.activitiesThisWeek,
    daysActiveThisWeek: o.daysActiveThisWeek,
    dailyStreak: o.dailyStreak,
    lastActiveAt: o.lastActiveAt?.toISOString() ?? null,
    reportReady: o.needsForReport === 0,
    attention: o.attention,
  }));

  // The dinner questions from whichever child has a report this week. They are
  // the one thing on the report a parent can act on tonight, so they are
  // lifted onto the hub rather than left two clicks deep.
  const withReport = overview.find((o) => o.report);
  const questions = (withReport?.report?.dinner_questions as string[] | undefined) ?? [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("weekly_email").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <SiteHeader child={activeChild} signedIn />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <header>
          <h1 className="font-heading text-3xl font-extrabold text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {cards.map((card, i) => (
            <ChildCard key={card.id} data={card} index={i} />
          ))}
        </section>

        {questions.length > 0 && (
          <section className="mt-8 rounded-[1.75rem] border-2 border-primary/30 bg-primary/5 p-6">
            <p className="flex items-center gap-2 font-heading text-xl font-extrabold">
              <MessageCircleQuestion className="size-5 text-primary" aria-hidden />
              {t("dinnerTitle", { name: withReport!.child.name })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dinnerBlurb")}</p>
            <ol className="mt-4 flex flex-col gap-3">
              {questions.map((question, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-lg leading-snug font-medium">{question}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* The refusal, stated where a parent is looking at numbers. Every
            comparable dashboard reports time-on-app, and reporting it would
            make "longer" read as "better" — which is the opposite of what
            this product is for. */}
        <section className="mt-8 flex items-start gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-6">
          <Ruler className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-sm leading-relaxed font-semibold">
            {t("noMinutesTitle")}
            <span className="mt-1 block font-normal text-muted-foreground">
              {t("noMinutesBody")}
            </span>
          </p>
        </section>

        <section className="mt-8 flex flex-wrap items-center gap-3 rounded-[1.75rem] border-2 border-border bg-card p-6">
          <p className="flex items-center gap-2 font-heading text-lg font-extrabold">
            <Settings2 className="size-5 text-muted-foreground" aria-hidden />
            {t("settingsTitle")}
          </p>
          <div className="ms-auto flex flex-wrap items-center gap-3">
            <EmailToggle enabled={profile?.weekly_email ?? false} />
            <Button
              variant="outline"
              nativeButton={false}
              className="h-10 rounded-full border-2 font-bold"
              render={<Link href="/children?add=1" />}
            >
              <Plus className="size-4" />
              {t("addChild")}
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
