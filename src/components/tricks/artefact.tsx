import { cn } from "@/lib/utils";

/**
 * Renders the thing the child is asked to examine.
 *
 * Drawn as real SVG and real DOM rather than as an image, which matters more
 * than it looks: a truncated axis has to *actually be truncated* for the puzzle
 * to work. If we described the trick in prose instead of drawing it, the child
 * would be reading an explanation, not spotting anything. It also means every
 * puzzle is free, deterministic, translatable and screen-reader legible.
 */

import type { Artefact } from "@/lib/tricks/types";

export type { Artefact };

const BAR_COLORS = ["var(--grape)", "var(--sky)", "var(--mint)", "var(--tangerine)"];

function BarChart({ artefact }: { artefact: Artefact }) {
  const bars = artefact.bars.slice(0, 4);
  if (bars.length === 0) return null;

  const values = bars.map((b) => b.value);
  const max = Math.max(...values);
  // The whole point: the floor is wherever the chart claims it is, not zero.
  const floor = Math.min(artefact.axisStart, ...values);
  const span = Math.max(max - floor, 1e-6);

  const W = 320;
  const H = 180;
  const PAD_L = 44;
  const PAD_B = 28;
  const PAD_T = 12;
  const plotW = W - PAD_L - 8;
  const plotH = H - PAD_B - PAD_T;
  const slot = plotW / bars.length;
  const barW = Math.min(slot * 0.56, 48);

  const ticks = [floor, floor + span / 2, floor + span];

  return (
    <figure className="m-0">
      <figcaption className="mb-2 font-heading text-lg font-bold">{artefact.title}</figcaption>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Bar chart. ${bars
            .map((b) => `${b.label}: ${b.value}${artefact.unit}`)
            .join(", ")}. The scale starts at ${floor}${artefact.unit}.`}
          className="h-auto w-full min-w-[320px]"
        >
          {ticks.map((tick, i) => {
            const y = PAD_T + plotH - ((tick - floor) / span) * plotH;
            return (
              <g key={i}>
                <line
                  x1={PAD_L}
                  x2={W - 8}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9"
                  fill="var(--muted-foreground)"
                >
                  {Number(tick.toFixed(1))}
                  {artefact.unit}
                </text>
              </g>
            );
          })}

          {bars.map((bar, i) => {
            const h = ((bar.value - floor) / span) * plotH;
            const x = PAD_L + i * slot + (slot - barW) / 2;
            return (
              <g key={bar.label}>
                <rect
                  x={x}
                  y={PAD_T + plotH - h}
                  width={barW}
                  height={Math.max(h, 1)}
                  rx="3"
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                />
                <text
                  x={x + barW / 2}
                  y={H - PAD_B + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--muted-foreground)"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Source: {artefact.source}</p>
    </figure>
  );
}

function HeadlineCard({ artefact }: { artefact: Artefact }) {
  return (
    <article className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {artefact.source}
      </p>
      <h3 className="font-heading text-2xl leading-tight font-extrabold text-balance">
        {artefact.title}
      </h3>
      {artefact.standfirst && (
        <p className="text-base font-semibold text-muted-foreground">{artefact.standfirst}</p>
      )}
      {artefact.body && <p className="text-sm leading-relaxed">{artefact.body}</p>}
    </article>
  );
}

function SurveyCard({ artefact }: { artefact: Artefact }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {artefact.source}
      </p>
      <p className="font-heading text-xl leading-snug font-bold">{artefact.title}</p>
      <ul className="flex flex-col gap-2">
        {artefact.options.map((option) => (
          <li
            key={option}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <span aria-hidden className="size-4 shrink-0 rounded-full border-2 border-border" />
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArtefactView({
  artefact,
  className,
}: {
  artefact: Artefact;
  className?: string;
}) {
  return (
    <div
      // Deliberately plainer than the rest of the app: this is meant to look
      // like something found out in the world, not like part of the lesson.
      className={cn("rounded-2xl border-2 border-border bg-card p-5", className)}
    >
      {artefact.kind === "chart" && <BarChart artefact={artefact} />}
      {artefact.kind === "headline" && <HeadlineCard artefact={artefact} />}
      {artefact.kind === "survey" && <SurveyCard artefact={artefact} />}
    </div>
  );
}
