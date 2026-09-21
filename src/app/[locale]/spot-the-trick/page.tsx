import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TECHNIQUES } from "@/lib/tricks/techniques";
import { alternatesFor } from "@/lib/seo/config";
import { buildItemListSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Spot the Trick: how numbers and headlines mislead",
  description:
    "A plain-language guide to the tricks used in charts, headlines and surveys — what each one is called, how to spot it, and why it works on people.",
  alternates: alternatesFor("/spot-the-trick"),
};

export default async function SpotTheTrickIndex({
  params,
}: PageProps<"/[locale]/spot-the-trick">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildItemListSchema(
              TECHNIQUES.map((t) => ({ name: t.label, path: `/spot-the-trick/${t.slug}` })),
              locale,
            ),
            buildBreadcrumbSchema([{ name: "Spot the Trick", path: "/spot-the-trick" }], locale),
          ]),
        }}
      />

      <h1 className="font-heading text-4xl font-extrabold text-balance sm:text-5xl">
        Spot the Trick
      </h1>

      {/* Answer-first block — SEO_PLAN §5.1. 40-55 words, self-contained. */}
      <p className="mt-5 text-lg leading-relaxed">
        <strong>Short answer:</strong> most misleading charts and headlines are not lies. They use
        a small number of repeatable techniques — a scale that does not start at zero, a count
        with no total, a headline that says “linked to” — that each have a name. Once a child can
        name the technique, they stop being fooled by it.
      </p>

      <ul className="mt-10 flex flex-col gap-4">
        {TECHNIQUES.map((technique) => (
          <li key={technique.slug}>
            <Link href={`/spot-the-trick/${technique.slug}`}>
              <Card className="rounded-2xl border-2 transition-shadow hover:shadow-float">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-xl font-bold">{technique.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{technique.definition}</p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
