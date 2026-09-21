"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

/**
 * The grade, landing like a rubber stamp on paper.
 *
 * This is the page's second motif and it is doing argumentative work, not
 * decorative work: the whole pitch is that a grade here means something other
 * than "you were right", so the grade has to feel weighty and physical rather
 * than like a score badge in a game.
 *
 * It arrives oversized and slams down to rest. Scale overshoot plus a short,
 * stiff spring is what sells "impact" — a gentle fade makes it a label.
 */

const TONE = {
  excellent: {
    wrap: "border-sunny bg-sunny text-[oklch(0.32_0.09_70)]",
    ring: "border-sunny",
  },
  solid: {
    wrap: "border-mint bg-mint text-[oklch(0.28_0.07_165)]",
    ring: "border-mint",
  },
  developing: {
    wrap: "border-muted-foreground/35 bg-muted text-foreground/70",
    ring: "border-muted-foreground/40",
  },
} as const;

export type Grade = keyof typeof TONE;

export function GradeStamp({
  grade,
  label,
  show = true,
  delay = 0,
  tilt = -8,
  className = "",
}: {
  grade: Grade;
  label: string;
  /** Held back until the answer above it has been read. */
  show?: boolean;
  delay?: number;
  tilt?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const tone = TONE[grade];

  return (
    <motion.span
      data-staged
      aria-hidden={!show}
      initial={false}
      animate={
        show
          ? { opacity: 1, scale: 1, rotate: tilt }
          : { opacity: 0, scale: reduced ? 1 : 2.1, rotate: tilt - 14 }
      }
      transition={
        reduced
          ? { duration: 0.2, delay }
          : { type: "spring", stiffness: 700, damping: 18, mass: 0.9, delay }
      }
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-2xl border-[3px] px-4 py-1.5 font-heading text-sm font-extrabold uppercase tracking-wide shadow-pop-sm ${tone.wrap} ${className}`}
    >
      {grade === "excellent" && <Sparkles className="size-4" aria-hidden />}
      {label}

      {/* The shock ring: expands once on impact, then it is gone. Without it
          the stamp lands silently and the moment reads as a state change. */}
      {!reduced && (
        <motion.span
          key={show ? "on" : "off"}
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={show ? { opacity: [0, 0.6, 0], scale: [0.9, 1.45, 1.7] } : { opacity: 0 }}
          transition={{ duration: 0.55, delay, ease: "easeOut" }}
          className={`pointer-events-none absolute inset-0 rounded-2xl border-2 ${tone.ring}`}
        />
      )}
    </motion.span>
  );
}
