"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Minus } from "lucide-react";

/**
 * The refusals.
 *
 * Written as things the product will not do rather than features it has,
 * because every one of these is a place where the easy version of this
 * business makes more money: child accounts, editable transcripts, indexable
 * writing, a report generated every week whether or not there is anything in
 * it. A parent evaluating a children's product is reading for exactly this
 * list and almost never finds it.
 */

const PROMISES = ["logins", "words", "index", "thin", "sources"] as const;

export function Promises() {
  const t = useTranslations("landing.promise");
  const reduced = useReducedMotion();

  return (
    <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
      {PROMISES.map((key, i) => (
        <motion.li
          key={key}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ type: "spring", stiffness: 280, damping: 26, delay: i * 0.06 }}
          className={`flex items-start gap-3 rounded-3xl border-2 border-border bg-card p-5 ${
            // The fifth item sits alone on the last row; letting it span keeps
            // the grid from ending on a ragged half-width card.
            i === PROMISES.length - 1 ? "sm:col-span-2" : ""
          }`}
        >
          <span
            className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"
            aria-hidden
          >
            <Minus className="size-4" />
          </span>
          <p className="text-sm leading-relaxed font-semibold">
            <span className="font-heading text-base font-extrabold">{t(`${key}.title`)}</span>
            <span className="mt-0.5 block text-muted-foreground">{t(`${key}.body`)}</span>
          </p>
        </motion.li>
      ))}
    </ul>
  );
}
