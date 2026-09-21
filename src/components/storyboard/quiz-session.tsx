"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Lightbulb, RotateCcw, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCelebration } from "@/hooks/use-celebration";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";
import { DefendAnswer } from "./defend-answer";
import type { Storyboard } from "@/lib/storyboard/schema";

/**
 * The graded session at the end of a lesson. One question at a time, immediate
 * feedback, no time pressure, and a retry that only re-asks what was missed.
 */
export function QuizSession({
  storyboard,
  lessonId,
}: {
  storyboard: Storyboard;
  lessonId: string;
}) {
  const [queue, setQueue] = useState(storyboard.quiz);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [defendDone, setDefendDone] = useState(false);
  const [missed, setMissed] = useState<typeof storyboard.quiz>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const t = useTranslations("player");
  const tr = useTranslations("report");
  const celebrate = useCelebration();
  const completeLesson = useProgress((s) => s.completeLesson);
  const soundOn = useProgress((s) => s.soundOn);

  const question = queue[index];
  const total = storyboard.quiz.length;

  function pick(optionIndex: number) {
    if (picked !== null) return;
    setPicked(optionIndex);
    const option = question.options[optionIndex];
    if (option.isCorrect) {
      setCorrectCount((c) => c + 1);
      celebrate("correct");
    } else {
      setMissed((m) => [...m, question]);
      if (soundOn) playSound("wrong");
    }
  }

  function next() {
    setPicked(null);
    setShowHint(false);
    setDefendDone(false);

    if (index + 1 < queue.length) {
      setIndex(index + 1);
      return;
    }
    setDone(true);
    completeLesson(lessonId);
    celebrate("lesson");
  }

  function retryMissed() {
    setQueue(missed);
    setMissed([]);
    setIndex(0);
    setPicked(null);
    setShowHint(false);
    setDefendDone(false);
    setDone(false);
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-4 rounded-4xl border-2 bg-card p-8 text-center shadow-pop"
      >
        <Trophy className="size-14 text-sunny" />
        <h2 className="font-heading text-3xl font-extrabold">{storyboard.celebration.headline}</h2>
        <p className="text-lg font-bold">
          {correctCount} / {total}
        </p>
        <p className="max-w-md text-muted-foreground">{storyboard.celebration.funFact}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {missed.length > 0 && (
            <Button
              onClick={retryMissed}
              variant="outline"
              className="btn-pop h-12 rounded-full border-2 px-6 font-bold"
            >
              <RotateCcw className="size-4" />
              {t("tryMissed", { count: missed.length })}
            </Button>
          )}
          {/* The child hands the report over themselves — the moment they are
              proudest is the moment a parent is most likely to read it. */}
          <Button
            variant="ghost"
            className="h-12 rounded-full px-5 font-bold"
            render={<Link href="/report" />}
          >
            <Users className="size-4" />
            {tr("forGrownUp")}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-4xl border-2 bg-card p-6 shadow-pop sm:p-8">
      <div className="flex items-center gap-3">
        <Progress value={((index + 1) / queue.length) * 100} className="min-w-0 flex-1" />
        <span className="shrink-0 text-sm font-bold text-muted-foreground">
          {index + 1}/{queue.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="flex flex-col gap-4"
        >
          <h2 className="font-heading text-2xl font-extrabold text-balance">{question.question}</h2>

          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              const answered = picked !== null;
              const isPicked = picked === i;
              return (
                <motion.button
                  key={`${question.id}-${i}`}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={answered}
                  whileHover={answered ? undefined : { scale: 1.01 }}
                  whileTap={answered ? undefined : { scale: 0.98 }}
                  className={`rounded-2xl border-2 px-5 py-4 text-start text-lg font-semibold transition-colors ${
                    answered && option.isCorrect
                      ? "border-mint bg-mint/15"
                      : isPicked
                        ? "border-tangerine bg-tangerine/10"
                        : "border-border bg-background hover:border-primary/60 disabled:opacity-70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {answered && option.isCorrect && (
                      <Check className="size-5 shrink-0 text-mint" />
                    )}
                    {option.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {picked === null ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 self-start text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="size-4" />
              {showHint ? question.hint : t("needHint")}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <p className="font-medium text-muted-foreground">
                {question.options[picked].feedback}
              </p>

              {question.defend && !defendDone ? (
                <DefendAnswer
                  lessonId={lessonId}
                  question={question}
                  choiceIndex={picked}
                  onDone={() => setDefendDone(true)}
                />
              ) : (
                <Button
                  onClick={next}
                  className="btn-pop h-12 self-start rounded-full px-6 text-base font-bold"
                >
                  {index + 1 < queue.length ? t("nextQuestion") : t("finish")}
                  <ArrowRight className="size-5 rtl:rotate-180" />
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
