"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelebration } from "@/hooks/use-celebration";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";
import type { StoryScene } from "@/lib/storyboard/schema";

/**
 * The "engage" beat inside a scene. A reveal hides a fact behind a tap; a
 * choice asks a quick question. Both are low-stakes — nothing is scored here,
 * the graded part is the interactive session at the end.
 */
export function SceneInteraction({
  interaction,
  onEngaged,
}: {
  interaction: StoryScene["interaction"];
  onEngaged: () => void;
}) {
  const t = useTranslations("player");
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const celebrate = useCelebration();
  const soundOn = useProgress((s) => s.soundOn);

  const isChoice = interaction.kind === "choice" && interaction.choices.length > 0;

  function handleReveal() {
    setRevealed(true);
    if (soundOn) playSound("pop");
    onEngaged();
  }

  function handlePick(index: number) {
    if (picked !== null) return;
    setPicked(index);
    const choice = interaction.choices[index];
    if (choice.isCorrect) celebrate("correct");
    else if (soundOn) playSound("wrong");
    onEngaged();
  }

  return (
    <div
      data-slot="scene-interaction"
      className="rounded-3xl border-2 border-dashed border-border bg-card/60 p-5"
    >
      <p className="flex items-start gap-2 font-heading text-lg font-bold">
        <Sparkles className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
        {interaction.prompt}
      </p>

      {isChoice ? (
        <div className="mt-4 flex flex-col gap-2">
          {interaction.choices.map((choice, i) => {
            const isPicked = picked === i;
            const showState = picked !== null;
            return (
              <motion.button
                key={`${choice.text}-${i}`}
                type="button"
                onClick={() => handlePick(i)}
                disabled={showState}
                whileTap={showState ? undefined : { scale: 0.97 }}
                className={`rounded-2xl border-2 px-4 py-3 text-start font-semibold transition-colors ${
                  showState && choice.isCorrect
                    ? "border-mint bg-mint/15"
                    : isPicked
                      ? "border-tangerine bg-tangerine/10"
                      : "border-border bg-background hover:border-primary/60 disabled:opacity-70"
                }`}
              >
                <span className="flex items-center gap-2">
                  {showState && choice.isCorrect && <Check className="size-4 shrink-0 text-mint" />}
                  {choice.text}
                </span>
              </motion.button>
            );
          })}

          <AnimatePresence>
            {picked !== null && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-1 pt-1 text-sm font-medium text-muted-foreground"
              >
                {interaction.choices[picked].feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.p
                key="answer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-2xl bg-sunny/20 p-4 font-semibold"
              >
                {interaction.revealAnswer}
              </motion.p>
            ) : (
              <motion.div key="button" exit={{ opacity: 0 }}>
                <Button
                  onClick={handleReveal}
                  variant="outline"
                  className="btn-pop h-12 rounded-full border-2 px-6 font-bold"
                >
                  <Eye className="size-4" />
                  {t("tapToFindOut")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
