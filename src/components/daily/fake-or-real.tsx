"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, Flame, Loader2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelebration } from "@/hooks/use-celebration";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";
import { TELL_LABELS, type Tell } from "@/lib/daily/tells";
import { submitChallenge, type ChallengeResult } from "@/lib/daily/actions";

type Slot = "true_claim" | "false_claim";

/**
 * Ninety seconds, once a day.
 *
 * Two beats: pick the made-up claim, then name what gave it away. The second
 * beat is the actual learning — spotting that something is off is instinct,
 * naming *why* is the transferable skill — so the result screen leads with the
 * tell, not with whether the pick was right.
 */
export function FakeOrReal({
  challengeId,
  claims,
  tellOptions,
  startingStreak,
}: {
  challengeId: string;
  /** Pre-shuffled server-side so the true claim is not always first in the DOM. */
  claims: { slot: Slot; text: string }[];
  tellOptions: Tell[];
  startingStreak: number;
}) {
  const t = useTranslations("daily");
  const [picked, setPicked] = useState<Slot | null>(null);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [pending, startTransition] = useTransition();
  const celebrate = useCelebration();
  const soundOn = useProgress((s) => s.soundOn);

  const done = result?.ok === true;

  function chooseTell(tell: Tell) {
    if (!picked || pending || done) return;
    startTransition(async () => {
      const outcome = await submitChallenge({
        challengeId,
        pickedFalse: picked,
        chosenTell: tell,
      });
      setResult(outcome);

      if (outcome.ok) {
        if (outcome.pickedCorrectly && outcome.tellCorrect) celebrate("badge");
        else if (outcome.pickedCorrectly) celebrate("correct");
        else if (soundOn) playSound("pop");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        {(startingStreak > 0 || done) && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-tangerine/15 px-3 py-1.5 font-bold text-tangerine">
            <Flame className="size-4" aria-hidden />
            {t("streakLabel", { count: done && result.ok ? result.streak : startingStreak })}
          </span>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {claims.map((claim) => {
          const isPicked = picked === claim.slot;
          const revealFalse = done && claim.slot === "false_claim";
          return (
            <li key={claim.slot}>
              <motion.button
                type="button"
                onClick={() => !done && setPicked(claim.slot)}
                disabled={done}
                whileHover={done ? undefined : { scale: 1.02 }}
                whileTap={done ? undefined : { scale: 0.98 }}
                aria-pressed={isPicked}
                className={`flex h-full w-full items-start gap-3 rounded-3xl border-2 bg-card p-5 text-start text-lg font-medium shadow-pop-sm transition-colors ${
                  revealFalse
                    ? "border-tangerine bg-tangerine/10"
                    : isPicked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                }`}
              >
                <Quote className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
                <span>{claim.text}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence mode="wait">
        {picked && !done && (
          <motion.div
            key="tells"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border-2 border-dashed p-5"
          >
            <p className="font-heading text-lg font-bold">{t("tellPrompt")}</p>
            <div className="mt-4 flex flex-col gap-2">
              {tellOptions.map((tell) => (
                <Button
                  key={tell}
                  variant="outline"
                  disabled={pending}
                  onClick={() => chooseTell(tell)}
                  className="h-auto justify-start rounded-2xl border-2 px-4 py-3 text-start text-base font-semibold whitespace-normal"
                >
                  {pending && <Loader2 className="size-4 shrink-0 animate-spin" />}
                  {TELL_LABELS[tell]}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex flex-col gap-4 rounded-4xl border-2 bg-card p-6 shadow-pop"
          >
            <div>
              <p className="font-heading text-2xl font-extrabold">
                {result.pickedCorrectly ? t("spotted") : t("missed")}
              </p>
              <p className="mt-1 font-semibold text-muted-foreground">
                {result.tellCorrect ? (
                  <span className="inline-flex items-center gap-1.5 text-mint">
                    <Check className="size-4" aria-hidden />
                    {t("tellRight")}
                  </span>
                ) : (
                  <>
                    {t("tellWas")}: <strong>{TELL_LABELS[result.correctTell]}</strong>
                  </>
                )}
              </p>
            </div>

            <p className="text-lg leading-relaxed">{result.explanation}</p>

            <p className="rounded-2xl bg-muted p-3 text-sm">
              <span className="font-bold uppercase tracking-wide text-muted-foreground">
                {t("source")}:
              </span>{" "}
              {result.sourceNote}
            </p>

            <p className="text-sm font-semibold text-muted-foreground">{t("comeBack")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
