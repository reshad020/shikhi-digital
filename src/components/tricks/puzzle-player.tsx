"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArtefactView } from "./artefact";
import { useCelebration } from "@/hooks/use-celebration";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/stores/progress";
import { submitPuzzle, type PuzzleResult } from "@/lib/tricks/actions";
import type { Artefact } from "@/lib/tricks/types";

export function PuzzlePlayer({
  puzzleId,
  artefact,
  options,
}: {
  puzzleId: string;
  artefact: Artefact;
  /** Labels only — the correct slug is never shipped to the browser. */
  options: { slug: string; label: string }[];
}) {
  const [result, setResult] = useState<PuzzleResult | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const celebrate = useCelebration();
  const soundOn = useProgress((s) => s.soundOn);

  const done = result?.ok === true;

  function choose(slug: string) {
    if (pending || done) return;
    startTransition(async () => {
      const outcome = await submitPuzzle({ puzzleId, chosen: slug });
      setResult(outcome);
      if (outcome.ok) {
        if (outcome.correct) celebrate("correct");
        else if (soundOn) playSound("pop");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ArtefactView artefact={artefact} />

      <div>
        <p className="font-heading text-xl font-bold">What is the trick here?</p>
        <div className="mt-3 flex flex-col gap-2">
          {options.map((option) => {
            const isAnswer = done && result.answer === option.slug;
            return (
              <Button
                key={option.slug}
                variant="outline"
                disabled={done || pending}
                onClick={() => choose(option.slug)}
                className={`h-auto justify-start rounded-2xl border-2 px-4 py-3 text-start text-base font-semibold whitespace-normal ${
                  isAnswer ? "border-mint bg-mint/15" : ""
                }`}
              >
                {isAnswer && <Check className="size-4 shrink-0 text-mint" />}
                {pending && <Loader2 className="size-4 shrink-0 animate-spin" />}
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-3xl border-2 bg-card p-6 shadow-pop"
          >
            <p className="font-heading text-2xl font-extrabold">
              {result.correct ? "That is exactly it." : `It was ${result.answerLabel.toLowerCase()}.`}
            </p>
            <p className="text-lg leading-relaxed">{result.explanation}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  setResult(null);
                  router.refresh();
                }}
                className="btn-pop h-12 rounded-full px-6 font-bold"
              >
                <RefreshCw className="size-4" />
                Another one
              </Button>
              {/* Straight from the game into the public explainer — the same
                  page that has to rank for this technique. */}
              <Link
                href={`/spot-the-trick/${result.answer}`}
                className="font-bold text-primary underline underline-offset-4"
              >
                Read more about this trick
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
