import { getTranslations } from "next-intl/server";
import { ArrowRight, Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PAPER_LABELS } from "@/lib/yle/syllabus";
import type { NextUp } from "@/lib/yle/next";

/**
 * "Do this next."
 *
 * The one thing on any of these pages that makes a decision for the child
 * instead of handing them a list. It states the reason as plainly as it states
 * the link, because a recommendation a child does not understand is just the
 * top item in a differently ordered menu — and because "Part 4 is your weakest,
 * at 48%" is itself the most useful sentence on the page.
 */
export async function NextUpCard({ next }: { next: NextUp }) {
  const t = await getTranslations("yleNext");
  const pct = next.accuracy === null ? null : Math.round(next.accuracy * 100);

  const reason =
    next.reason === "start"
      ? t("reasonStart")
      : next.reason === "coverage"
        ? t("reasonCoverage", { part: next.part })
        : next.reason === "weakest"
          ? t("reasonWeakest", { part: next.part, pct: pct ?? 0 })
          : t("reasonRevisit", { part: next.part });

  return (
    <section className="rounded-[1.75rem] border-2 border-grape/50 bg-grape/8 p-6">
      <p className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] text-grape uppercase">
        <Compass className="size-4" aria-hidden />
        {t("kicker")}
      </p>

      <h2 className="mt-2 font-heading text-xl leading-snug font-extrabold text-balance">
        {next.set.title}
      </h2>

      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        {PAPER_LABELS[next.paper]} &middot; {t("partLabel", { part: next.part })} &middot;{" "}
        {t("questionCount", { n: next.set.questions.length })}
      </p>

      {/* Why this one. */}
      <p className="mt-3 leading-relaxed font-semibold">{reason}</p>

      <Link
        href={`/yle/practice/${next.set.id}`}
        className="btn-pop mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading font-extrabold text-primary-foreground"
      >
        {t("cta")}
        <ArrowRight className="size-5 rtl:rotate-180" />
      </Link>

      {next.fresh > 0 && (
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          {t("freshLeft", { n: next.fresh })}
        </p>
      )}
    </section>
  );
}
