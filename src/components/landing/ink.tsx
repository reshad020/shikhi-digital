"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { directionOf } from "@/i18n/routing";

/**
 * Hand-drawn marker strokes — the signature of the landing page.
 *
 * The page is built on one conceit: this is a product about a teacher marking
 * up a child's *thinking*, so the page itself arrives annotated. Strokes draw
 * themselves as they scroll into view, because a pre-drawn squiggle reads as
 * clip art while a drawn one reads as somebody reaching for a pen.
 *
 * Every stroke stretches to fit whatever it annotates
 * (`preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"`), so one
 * path works under a two-word phrase and a six-word one — and keeps working
 * after translation into six languages, where nothing is the width the
 * designer assumed.
 *
 * The draw-on is a clip wipe rather than the usual `pathLength` dash trick.
 * That is not a preference: `pathLength` normalisation and
 * `vector-effect: non-scaling-stroke` do not compose in Chrome. The browser
 * resolves the dash array in screen units while the path is normalised to 1,
 * and the stroke renders as disconnected fragments — an underline with a hole
 * punched through the middle of the phrase. Wiping a clip path touches no
 * stroke geometry at all, so it is immune.
 */

const DRAW = { duration: 0.72, ease: [0.22, 1, 0.36, 1] } as const;

type StrokeProps = {
  /** Tailwind text-* colour class; the stroke inherits via currentColor. */
  className?: string;
  delay?: number;
};

/**
 * Shared draw-on behaviour for a whole stroke SVG, so reduced motion and
 * writing direction are each handled in exactly one place.
 */
function useDraw(delay: number) {
  const reduced = useReducedMotion();
  const rtl = directionOf(useLocale()) === "rtl";

  // A pen moves with the language: left to right in English, right to left in
  // Arabic.
  const hidden = rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
  const shown = "inset(0 0 0 0)";

  if (reduced) return { initial: { clipPath: shown }, animate: { clipPath: shown } };

  return {
    initial: { clipPath: hidden },
    whileInView: { clipPath: shown },
    viewport: { once: true, margin: "-60px" },
    transition: { ...DRAW, delay },
  };
}

/**
 * A phrase with a marker swipe under it. Two overlapping strokes rather than
 * one: a single clean curve looks printed, a second pass looks like a hand
 * going back over it.
 */
export function Marked({
  children,
  className = "text-sunny",
  delay = 0.25,
}: StrokeProps & { children: ReactNode }) {
  const draw = useDraw(delay);

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.svg
        {...draw}
        aria-hidden
        viewBox="0 0 200 18"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute -bottom-1 start-0 h-[0.42em] w-full ${className}`}
      >
        <path
          d="M4 10.5C52 8.4 120 8 196 9.6"
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.5}
        />
        <path
          d="M8 14.2C58 12.2 132 11.8 193 13.2"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.85}
        />
      </motion.svg>
    </span>
  );
}

/**
 * A phrase with a loop drawn round it — the mark a teacher makes when
 * something is worth coming back to. The loop deliberately overshoots its
 * start, the way a real one does.
 */
export function Circled({
  children,
  className = "text-bubblegum",
  delay = 0.3,
}: StrokeProps & { children: ReactNode }) {
  const draw = useDraw(delay);

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.svg
        {...draw}
        aria-hidden
        viewBox="0 0 220 70"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute -inset-x-[6%] -inset-y-[28%] h-[1.56em] w-[112%] ${className}`}
      >
        <path
          d="M186 17C166 6 122 2 78 5 34 8 8 20 6 34c-2 15 26 28 76 31 48 3 96-5 110-19 9-9 3-19-12-26"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.9}
        />
      </motion.svg>
    </span>
  );
}

/**
 * A phrase crossed out. Used exactly once on the page — on the word "answer" —
 * so it keeps its force.
 */
export function Struck({
  children,
  className = "text-destructive",
  delay = 0.55,
}: StrokeProps & { children: ReactNode }) {
  const draw = useDraw(delay);

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.svg
        {...draw}
        aria-hidden
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute start-0 top-1/2 h-[0.3em] w-full -translate-y-1/2 ${className}`}
      >
        <path
          d="M4 7.2C56 5.4 122 5.2 196 6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.8}
        />
      </motion.svg>
    </span>
  );
}

/**
 * A scribbled note in the margin. Rotated a couple of degrees, because the
 * moment it sits square to the grid it stops reading as a note and starts
 * reading as a label.
 */
export function MarginNote({
  children,
  className = "",
  tilt = -3,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.p
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, rotate: tilt - 4 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`font-heading text-sm font-bold text-muted-foreground ${className}`}
    >
      {children}
    </motion.p>
  );
}
