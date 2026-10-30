import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo/config";
import { MathsPractice } from "@/components/maths/practice";
import { TOPICS, topicBySlug } from "@/lib/maths/topics";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    TOPICS.map((topic) => ({ locale, topic: topic.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/maths/[topic]">): Promise<Metadata> {
  const { locale, topic: slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) return { title: "Not found" };

  const tt = await getTranslations({ locale, namespace: "maths.topics" });
  return {
    title: tt(`${topic.slug}.name`),
    description: tt(`${topic.slug}.blurb`),
    alternates: alternatesFor(`/maths/${topic.slug}`),
  };
}

/**
 * One maths topic.
 *
 * The big idea is stated before the first question rather than after the last.
 * A child who knows what they are looking for — "every times fact is a
 * rectangle" — sees it in the picture; a child shown the same picture with no
 * frame counts dots.
 */
export default async function MathsTopicPage({ params }: PageProps<"/[locale]/maths/[topic]">) {
  const { locale, topic: slug } = await params;
  setRequestLocale(locale);

  const topic = topicBySlug(slug);
  if (!topic) notFound();

  const t = await getTranslations("maths");
  const tt = await getTranslations("maths.topics");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <nav className="text-sm font-semibold text-muted-foreground">
          <Link href="/maths" className="hover:text-primary">
            {t("hubTitle")}
          </Link>
          {" / "}
          <span>{tt(`${topic.slug}.name`)}</span>
        </nav>

        <header className="mt-5 flex items-start gap-4">
          <span
            className="grid size-16 shrink-0 place-items-center rounded-2xl bg-grape/10 text-4xl"
            aria-hidden
          >
            {topic.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-heading text-3xl leading-tight font-extrabold text-balance">
              {tt(`${topic.slug}.name`)}
            </h1>
            <p className="mt-1 font-semibold text-muted-foreground">
              {tt(`${topic.slug}.blurb`)}
            </p>
          </div>
        </header>

        <p className="mt-6 rounded-2xl border-2 border-dashed border-grape/40 bg-grape/5 px-5 py-4 text-lg leading-relaxed font-semibold text-balance">
          {tt(`${topic.slug}.idea`)}
        </p>

        <div className="mt-8">
          <MathsPractice topic={topic} />
        </div>
      </main>
    </>
  );
}
