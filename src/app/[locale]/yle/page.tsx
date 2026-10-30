import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Shield } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo/config";
import { LEVELS, MAX_SHIELDS_TOTAL, PAPER_LABELS, paperQuestions } from "@/lib/yle/syllabus";
import { setsForLevel } from "../../../../content/yle-practice";

export async function generateMetadata({ params }: PageProps<"/[locale]/yle">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "yle" });
  return {
    title: t("hubTitle"),
    description: t("hubLead"),
    alternates: alternatesFor("/yle"),
  };
}

/**
 * The YLE hub.
 *
 * Public and statically rendered, like the Spot the Trick hub: a parent
 * searching "what is in the Movers exam" should land on a clear answer without
 * an account, and a crawler should be able to read all of it.
 */
export default async function YleHubPage({ params }: PageProps<"/[locale]/yle">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("yle");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-extrabold tracking-[0.18em] text-grape uppercase">
            {t("hubKicker")}
          </p>
          <h1 className="mt-3 font-heading text-[2rem] leading-[1.05] font-extrabold text-balance sm:text-5xl">
            {t("hubTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed font-medium text-muted-foreground text-balance">
            {t("hubLead")}
          </p>
        </header>

        <section className="mt-12 grid gap-5 lg:grid-cols-3">
          {LEVELS.map((level) => {
            const sets = setsForLevel(level.slug);
            return (
              <Link
                key={level.slug}
                href={`/yle/${level.slug}`}
                className="flex flex-col gap-3 rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm transition-shadow hover:shadow-float"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-grape/12 px-3 py-1 font-heading text-xs font-extrabold tracking-wider text-grape uppercase">
                  {level.cefr}
                </span>
                <h2 className="font-heading text-2xl font-extrabold">{level.name}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{level.typicalAges}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{level.blurb}</p>

                <ul className="mt-auto flex flex-col gap-1 pt-3 text-sm font-semibold">
                  {level.papers.map((paper) => (
                    <li key={paper.kind} className="flex items-center justify-between gap-2">
                      <span>{PAPER_LABELS[paper.kind]}</span>
                      <span className="text-muted-foreground">
                        {paper.kind === "speaking"
                          ? t("minutes", { m: paper.minutes })
                          : t("questionCount", { n: paperQuestions(paper) })}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="flex items-center gap-1.5 pt-2 font-bold text-primary">
                  {sets.length > 0 ? t("practiceSets", { n: sets.length }) : t("syllabusOnly")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </p>
              </Link>
            );
          })}
        </section>

        {/* The fact that reassures a worried parent fastest, and the one most
            preparation sites leave out. */}
        <section className="mt-10 flex items-start gap-4 rounded-[1.75rem] border-2 border-mint/50 bg-mint/10 p-6">
          <Shield className="mt-0.5 size-6 shrink-0 fill-mint text-mint" aria-hidden />
          <p className="text-sm leading-relaxed font-semibold">
            {t("noFailTitle")}
            <span className="mt-1 block font-normal text-muted-foreground">
              {t("noFailBody", { max: MAX_SHIELDS_TOTAL })}
            </span>
          </p>
        </section>
      </main>
    </>
  );
}
