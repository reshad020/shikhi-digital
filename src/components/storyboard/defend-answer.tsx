"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";
import { submitReasoning } from "@/lib/reasoning/actions";
import { MAX_REASONING_CHARS, MIN_REASONING_CHARS, type Verdict } from "@/lib/reasoning/schema";
import { MOVE_LABELS, isStrongMove, type ThinkingMove } from "@/lib/reasoning/moves";
import type { QuizItem } from "@/lib/storyboard/schema";

/**
 * The child explains why they answered as they did, and gets read closely.
 *
 * The whole feature rests on the child believing it is worth writing something.
 * That belief is fragile, so: no red, no score out of ten, no "incorrect", and
 * the verdict always names something they actually did before it corrects
 * anything. Skip is always available and never penalised — a child made to
 * justify themselves stops explaining and starts performing.
 */
export function DefendAnswer({
  lessonId,
  question,
  choiceIndex,
  onDone,
}: {
  lessonId: string;
  question: QuizItem;
  choiceIndex: number;
  onDone: () => void;
}) {
  const t = useTranslations("defend");
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const soundOn = useProgress((s) => s.soundOn);
  const awardStar = useProgress((s) => s.awardStar);

  const trimmed = text.trim();
  const canSend = trimmed.length >= MIN_REASONING_CHARS && !pending;
  const remaining = MAX_REASONING_CHARS - text.length;

  function send() {
    if (!canSend) return;
    setError(null);
    startTransition(async () => {
      const result = await submitReasoning({
        lessonId,
        questionId: question.id,
        choiceIndex,
        text: trimmed,
      });

      if (!result.ok) {
        setError(t(`errors.${result.error}`));
        return;
      }

      setVerdict(result.verdict);
      // Explaining yourself is worth more than picking correctly.
      awardStar(result.verdict.quality === "excellent" ? 3 : 2);
      if (soundOn) playSound(result.verdict.quality === "developing" ? "pop" : "correct");
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-5"
    >
      <p className="flex items-start gap-2 font-heading text-lg font-bold">
        <PenLine className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
        {question.defendPrompt || t("heading")}
      </p>

      <AnimatePresence mode="wait">
        {verdict ? (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-4"
          >
            <blockquote className="rounded-2xl bg-background/70 p-4">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t("yourThinking")}
              </span>
              <p className="mt-1 font-medium italic">{trimmed}</p>
            </blockquote>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                {t(`quality.${verdict.quality}`)}
              </span>
              {verdict.moves.map((move) => (
                <span
                  key={move}
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isStrongMove(move)
                      ? "bg-mint/20 text-mint"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {MOVE_LABELS[move as ThinkingMove] ?? move}
                </span>
              ))}
            </div>

            <p className="text-lg font-medium leading-relaxed">{verdict.response}</p>

            <div className="rounded-2xl bg-sunny/20 p-4">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-tangerine">
                <Sparkles className="size-3.5" aria-hidden />
                {t("pushbackLabel")}
              </span>
              <p className="mt-1 font-semibold">{verdict.pushback}</p>
            </div>

            <Button
              onClick={onDone}
              className="btn-pop h-12 self-start rounded-full px-6 text-base font-bold"
            >
              {t("continue")}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="mt-4 flex flex-col gap-3">
            <textarea
              autoFocus
              rows={4}
              value={text}
              maxLength={MAX_REASONING_CHARS}
              onChange={(e) => setText(e.target.value)}
              disabled={pending}
              placeholder={t("placeholder")}
              aria-label={question.defendPrompt || t("heading")}
              className="resize-y rounded-2xl border-2 border-border bg-background p-4 text-lg leading-relaxed outline-none focus-visible:border-ring disabled:opacity-60"
            />

            {remaining < 120 && (
              <span className="text-xs font-semibold text-muted-foreground">
                {t("charsLeft", { count: remaining })}
              </span>
            )}

            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={send}
                disabled={!canSend}
                className="btn-pop h-12 rounded-full px-6 text-base font-bold"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? t("grading") : t("submit")}
              </Button>
              <Button
                variant="ghost"
                onClick={onDone}
                disabled={pending}
                className="h-12 rounded-full px-4 font-bold text-muted-foreground"
              >
                {t("skip")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
