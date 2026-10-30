"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Visual } from "@/lib/maths/topics";

/**
 * Every picture in the maths section, drawn from the numbers in the question.
 *
 * Nothing here is an image or a model output. A number line is a line with
 * ticks; an array is rows of circles; a bar is a flex row of divs. That has
 * three consequences worth the trouble:
 *
 * - The picture **cannot disagree with the question**, because both come from
 *   the same numbers. A hand-drawn or generated illustration can quietly show
 *   seven dots for an eight-dot question, and a child who trusts the picture
 *   is then marked wrong for it.
 * - A new question costs nothing. No illustration pipeline, no storage.
 * - It scales, recolours and reads correctly in both themes for free.
 *
 * The motion is doing teaching work rather than decoration: the jump on a
 * number line is drawn left-to-right at the speed a child would count it, and
 * the array fills row by row so the rows are visible as rows.
 */
export function MathsVisual({ visual }: { visual: Visual }) {
  switch (visual.model) {
    case "number-line":
      return <NumberLine {...visual} />;
    case "array":
      return <DotArray {...visual} />;
    case "bar":
      return <FractionBar {...visual} />;
    case "bar-compare":
      return <BarCompare {...visual} />;
    case "grid":
      return <HundredGrid {...visual} />;
  }
}

function NumberLine({
  from,
  to,
  start,
  jump,
  step = 1,
  hideEnd,
  hideJump,
}: Extract<Visual, { model: "number-line" }>) {
  const reduced = useReducedMotion();
  const span = to - from;
  const at = (n: number) => ((n - from) / span) * 100;

  const end = start + jump;
  const forwards = jump >= 0;
  const left = Math.min(start, end);
  const right = Math.max(start, end);

  const ticks: number[] = [];
  for (let n = from; n <= to; n += step) ticks.push(n);

  return (
    <div className="w-full overflow-x-auto px-2 py-8" dir="ltr">
      <div className="relative mx-auto h-28 min-w-[18rem]">
        {/* The line */}
        <div className="absolute top-16 right-0 left-0 h-1 rounded-full bg-border" />

        {ticks.map((n) => {
          // The tick you land on wears a "?" instead of its number, the way a
          // primary workbook draws it. Without this the picture answers the
          // question for the child: the arc ends somewhere, and the label
          // underneath it would simply say what they were asked to work out.
          const askThis = hideEnd && n === end;
          return (
            <div key={n} className="absolute top-16 -translate-x-1/2" style={{ left: `${at(n)}%` }}>
              <div
                className={`mx-auto w-0.5 ${
                  askThis ? "h-4 bg-grape" : n === 0 ? "h-4 bg-foreground" : "h-2.5 bg-border"
                }`}
              />
              <span
                className={`mt-1 block text-center text-xs font-extrabold ${
                  askThis ? "font-heading text-sm text-grape" : "text-muted-foreground"
                }`}
              >
                {askThis ? "?" : n}
              </span>
            </div>
          );
        })}

        {/* The jump, revealed in the direction of travel.
            Wiped with clip-path rather than animated with `pathLength`:
            pathLength normalisation and `vector-effect: non-scaling-stroke`
            do not compose in Chrome, and this arc needs both — the x axis is
            scaled non-uniformly so the percentages line up with the ticks. */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={
            reduced
              ? { clipPath: "inset(0 0% 0 0%)" }
              : forwards
                ? { clipPath: "inset(0 100% 0 0)" }
                : { clipPath: "inset(0 0 0 100%)" }
          }
          animate={{ clipPath: "inset(0 0% 0 0%)" }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
        >
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={`M ${at(start)} 64 Q ${(at(start) + at(end)) / 2} 22 ${at(end)} 64`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={forwards ? "text-grape" : "text-tangerine"}
            />
          </svg>
        </motion.div>

        {/* Start marker */}
        <div className="absolute top-[3.4rem] -translate-x-1/2" style={{ left: `${at(start)}%` }}>
          <span className="block size-3.5 rounded-full border-2 border-background bg-grape" />
        </div>

        {/* Landing marker — hidden when the landing point is the answer. */}
        <motion.div
          className="absolute top-[3.4rem] -translate-x-1/2"
          style={{ left: `${at(end)}%` }}
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.75,
            type: "spring",
            stiffness: 500,
            damping: 18,
          }}
        >
          <span
            className={`block size-3.5 rounded-full border-2 border-background ${
              hideEnd ? "bg-sunny" : "bg-mint"
            }`}
          />
        </motion.div>

        {/* How big the jump was, written above it — unless that is the thing
            being asked for. */}
        <motion.span
          className="absolute top-2 -translate-x-1/2 rounded-full bg-card px-2 py-0.5 font-heading text-sm font-extrabold"
          style={{ left: `${(at(left) + at(right)) / 2}%` }}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {hideJump ? "?" : `${forwards ? "+" : "−"}${Math.abs(jump)}`}
        </motion.span>
      </div>
    </div>
  );
}

function DotArray({ rows, cols, showDimensions }: Extract<Visual, { model: "array" }>) {
  const t = useTranslations("maths");
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex items-start gap-3">
        {/* Row count down the side, so "rows" is a thing you can see. */}
        {showDimensions && (
          <span className="mt-1 font-heading text-lg font-extrabold text-grape">{rows}</span>
        )}

        <div className="flex flex-col gap-2">
          {showDimensions && (
            <span className="text-center font-heading text-lg font-extrabold text-sky">{cols}</span>
          )}
          <div className="flex flex-col gap-2">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex gap-2">
                {Array.from({ length: cols }).map((_, c) => (
                  <motion.span
                    key={c}
                    // Row by row, so the rows read as rows rather than a blur.
                    initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: r * 0.09 + c * 0.02,
                      type: "spring",
                      stiffness: 500,
                      damping: 22,
                    }}
                    className="size-5 rounded-full bg-grape sm:size-6"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDimensions && (
        <p className="font-heading text-sm font-bold text-muted-foreground">
          {t("rowsOf", { rows, cols })}
        </p>
      )}
    </div>
  );
}

function FractionBar({ parts, shaded, label }: Extract<Visual, { model: "bar" }>) {
  const t = useTranslations("maths");
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {label && (
        <span className="font-heading text-lg font-extrabold">{t("worth", { label })}</span>
      )}
      <div className="flex w-full max-w-md gap-1 overflow-hidden rounded-2xl border-2 border-border p-1">
        {Array.from({ length: parts }).map((_, i) => (
          <motion.span
            key={i}
            initial={reduced ? { opacity: 1 } : { opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{
              delay: i * 0.07,
              type: "spring",
              stiffness: 400,
              damping: 24,
            }}
            className={`h-14 flex-1 rounded-xl ${i < shaded ? "bg-grape" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="font-heading text-sm font-bold text-muted-foreground">
        {t("equalParts", { n: parts })}
      </p>
    </div>
  );
}

/** Two bars of identical length — the only honest way to compare fractions. */
function BarCompare({ top, bottom }: Extract<Visual, { model: "bar-compare" }>) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {[top, bottom].map((bar, n) => (
        <div key={n} className="flex w-full max-w-md items-center gap-3">
          <span className="w-12 shrink-0 text-end font-heading text-sm font-extrabold">
            {bar.shaded}/{bar.parts}
          </span>
          <div className="flex flex-1 gap-1 overflow-hidden rounded-2xl border-2 border-border p-1">
            {Array.from({ length: bar.parts }).map((_, i) => (
              <span
                key={i}
                className={`h-11 flex-1 rounded-xl ${
                  i < bar.shaded ? (n === 0 ? "bg-grape" : "bg-sky") : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HundredGrid({ shaded }: Extract<Visual, { model: "grid" }>) {
  const t = useTranslations("maths");
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="grid w-full max-w-[17rem] grid-cols-10 gap-0.5 rounded-xl border-2 border-border p-1.5">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.span
            key={i}
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            // Fast and row-wise: a hundred squares appearing one by one is a
            // wait, but the sweep makes the shaded block read as a quantity.
            transition={{ delay: Math.min(i * 0.004, 0.5) }}
            className={`aspect-square rounded-[3px] ${i < shaded ? "bg-grape" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="font-heading text-sm font-bold text-muted-foreground">
        {t("hundredSquares")}
      </p>
    </div>
  );
}
