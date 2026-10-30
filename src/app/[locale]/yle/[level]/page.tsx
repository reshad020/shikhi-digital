import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Ear, Image as ImageIcon, Mic, Type } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo/config";
import { routing } from "@/i18n/routing";
import { LEVELS, PAPER_LABELS, levelBySlug, paperQuestions, type Needs } from "@/lib/yle/syllabus";
import type { PaperKind } from "@/lib/yle/syllabus";
import { setsForLevel } from "../../../../../content/yle-practice";

/** The papers that can be practised here. Speaking is face to face. */
const PRACTISABLE_PAPERS = ["reading-writing", "listening"] as const;
import { STORY_PROMPTS } from "../../../../../content/yle-stories";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEVELS.map((level) => ({ locale, level: level.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/yle/[level]">): Promise<Metadata> {
  const { locale, level: slug } = await params;
  const level = levelBySlug(slug);
  if (!level) return { title: "Not found" };
  const t = await getTranslations({ locale, namespace: "yle" });
  return {
    title: t("levelTitle", { name: level.name }),
    description: level.blurb,
    alternates: alternatesFor(`/yle/${slug}`),
  };
}

/** What each part needs in order to be practised. Shown, not hidden. */
const NEEDS_ICON: Record<Needs, typeof Type> = {
  text: Type,
  audio: Ear,
  picture: ImageIcon,
  examiner: Mic,
};

export default async function YleLevelPage({ params }: PageProps<"/[locale]/yle/[level]">) {
  const { locale, level: slug } = await params;
  setRequestLocale(locale);

  const level = levelBySlug(slug);
  if (!level) notFound();

  const t = await getTranslations("yle");
  const sets = setsForLevel(level.slug);

  // Grouped by paper and part, in the order the real paper runs.
  const byPart = [...new Set(sets.map((s) => `${s.paper}#${s.part}`))]
    .map((key) => {
      const [paper, part] = key.split("#");
      return {
        paper: paper as PaperKind,
        part: Number(part),
        spec: level.papers
          .find((p) => p.kind === paper)
          ?.parts.find((p) => p.part === Number(part)),
        sets: sets.filter((s) => s.paper === paper && s.part === Number(part)),
      };
    })
    .sort((a, b) => a.paper.localeCompare(b.paper) || a.part - b.part);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <nav className="text-sm font-semibold text-muted-foreground">
          <Link href="/yle" className="hover:text-primary">
            {t("hubTitle")}
          </Link>
        </nav>

        <header className="mt-3">
          <span className="inline-flex items-center rounded-full bg-grape/12 px-3 py-1 font-heading text-xs font-extrabold tracking-wider text-grape uppercase">
            {level.cefr} &middot; {level.typicalAges}
          </span>
          <h1 className="mt-3 font-heading text-[2rem] leading-tight font-extrabold text-balance sm:text-4xl">
            {level.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-balance">
            {level.blurb}
          </p>
        </header>

        {/* Grouped by part, not listed flat.
            A child preparing for an exam does not want "eleven exercises", they
            want to drill the one part that keeps going wrong — and a parent
            asking "is she ready?" is asking about parts, because that is how
            the paper is built and how the weakness shows up. A flat list made
            the one useful question, *which part is this*, something you had to
            read every title to answer. */}
        {byPart.length > 0 && (
          <section className="mt-8 rounded-[1.75rem] border-2 border-grape/40 bg-grape/5 p-6">
            <h2 className="font-heading text-xl font-extrabold">{t("practiceNow")}</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {t("practiceByPart")}
            </p>

            <div className="mt-5 flex flex-col gap-6">
              {PRACTISABLE_PAPERS.map((paperKind) => {
                const parts = byPart.filter((g) => g.paper === paperKind);
                if (parts.length === 0) return null;

                return (
                  <div key={paperKind}>
                    <h3 className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                      {PAPER_LABELS[paperKind]}
                    </h3>

                    <ul className="mt-2 flex flex-col gap-2">
                      {parts.map((group) => (
                        <li key={`${group.paper}-${group.part}`}>
                          <details className="group rounded-2xl border-2 border-border bg-card">
                            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-grape/12 font-heading text-sm font-extrabold text-grape">
                                {group.part}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-heading font-extrabold">
                                  {t("partLabel", { part: group.part })}
                                </span>
                                <span className="block truncate text-xs font-semibold text-muted-foreground">
                                  {group.spec?.tests ?? ""}
                                </span>
                              </span>
                              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-extrabold">
                                {t("setsAvailable", { n: group.sets.length })}
                              </span>
                            </summary>

                            <ul className="flex flex-col gap-1.5 border-t-2 border-dashed border-border px-4 py-3">
                              {group.sets.map((set) => (
                                <li key={set.id}>
                                  <Link
                                    href={`/yle/practice/${set.id}`}
                                    className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                                  >
                                    <span className="min-w-0 flex-1 truncate">{set.title}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {t("questionCount", { n: set.questions.length })}
                                    </span>
                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Part 7 is the only task on any YLE paper that cannot be marked by
            comparing strings, so it gets its own entry rather than hiding in
            the practice list. */}
        {level.slug === "flyers" && (
          <section className="mt-6 rounded-[1.75rem] border-2 border-sunny/70 bg-sunny/10 p-6">
            <h2 className="font-heading text-xl font-extrabold">{t("storyPart")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("storyMarkedNote")}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {STORY_PROMPTS.map((story) => (
                <li key={story.id}>
                  <Link
                    href={`/yle/story/${story.id}`}
                    className="inline-flex rounded-full border-2 border-border bg-card px-4 py-2 font-heading text-sm font-bold transition-colors hover:border-primary/60"
                  >
                    {story.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-heading text-2xl font-extrabold">
            {t("whatsInIt", { name: level.name })}
          </h2>

          <div className="mt-5 flex flex-col gap-5">
            {level.papers.map((paper) => (
              <article
                key={paper.kind}
                className="rounded-[1.75rem] border-2 border-border bg-card p-6"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-xl font-extrabold">{PAPER_LABELS[paper.kind]}</h3>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t("minutes", { m: paper.minutes })}
                    {paper.kind !== "speaking" &&
                      ` · ${t("questionCount", { n: paperQuestions(paper) })}`}
                  </p>
                </header>

                <ol className="mt-4 flex flex-col gap-3">
                  {paper.parts.map((part) => {
                    const Icon = NEEDS_ICON[part.needs];
                    return (
                      <li key={part.part} className="flex gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted font-heading text-sm font-extrabold">
                          {part.part}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">{part.task}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            <Icon className="me-1 inline size-3.5" aria-hidden />
                            {part.tests}
                            {part.questions > 0 &&
                              ` · ${t("questionCount", { n: part.questions })}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
