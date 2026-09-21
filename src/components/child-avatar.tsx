import { MOTIF_ICONS } from "@/components/storyboard/scene-art";
import type { Motif } from "@/lib/storyboard/art";
import { cn } from "@/lib/utils";

/** A curated slice of the motif vocabulary — enough choice to feel personal. */
export const AVATAR_CHOICES: Motif[] = [
  "star",
  "heart",
  "bird",
  "sun",
  "moon",
  "tree",
  "mountain",
  "globe",
  "music",
  "science",
  "art",
  "sport",
  "trophy",
  "key",
];

/** Deterministic colour per avatar, so a child's tile always looks the same. */
const TONES = [
  "bg-grape/15 text-grape",
  "bg-sky/15 text-sky",
  "bg-mint/20 text-mint",
  "bg-bubblegum/15 text-bubblegum",
  "bg-tangerine/15 text-tangerine",
];

export function ChildAvatar({
  avatar,
  className,
}: {
  avatar: string;
  className?: string;
}) {
  const motif = (avatar in MOTIF_ICONS ? avatar : "star") as Motif;
  const Icon = MOTIF_ICONS[motif];
  const tone = TONES[AVATAR_CHOICES.indexOf(motif) % TONES.length] ?? TONES[0];

  return (
    <span className={cn("grid place-items-center rounded-2xl", tone, className)}>
      <Icon className="size-1/2" aria-hidden />
    </span>
  );
}
