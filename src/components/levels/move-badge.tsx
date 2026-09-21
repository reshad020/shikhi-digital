import {
  BookOpen,
  Combine,
  HelpCircle,
  Lightbulb,
  Ruler,
  Scale,
  ShieldQuestion,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { MOVE_LABELS, type StrongMove } from "@/lib/reasoning/moves";
import { tierFor } from "@/lib/levels/ranks";
import { cn } from "@/lib/utils";

const MOVE_ICONS: Record<StrongMove, LucideIcon> = {
  "gave-evidence": BookOpen,
  "spotted-assumption": Lightbulb,
  "considered-alternative": Scale,
  "used-scale": Ruler,
  "questioned-source": ShieldQuestion,
  "admitted-uncertainty": HelpCircle,
  "made-connection": Combine,
  steelmanned: Swords,
};

const TIER_STYLES = {
  none: "border-dashed border-border bg-muted/40 text-muted-foreground",
  bronze: "border-tangerine/50 bg-tangerine/10 text-tangerine",
  silver: "border-sky/50 bg-sky/10 text-sky",
  gold: "border-sunny bg-sunny/20 text-tangerine shadow-pop-sm",
} as const;

const TIER_LABELS = { none: "Not yet", bronze: "Bronze", silver: "Silver", gold: "Gold" } as const;

/**
 * One badge per thinking move.
 *
 * Locked badges are shown, not hidden — a child needs to see that "questioned
 * the source" exists and that they have never done it. The gap is the lesson;
 * hiding it would turn a skill map back into a score.
 */
export function MoveBadge({ move, count }: { move: StrongMove; count: number }) {
  const Icon = MOVE_ICONS[move];
  const tier = tierFor(count);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center",
        TIER_STYLES[tier],
      )}
    >
      <Icon className={cn("size-7", tier === "none" && "opacity-50")} aria-hidden />
      <span className="text-xs leading-tight font-bold">{MOVE_LABELS[move]}</span>
      <span className="text-[0.65rem] font-semibold uppercase tracking-wide opacity-80">
        {tier === "none" ? TIER_LABELS.none : `${TIER_LABELS[tier]} · ${count}`}
      </span>
    </div>
  );
}
