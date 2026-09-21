"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Clock, PenLine, ScanSearch, Scale } from "lucide-react";

/**
 * The three places a child does the work.
 *
 * Each card carries a miniature of the real interaction rather than an icon
 * and a promise. The Spot the Trick miniature in particular is a genuinely
 * truncated bar chart — the same principle the product itself runs on: the
 * trick has to actually be in the picture, or the child reads an explanation
 * instead of noticing something.
 */

export function Rooms() {
  const t = useTranslations("landing.rooms");
  const reduced = useReducedMotion();

  const rooms = [
    {
      key: "defend",
      Icon: PenLine,
      accent: "text-grape",
      ring: "hover:border-grape/60",
      preview: <DefendPreview placeholder={t("defend.preview")} />,
    },
    {
      key: "daily",
      Icon: Scale,
      accent: "text-sky",
      ring: "hover:border-sky/60",
      preview: <DailyPreview a={t("daily.previewA")} b={t("daily.previewB")} />,
    },
    {
      key: "tricks",
      Icon: ScanSearch,
      accent: "text-bubblegum",
      ring: "hover:border-bubblegum/60",
      preview: <TrickPreview caption={t("tricks.preview")} />,
    },
  ] as const;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {rooms.map((room, i) => (
        <motion.div
          key={room.key}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 240, damping: 24, delay: i * 0.09 }}
          className={`flex flex-col gap-4 rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm transition-colors ${room.ring}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-2xl border-2 border-border bg-background">
              <room.Icon className={`size-6 ${room.accent}`} aria-hidden />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {t(`${room.key}.time`)}
            </span>
          </div>

          <div>
            <h3 className="font-heading text-xl font-extrabold">{t(`${room.key}.title`)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(`${room.key}.blurb`)}
            </p>
          </div>

          <div className="mt-auto">{room.preview}</div>
        </motion.div>
      ))}
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-background p-4">
      {children}
    </div>
  );
}

/** A waiting text box with a blinking caret. The ask, not the answer. */
function DefendPreview({ placeholder }: { placeholder: string }) {
  return (
    <Frame>
      <p className="text-sm font-semibold text-muted-foreground">{placeholder}</p>
      <div className="mt-2 flex h-9 items-center rounded-xl border-2 border-border bg-card px-3">
        <motion.span
          aria-hidden
          className="block h-4 w-0.5 bg-foreground"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </Frame>
  );
}

/** Two claims, one of them invented. Which is which is not revealed here. */
function DailyPreview({ a, b }: { a: string; b: string }) {
  return (
    <Frame>
      <div className="flex flex-col gap-2">
        {[a, b].map((claim) => (
          <p
            key={claim}
            className="rounded-xl border-2 border-border bg-card px-3 py-2 text-xs leading-snug font-semibold"
          >
            {claim}
          </p>
        ))}
      </div>
    </Frame>
  );
}

/**
 * A real truncated axis: four near-identical values, drawn from a baseline of
 * 90 so the last bar looks several times the first. The caption gives away
 * nothing — spotting it is the exercise.
 */
function TrickPreview({ caption }: { caption: string }) {
  const values = [91, 93, 96, 99];
  const floor = 90;

  return (
    <Frame>
      <div className="flex h-20 items-end gap-2" aria-hidden>
        {values.map((v, i) => (
          <motion.span
            key={v}
            initial={{ height: 0 }}
            whileInView={{ height: `${((v - floor) / (100 - floor)) * 100}%` }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.1 + i * 0.08 }}
            className="flex-1 rounded-t-md bg-bubblegum/70"
          />
        ))}
      </div>
      <div className="mt-1 border-t-2 border-border pt-1 text-[0.65rem] font-bold text-muted-foreground">
        {caption}
      </div>
    </Frame>
  );
}
