"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Quote, Sprout, TrendingUp } from "lucide-react";
import { MarginNote } from "./ink";

/**
 * The weekly report, shown rather than described.
 *
 * This is the artefact the subscription is actually for, so it is reproduced
 * at full size instead of being summarised in a feature bullet. The detail
 * doing the persuading is the small line under the quote: the sentence a
 * parent is about to be moved by came from a question their child got
 * **wrong**. A competitor cannot copy that line without rebuilding the
 * grader underneath it.
 */
export function ReportPreview() {
  const t = useTranslations("landing.report");
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      <motion.article
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, rotate: -2.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: -0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="relative mx-auto max-w-2xl rounded-[2rem] border-2 border-border bg-card p-6 shadow-float sm:p-9"
      >
        <header className="border-b-2 border-dashed border-border pb-5">
          <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            {t("week")}
          </p>
          <h3 className="mt-2 font-heading text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
            {t("headline")}
          </h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{t("summary")}</p>
        </header>

        {/* The quote. Everything else on the card is framing for this. */}
        <section className="mt-6 rounded-3xl border-2 border-grape/25 bg-grape/[0.06] p-5 sm:p-6">
          <p className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
            <Quote className="size-3.5" aria-hidden />
            {t("theirWords")}
          </p>

          <p className="mt-2 text-sm font-semibold text-muted-foreground">{t("quoteQuestion")}</p>

          <blockquote className="mt-3 font-heading text-xl leading-[1.5] font-bold text-balance sm:text-2xl">
            &ldquo;{t("quote")}&rdquo;
          </blockquote>

          {/* The detail that does the work. */}
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
            {t("quoteNote")}
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border-2 border-border p-5">
            <p className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
              <TrendingUp className="size-3.5 text-mint" aria-hidden />
              {t("climbingLabel")}
            </p>
            <p className="mt-2 font-heading text-lg font-extrabold">{t("climbing")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t("climbingBody")}
            </p>
          </div>

          <div className="rounded-3xl border-2 border-border p-5">
            <p className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
              <Sprout className="size-3.5 text-tangerine" aria-hidden />
              {t("nextLabel")}
            </p>
            <p className="mt-2 font-heading text-lg font-extrabold">{t("next")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("nextBody")}</p>
          </div>
        </section>
      </motion.article>

      <MarginNote className="mx-auto mt-6 max-w-md text-center" tilt={-1}>
        {t("caption")}
      </MarginNote>
    </div>
  );
}
