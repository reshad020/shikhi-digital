import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Flame, PenLine, Sparkles, Trophy } from "lucide-react";
import { EntryCard, type EntryCardData } from "@/components/thinking/entry-card";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { getActivityStreak } from "@/lib/daily/data";
import { getArchive } from "@/lib/thinking/archive";
import { MOVE_LABELS, type ThinkingMove } from "@/lib/reasoning/moves";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/thinking">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "thinking" });
  // A page made entirely of a child's own writing. Never indexed.
  return { title: t("title"), robots: { index: false, follow: false } };
}

/**
 * "Everything you have written" — the child's own archive.
 *
 * The counterpart to the parent's weekly report, and arguably the more
 * important of the two: the parent gets told about their child's thinking once
 * a week, while the child previously never saw a word of it again.
 */
export default async function ThinkingPage({ params }: PageProps<"/[locale]/thinking">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("thinking");

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const [archive, streak] = await Promise.all([
    getArchive(child.id),
    getActivityStreak(child.id),
  ]);

  const label = (move: ThinkingMove) => MOVE_LABELS[move] ?? move;

  const toCard = (e: (typeof archive.entries)[number]): EntryCardData => ({
    id: e.id,
    source: e.source,
    text: e.text,
    quality: e.quality,
    moveLabels: e.moves.map(label),
    firstLabels: e.firsts.map(label),
    response: e.response,
    about: e.about,
    at: e.at.toISOString(),
  });

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <header>
          <h1 className="font-heading text-3xl font-extrabold text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {archive.entries.length === 0
              ? t("emptyLead")
              : t("lead", { count: archive.entries.length, words: archive.totalWords })}
          </p>
        </header>

        {archive.entries.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-12 text-center">
            <PenLine className="size-10 text-muted-foreground" aria-hidden />
            <p className="font-heading text-xl font-extrabold">{t("emptyTitle")}</p>
            <p className="max-w-sm text-muted-foreground">{t("emptyBody")}</p>
            <Link
              href="/learn"
              className="mt-1 font-bold text-primary underline underline-offset-4"
            >
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <>
            {/* The streak, and the days it survived. Saying the forgiveness out
                loud is the point — a rescue nobody is told about is just a
                hidden rule. */}
            {streak.days > 0 && (
              <section className="mt-7 flex flex-wrap items-center gap-3 rounded-[1.75rem] border-2 border-tangerine/50 bg-tangerine/10 p-5">
                <Flame className="size-6 shrink-0 text-tangerine" aria-hidden />
                <p className="font-heading text-lg font-extrabold">
                  {t("streak", { count: streak.days })}
                </p>
                {streak.forgiven.length > 0 && (
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t("forgiven", { count: streak.forgiven.length })}
                  </p>
                )}
              </section>
            )}

            {archive.best && (
              <section className="mt-7">
                <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold">
                  <Trophy className="size-5 text-sunny" aria-hidden />
                  {t("bestTitle")}
                </h2>
                <p className="mt-1 mb-4 text-sm text-muted-foreground">{t("bestBlurb")}</p>
                <EntryCard data={toCard(archive.best)} index={0} highlight />
              </section>
            )}

            {archive.firsts.length > 0 && (
              <section className="mt-9">
                <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold">
                  <Sparkles className="size-5 text-bubblegum" aria-hidden />
                  {t("firstsTitle")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("firstsBlurb")}</p>
                <ol className="mt-4 flex flex-col gap-2">
                  {archive.firsts.map((first) => (
                    <li
                      key={first.move}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-border bg-card px-4 py-3"
                    >
                      <span className="font-heading font-extrabold">{label(first.move)}</span>
                      <span className="ms-auto text-xs font-semibold text-muted-foreground">
                        {new Intl.DateTimeFormat(locale, {
                          day: "numeric",
                          month: "long",
                          timeZone: "UTC",
                        }).format(first.at)}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mt-9">
              <h2 className="font-heading text-xl font-extrabold">{t("allTitle")}</h2>
              <div className="mt-4 flex flex-col gap-4">
                {/* The pinned piece is excluded rather than repeated. A gap in
                    the chronology is fine; the same card twice on one screen
                    makes the archive look padded, which is the opposite of the
                    impression a child's own writing should give. */}
                {archive.entries
                  .filter((entry) => entry.id !== archive.best?.id)
                  .map((entry, i) => (
                    <EntryCard key={entry.id} data={toCard(entry)} index={i} />
                  ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
