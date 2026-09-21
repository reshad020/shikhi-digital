"use client";

import { useCallback } from "react";
import { celebrate, celebrateBig, celebrateStars } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";

/**
 * One call site for "the child did something good": confetti + sound + stars.
 */
export function useCelebration() {
  const awardStar = useProgress((s) => s.awardStar);
  const soundOn = useProgress((s) => s.soundOn);

  return useCallback(
    (kind: "correct" | "lesson" | "badge" = "correct") => {
      if (kind === "lesson") celebrateBig();
      else if (kind === "badge") celebrateStars();
      else celebrate();

      if (soundOn) playSound(kind === "correct" ? "correct" : "levelUp");
      awardStar(kind === "correct" ? 1 : 5);
    },
    [awardStar, soundOn],
  );
}
