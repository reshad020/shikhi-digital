import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/seo/config";
import { Hero } from "./hero";
import { Proof } from "./proof";
import { Rooms } from "./rooms";
import { Ladder } from "./ladder";
import { ReportPreview } from "./report-preview";
import { DinnerTable } from "./dinner-table";
import { Promises } from "./promise";
import { ClosingCta } from "./closing-cta";
import { Section } from "./section";
import { Circled, Marked } from "./ink";

/**
 * The landing page, in the order a sceptical parent actually asks questions:
 *
 *   claim -> show me -> what does my child do -> can they game it ->
 *   what do I get -> and then what -> what are you doing with their data
 *
 * Feature-led ordering (a grid of icons near the top) answers none of those
 * and is what every competitor ships. The proof panel sits second because the
 * claim is unusual enough that it is worth nothing unsupported.
 */
export async function Landing() {
  const t = await getTranslations("landing");

  return (
    <>
      <Hero />

      <Section
        id="proof"
        kicker={t("proof.kicker")}
        heading={t.rich("proof.heading", {
          mark: (chunks) => <Marked>{chunks}</Marked>,
        })}
        lead={t("proof.lead")}
      >
        <Proof />
      </Section>

      <Section
        id="rooms"
        kicker={t("rooms.kicker")}
        heading={t("rooms.heading")}
        lead={t("rooms.lead")}
        tone="text-sky"
        className="bg-muted/40"
      >
        <Rooms />
      </Section>

      <Section
        id="levels"
        kicker={t("ladder.kicker")}
        heading={t.rich("ladder.heading", {
          mark: (chunks) => <Marked className="text-tangerine">{chunks}</Marked>,
        })}
        lead={t("ladder.lead")}
        tone="text-tangerine"
      >
        <Ladder />
      </Section>

      <Section
        id="report"
        kicker={t("report.kicker")}
        heading={t.rich("report.sectionHeading", {
          mark: (chunks) => <Circled>{chunks}</Circled>,
        })}
        lead={t("report.lead")}
        tone="text-bubblegum"
        className="bg-muted/40"
      >
        <ReportPreview />
      </Section>

      <Section
        id="dinner"
        kicker={t("dinner.kicker")}
        heading={t("dinner.heading")}
        lead={t("dinner.lead")}
        tone="text-tangerine"
      >
        <DinnerTable />
      </Section>

      <Section
        id="promise"
        kicker={t("promise.kicker")}
        heading={t("promise.heading")}
        lead={t("promise.lead")}
        tone="text-mint"
        className="bg-muted/40"
      >
        <Promises />
      </Section>

      <ClosingCta />

      <SiteFooter claim={SITE.claim} />
    </>
  );
}

async function SiteFooter({ claim }: { claim: string }) {
  const t = await getTranslations("landing.footer");

  return (
    <footer className="border-t-2 border-border px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-heading text-lg font-extrabold">{SITE.name}</p>
          {/* One brand claim, from one constant — the same string the schema,
              OG tags and llms.txt use. */}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{claim}</p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold">
          <Link className="hover:text-primary" href="/spot-the-trick">
            {t("guide")}
          </Link>
          <Link className="hover:text-primary" href="/signin">
            {t("signin")}
          </Link>
          <Link className="hover:text-primary" href="/signup">
            {t("signup")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
