"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

/**
 * The six Thinking Levels, drawn as an actual climb.
 *
 * Rendered as a rising staircase rather than a list, because the one thing a
 * parent must take away is that the ranks are ordered by *kind* of thinking
 * rather than by hours logged — and a row of equal-height cards says the
 * opposite. Each rung sits higher and carries more colour than the last.
 *
 * The two verdict chips underneath are the proof, straight out of the rank
 * tests: grinding does not move the needle, range does.
 */

const RUNGS = [
  { key: "noticer", tone: "bg-muted text-muted-foreground border-border" },
  { key: "questioner", tone: "bg-sky/15 text-foreground border-sky/50" },
  { key: "evidenceHunter", tone: "bg-mint/20 text-foreground border-mint/60" },
  { key: "connector", tone: "bg-sunny/25 text-foreground border-sunny/70" },
  { key: "challenger", tone: "bg-tangerine/20 text-foreground border-tangerine/60" },
  { key: "steelmanner", tone: "bg-grape text-primary-foreground border-grape" },
] as const;

export function Ladder() {
  const t = useTranslations("landing.ladder");
  const reduced = useReducedMotion();

  return (
    <div>
      <ol className="flex flex-col gap-3 md:flex-row md:items-end md:gap-3">
        {RUNGS.map((rung, i) => (
          <motion.li
            key={rung.key}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.07 }}
            // The climb. Each rung sits a little higher than the one before
            // it, so the shape of the row is the argument. Only once the rungs
            // are in a row, though: stacked on a phone the same offsets just
            // open ragged gaps between full-width cards.
            className="flex-1 md:mb-[var(--rung)]"
            style={{ "--rung": `${i * 0.75}rem` } as CSSProperties}
          >
            <div
              className={`flex h-full flex-col gap-1.5 rounded-3xl border-2 px-5 py-5 shadow-pop-sm ${rung.tone}`}
            >
              <span className="font-heading text-xs font-extrabold tracking-[0.14em] uppercase opacity-60">
                {i + 1}
              </span>
              <span className="font-heading text-lg leading-tight font-extrabold text-balance">
                {t(`ranks.${rung.key}`)}
              </span>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Verdict icon="no" label={t("proofA")} result={t("proofAResult")} />
        <Verdict icon="yes" label={t("proofB")} result={t("proofBResult")} />
      </div>
    </div>
  );
}

function Verdict({
  icon,
  label,
  result,
}: {
  icon: "yes" | "no";
  label: string;
  result: string;
}) {
  const yes = icon === "yes";

  return (
    <div
      className={`flex items-start gap-3 rounded-3xl border-2 p-5 ${
        yes ? "border-mint/60 bg-mint/10" : "border-border bg-muted/40"
      }`}
    >
      <span
        className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
          yes ? "bg-mint text-[oklch(0.28_0.07_165)]" : "bg-muted-foreground/20 text-muted-foreground"
        }`}
        aria-hidden
      >
        {yes ? <Check className="size-4" /> : <X className="size-4" />}
      </span>
      <p className="text-sm leading-relaxed font-semibold">
        {label}
        <span className="mt-1 block font-heading text-base font-extrabold">{result}</span>
      </p>
    </div>
  );
}
