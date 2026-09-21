"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Utensils } from "lucide-react";

/**
 * Three questions, printed on index cards, fanned like something you would
 * actually pick up off a kitchen table.
 *
 * This section sells the opposite of screen time, which is a strange thing for
 * a software product to put on its landing page and exactly why it lands. The
 * ordering rule is stated out loud because it is the part a parent recognises
 * as having been thought about by someone who has met a child.
 */

const TILT = [-2.5, 1.5, -1] as const;

export function DinnerTable() {
  const t = useTranslations("landing.dinner");
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-4">
        {(["q1", "q2", "q3"] as const).map((key, i) => (
          <motion.div
            key={key}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, rotate: TILT[i] - 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: reduced ? 0 : TILT[i] }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 210, damping: 22, delay: i * 0.1 }}
            className="flex items-start gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-pop-sm sm:p-6"
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-2xl bg-tangerine/20 font-heading text-base font-extrabold text-tangerine"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="font-heading text-lg leading-snug font-bold text-balance sm:text-xl">
              {t(key)}
            </p>
          </motion.div>
        ))}
      </div>

      <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-semibold text-muted-foreground">
        <Utensils className="size-4 shrink-0 text-tangerine" aria-hidden />
        {t("note")}
      </p>
    </div>
  );
}
