"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations, useFormatter } from "next-intl";
import { PenLine, Sparkles, Swords } from "lucide-react";
import { GradeStamp } from "@/components/landing/grade-stamp";

/**
 * One thing a child wrote, given back to them.
 *
 * The child's own words are the largest type on the card and sit above
 * everything else, because the card is not a score report — it is the
 * evidence that what they wrote was worth keeping. The grader's reply is
 * shown underneath in full: that reply is the only place in the product where
 * a child can see that a real sentence of theirs was read closely and answered
 * specifically, which is the whole feeling this page exists to create.
 *
 * A "first" ribbon is the one piece of celebration, and it is deliberately
 * rare — it marks the first time a kind of thinking ever appeared in their
 * writing, which is a real event rather than a participation award.
 */

export type EntryCardData = {
  id: string;
  source: "defend" | "steelman";
  text: string;
  quality: "developing" | "solid" | "excellent";
  moveLabels: string[];
  firstLabels: string[];
  response: string;
  about: string;
  at: string;
};

export function EntryCard({
  data,
  index,
  highlight = false,
}: {
  data: EntryCardData;
  index: number;
  highlight?: boolean;
}) {
  const t = useTranslations("thinking");
  const format = useFormatter();
  const reduced = useReducedMotion();

  const Icon = data.source === "steelman" ? Swords : PenLine;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 250, damping: 24, delay: (index % 6) * 0.05 }}
      className={`relative flex flex-col gap-4 rounded-[1.75rem] border-2 p-6 shadow-pop-sm ${
        highlight ? "border-sunny bg-sunny/8" : "border-border bg-card"
      }`}
    >
      {data.firstLabels.length > 0 && (
        <p className="inline-flex flex-wrap items-center gap-1.5 self-start rounded-full bg-bubblegum px-3 py-1 font-heading text-xs font-extrabold text-white uppercase">
          <Sparkles className="size-3.5" aria-hidden />
          {t("firstTime", { move: data.firstLabels.join(", ") })}
        </p>
      )}

      {/* Their words. The biggest thing on the card, on purpose. */}
      <blockquote className="font-heading text-xl leading-[1.5] font-bold text-balance sm:text-2xl">
        &ldquo;{data.text}&rdquo;
      </blockquote>

      <div className="flex flex-wrap items-center gap-2">
        <GradeStamp
          grade={data.quality}
          label={t(`quality.${data.quality}` as "quality.solid")}
          tilt={-5}
        />
        {data.moveLabels.map((label) => (
          <span
            key={label}
            className="rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Proof a person-shaped thing read it and answered this one. */}
      <p className="rounded-2xl border-2 border-dashed border-grape/40 bg-grape/5 px-4 py-3 leading-relaxed font-semibold">
        {data.response}
      </p>

      <footer className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span>{data.source === "steelman" ? t("fromSteelman") : t("fromLesson")}</span>
        {data.about && <span className="truncate">&middot; {data.about}</span>}
        <span className="ms-auto">{format.relativeTime(new Date(data.at), new Date())}</span>
      </footer>
    </motion.article>
  );
}
