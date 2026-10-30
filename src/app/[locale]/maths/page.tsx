import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Eye } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo/config";
import { TOPICS } from "@/lib/maths/topics";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/maths">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "maths" });
  return {
    title: t("hubTitle"),
    description: t("hubLead"),
    alternates: alternatesFor("/maths"),
  };
}

/**
 * The maths hub.
 *
 * Public and statically rendered, like the YLE hub. Every question here is
 * marked in the browser and nothing is written to the database, so an
 * anonymous child costs nothing to serve — and letting one try before anyone
 * is asked for an email is the single best argument the site has.
 */
export default async function MathsHubPage({ params }: PageProps<"/[locale]/maths">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("maths");
  const tt = await getTranslations("maths.topics");

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
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed font-medium text-balance text-muted-foreground">
            {t("hubLead")}
          </p>
        </header>

        <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/maths/${topic.slug}`}
              className="group flex flex-col gap-3 rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm transition-shadow hover:shadow-float"
            >
              <span
                className="grid size-14 place-items-center rounded-2xl bg-grape/10 text-3xl transition-transform group-hover:scale-110"
                aria-hidden
              >
                {topic.emoji}
              </span>
              <h2 className="font-heading text-2xl font-extrabold">
                {tt(`${topic.slug}.name`)}
              </h2>
              <p className="leading-relaxed font-semibold text-muted-foreground">
                {tt(`${topic.slug}.blurb`)}
              </p>

              <p className="mt-auto flex items-center gap-1.5 pt-3 font-bold text-primary">
                {t("questionCount", { n: topic.questions.length })}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </p>
            </Link>
          ))}
        </section>

        {/* Why the pictures are here at all. Written for the parent reading
            over a shoulder, not for the child. */}
        <section className="mt-10 flex items-start gap-4 rounded-[1.75rem] border-2 border-sky/50 bg-sky/10 p-6">
          <Eye className="mt-0.5 size-6 shrink-0 text-sky" aria-hidden />
          <p className="text-sm leading-relaxed font-semibold">
            {t("whyTitle")}
            <span className="mt-1 block font-normal text-muted-foreground">{t("whyBody")}</span>
          </p>
        </section>
      </main>
    </>
  );
}
