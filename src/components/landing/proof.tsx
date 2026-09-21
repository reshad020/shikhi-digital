"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, RotateCcw, X } from "lucide-react";
import { GradeStamp, type Grade } from "./grade-stamp";

/**
 * The argument, performed.
 *
 * Every competitor's landing page *describes* its pedagogy. This one runs it:
 * two real answers to one real question, graded live, where the child who
 * picked the WRONG option scores higher. Nobody reads a paragraph claiming
 * "we value reasoning over correctness" and believes it. They believe the
 * stamp landing on the wrong answer.
 *
 * Two rules hold this together:
 *
 * 1. **The answers are never hidden.** Only the verdicts are staged. The
 *    parent has to read both and privately decide who did better *before* the
 *    grades appear — that private guess is the thing being overturned, and it
 *    cannot form while the text is still fading in. It also means a fast
 *    reader never waits on a timer.
 * 2. **Staged elements are always in the DOM**, revealed by opacity rather
 *    than mounted by a condition, so every word ships in the server HTML.
 *    `data-staged` lets the no-scripting rule in globals.css reveal them when
 *    there is nothing to run the sequence.
 */

const STEPS = [900, 2400, 3200] as const; // picks -> grades -> moves & footnote

type Side = {
  name: string;
  avatar: string;
  pick: string;
  correct: boolean;
  text: string;
  grade: Grade;
  gradeLabel: string;
  moves: string[];
  highlight: boolean;
};

export function Proof() {
  const t = useTranslations("landing.proof");
  const reduced = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const inView = useInView(scope, { once: true, margin: "-120px" });

  // Run and step travel together so that replaying is a single event-handler
  // update. Resetting the step from inside the effect instead would be a
  // synchronous setState in an effect body — a cascading render, and one the
  // React Compiler rightly rejects.
  const [{ run, step }, setSeq] = useState({ run: 0, step: 0 });

  useEffect(() => {
    if (!inView || reduced) return;
    const timers = STEPS.map((at, i) =>
      window.setTimeout(() => setSeq((s) => ({ ...s, step: i + 1 })), at),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [inView, reduced, run]);

  // Reduced motion does not play the sequence; it arrives already finished.
  const shown = reduced ? STEPS.length : step;

  const sides: Side[] = [
    {
      name: t("a.name"),
      avatar: "\u{1F98A}",
      pick: t("a.pick"),
      correct: true,
      text: t("a.text"),
      grade: "developing",
      gradeLabel: t("a.grade"),
      moves: [t("a.move1")],
      highlight: false,
    },
    {
      name: t("b.name"),
      avatar: "\u{1F422}",
      pick: t("b.pick"),
      correct: false,
      text: t("b.text"),
      grade: "excellent",
      gradeLabel: t("b.grade"),
      moves: [t("b.move1"), t("b.move2")],
      highlight: true,
    },
  ];

  return (
    <div ref={scope}>
      {/* The sheet. Faintly ruled, because everything on it is a child's
          handwriting and a teacher's marks — but only just: the rules sit
          behind two high-contrast cards and would fight them at any real
          strength. */}
      <div
        className="relative overflow-hidden rounded-[2rem] border-2 border-border bg-card p-5 shadow-float sm:rounded-[2.5rem] sm:p-8"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 33px, color-mix(in oklch, var(--border) 22%, transparent) 33px, color-mix(in oklch, var(--border) 22%, transparent) 34px)",
        }}
      >
        <div>
          <span className="inline-flex items-center rounded-full bg-grape px-3 py-1 font-heading text-xs font-extrabold tracking-wider text-primary-foreground uppercase">
            {t("questionLabel")}
          </span>
          <p className="mt-3 font-heading text-xl leading-snug font-extrabold text-balance sm:text-2xl">
            {t("question")}
          </p>
        </div>

        <div className="mt-7 grid items-start gap-5 lg:grid-cols-2">
          {sides.map((side, i) => (
            <AnswerCard key={side.name} side={side} step={shown} index={i} reduced={!!reduced} />
          ))}
        </div>

        {/* The line that closes the argument. Held until the stamps have
            landed, so it reads as the explanation rather than the setup. */}
        <motion.div
          data-staged
          initial={{ opacity: 0, y: 12 }}
          animate={shown >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-dashed border-grape/40 bg-grape/5 px-5 py-4"
        >
          <p className="max-w-xl text-sm leading-relaxed font-semibold sm:text-base">
            {t("footnote")}
          </p>
          <button
            type="button"
            onClick={() => setSeq({ run: run + 1, step: 0 })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-card px-4 py-2 font-heading text-sm font-bold transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-4" aria-hidden />
            {t("replay")}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function AnswerCard({
  side,
  step,
  index,
  reduced,
}: {
  side: Side;
  step: number;
  index: number;
  reduced: boolean;
}) {
  const t = useTranslations("landing.proof");
  const lit = side.highlight && step >= 2;

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-3xl border-2 bg-background p-5 transition-[box-shadow,border-color] duration-500 ${
        lit
          ? "border-sunny shadow-[0_0_0_5px_color-mix(in_oklch,var(--sunny)_26%,transparent)]"
          : "border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-2xl border-2 border-border bg-card text-xl"
          aria-hidden
        >
          {side.avatar}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-base leading-tight font-extrabold">{side.name}</p>

          <motion.span
            data-staged
            initial={{ opacity: 0, x: -6 }}
            animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, delay: index * 0.1 }}
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              side.correct
                ? "bg-mint/25 text-[oklch(0.4_0.1_165)] dark:text-mint"
                : "bg-destructive/12 text-destructive"
            }`}
          >
            {side.correct ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            {t("chose", { option: side.pick })}
          </motion.span>
        </div>
      </div>

      {/* What they wrote. Larger and looser than UI text — it is the artefact
          on the page, not a caption. Never staged: this is what the visitor
          came to read. */}
      <p className="text-[1.0625rem] leading-[1.75] font-medium text-foreground/90">
        &ldquo;{side.text}&rdquo;
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        <GradeStamp
          grade={side.grade}
          label={side.gradeLabel}
          show={step >= 2}
          delay={index * 0.22}
          tilt={index === 0 ? -6 : -9}
        />

        {side.moves.map((move, m) => (
          <motion.span
            key={move}
            data-staged
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={step >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 6 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 24,
              delay: reduced ? 0 : m * 0.09,
            }}
            className="rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground"
          >
            {move}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
