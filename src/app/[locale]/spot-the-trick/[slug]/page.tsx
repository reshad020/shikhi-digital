import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ArtefactView } from "@/components/tricks/artefact";
import { TECHNIQUES, getTechnique } from "@/lib/tricks/techniques";
import { faqsFor } from "@/lib/tricks/faq";
import { MOVE_LABELS } from "@/lib/reasoning/moves";
import { alternatesFor } from "@/lib/seo/config";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToSchema,
} from "@/lib/seo/schema";

export function generateStaticParams() {
  return TECHNIQUES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/spot-the-trick/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const technique = getTechnique(slug);
  if (!technique) return { title: "Not found" };

  return {
    title: `${technique.label}: what it is and how to spot it`,
    description: technique.definition,
    alternates: alternatesFor(`/spot-the-trick/${slug}`),
    openGraph: { title: technique.label, description: technique.definition },
  };
}

export default async function TechniquePage({
  params,
}: PageProps<"/[locale]/spot-the-trick/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const technique = getTechnique(slug);
  if (!technique) notFound();

  const faqs = faqsFor(technique);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema(
              [
                { name: "Spot the Trick", path: "/spot-the-trick" },
                { name: technique.label, path: `/spot-the-trick/${technique.slug}` },
              ],
              locale,
            ),
            buildHowToSchema({
              name: `How to spot ${technique.label.toLowerCase()}`,
              description: technique.definition,
              steps: technique.howToSpot.map((text, i) => ({
                name: `Step ${i + 1}`,
                text,
              })),
            }),
            buildFaqSchema(faqs),
          ]),
        }}
      />

      <Link
        href="/spot-the-trick"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        Spot the Trick
      </Link>

      <h1 className="mt-4 font-heading text-4xl font-extrabold text-balance">{technique.label}</h1>

      {/* Answer-first: 40-55 words, self-contained, before any other prose. */}
      <p className="mt-5 text-lg leading-relaxed">
        <strong>Short answer:</strong> {technique.definition} The question to ask is:{" "}
        <em>{technique.askYourself}</em>
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">Here it is in the wild</h2>
        <p className="mt-2 text-muted-foreground">
          Made up for this page, but built the way real ones are.
        </p>
        <ArtefactView artefact={technique.example} className="mt-4" />
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">
          How to spot {technique.label.toLowerCase()}
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {technique.howToSpot.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-lg leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">Why it works on people</h2>
        <p className="mt-3 text-lg leading-relaxed">{technique.whyItWorks}</p>
        <p className="mt-4 rounded-2xl bg-muted p-4 text-sm">
          Naming this one shows the thinking move{" "}
          <strong>{MOVE_LABELS[technique.proves]}</strong>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">Questions people ask</h2>
        <dl className="mt-4 flex flex-col gap-5">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="flex items-start gap-2 font-heading text-lg font-bold">
                <HelpCircle className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                {faq.question}
              </dt>
              <dd className="mt-1 ps-6 leading-relaxed text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
