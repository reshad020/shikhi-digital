"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SceneArt } from "./scene-art";
import { SceneInteraction } from "./scene-interaction";
import { QuizSession } from "./quiz-session";
import type { Storyboard } from "@/lib/storyboard/schema";

/**
 * Learn → engage → interactive session.
 *
 * Scenes advance one at a time. The "next" button unlocks only after the child
 * has engaged with the scene's interaction, so the storyboard can't be clicked
 * through passively. After the last scene the quiz takes over.
 */
export function StoryPlayer({
  storyboard,
  lessonId,
}: {
  storyboard: Storyboard;
  lessonId: string;
}) {
  const t = useTranslations("player");
  const [index, setIndex] = useState(0);
  const [engaged, setEngaged] = useState<Set<number>>(new Set());
  const [inQuiz, setInQuiz] = useState(false);

  const scene = storyboard.scenes[index];
  const isLast = index === storyboard.scenes.length - 1;
  const canAdvance = engaged.has(index);

  function markEngaged() {
    setEngaged((prev) => new Set(prev).add(index));
  }

  if (inQuiz) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-24">
        <QuizSession storyboard={storyboard} lessonId={lessonId} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Progress
          value={((index + 1) / storyboard.scenes.length) * 100}
          className="min-w-0 flex-1"
        />
        <span className="shrink-0 text-sm font-bold text-muted-foreground">
          {index + 1}/{storyboard.scenes.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={scene.id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="flex flex-col gap-5"
        >
          <SceneArt
            art={scene.art}
            animate
            className="aspect-[16/10] w-full rounded-4xl border-2 shadow-pop"
          />

          <h2 className="font-heading text-3xl font-extrabold text-balance">{scene.title}</h2>
          <p className="text-xl leading-relaxed font-medium">{scene.narration}</p>

          <SceneInteraction interaction={scene.interaction} onEngaged={markEngaged} />
        </motion.article>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="h-12 rounded-full px-5 font-bold"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
          {t("back")}
        </Button>

        <Button
          onClick={() => (isLast ? setInQuiz(true) : setIndex((i) => i + 1))}
          disabled={!canAdvance}
          className="btn-pop h-14 rounded-full px-8 text-base font-bold"
        >
          {isLast ? (
            <>
              <BookOpen className="size-5" />
              {t("startQuiz")}
            </>
          ) : (
            <>
              {t("next")}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </>
          )}
        </Button>
      </div>

      {!canAdvance && (
        <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">
          {t("engageFirst")}
        </p>
      )}
    </div>
  );
}
