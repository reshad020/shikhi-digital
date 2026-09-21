"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2, Quote, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelebration } from "@/hooks/use-celebration";
import { submitSteelman, type SteelmanResult } from "@/lib/steelman/actions";
import {
  FAIRNESS_ORDER,
  MAX_STEELMAN_CHARS,
  MIN_STEELMAN_CHARS,
  type Fairness,
} from "@/lib/steelman/schema";

/**
 * Steelman Arena.
 *
 * The activity is three beats, and the middle one is the whole product:
 *
 *   1. Read a claim and say which side you actually hold.
 *   2. **Now argue the other one.** Committing to a side first is what makes
 *      this hard — without it a child writes a neutral both-sides paragraph
 *      and never has to inhabit a view they reject.
 *   3. Get graded on how fairly you represented it, then see the strongest
 *      point we had, so you can tell whether you found it yourself.
 *
 * The side the child must argue is derived on the server from the side they
 * picked; this component never learns the strongest points until the verdict
 * comes back, so there is nothing in the payload to peek at.
 */
export function Arena({
  prompt,
}: {
  prompt: { id: string; claim: string; context: string; sideA: string; sideB: string };
}) {
  const t = useTranslations("steelman");
  const reduced = useReducedMotion();
  const celebrate = useCelebration();

  const [believes, setBelieves] = useState<"a" | "b" | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<SteelmanResult | null>(null);
  const [pending, startTransition] = useTransition();

  const arguedSide = believes === "a" ? prompt.sideB : prompt.sideA;
  const believedSide = believes === "a" ? prompt.sideA : prompt.sideB;
  const tooShort = text.trim().length < MIN_STEELMAN_CHARS;

  function submit() {
    if (!believes || tooShort || pending) return;
    startTransition(async () => {
      const outcome = await submitSteelman({ promptId: prompt.id, believes, text });
      setResult(outcome);
      // Getting here at all means they argued against themselves in writing.
      if (outcome.ok && (outcome.fairness === "fair" || outcome.fairness === "generous")) {
        celebrate("badge");
      }
    });
  }

  if (result?.ok) {
    return <Verdict result={result} argued={arguedSide} text={text} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The claim */}
      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("claimLabel")}
        </p>
        <h2 className="mt-2 font-heading text-2xl leading-snug font-extrabold text-balance sm:text-3xl">
          {prompt.claim}
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{prompt.context}</p>
      </section>

      {/* Beat 1: commit to a side */}
      <section>
        <h3 className="font-heading text-lg font-extrabold">{t("pickHeading")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("pickNote")}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["a", "b"] as const).map((side) => {
            const label = side === "a" ? prompt.sideA : prompt.sideB;
            const chosen = believes === side;
            return (
              <button
                key={side}
                type="button"
                onClick={() => setBelieves(side)}
                aria-pressed={chosen}
                className={`rounded-3xl border-2 px-5 py-4 text-start font-heading text-lg font-extrabold transition-all ${
                  chosen
                    ? "border-grape bg-grape/10 shadow-pop-sm"
                    : believes
                      ? "border-border bg-card opacity-55 hover:opacity-80"
                      : "border-border bg-card hover:border-grape/50"
                }`}
              >
                <span className="block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {t("pickPrefix")}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Beat 2: the flip */}
      <AnimatePresence>
        {believes && (
          <motion.section
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 24 }}
            className="rounded-[1.75rem] border-2 border-sunny bg-sunny/10 p-6"
          >
            <p className="inline-flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] text-[oklch(0.42_0.1_70)] uppercase dark:text-sunny">
              <Swords className="size-4" aria-hidden />
              {t("flipLabel")}
            </p>

            <h3 className="mt-2 font-heading text-xl leading-snug font-extrabold text-balance sm:text-2xl">
              {t("argueHeading", { side: arguedSide })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed font-semibold">
              {t("argueNote", { believed: believedSide })}
            </p>

            <label htmlFor="steelman-text" className="sr-only">
              {t("argueHeading", { side: arguedSide })}
            </label>
            <textarea
              id="steelman-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_STEELMAN_CHARS))}
              rows={6}
              placeholder={t("placeholder")}
              className="mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 text-base leading-relaxed font-medium outline-none focus-visible:border-grape"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-muted-foreground">
                {t("counter", { n: text.trim().length, max: MAX_STEELMAN_CHARS })}
              </span>
              <Button
                onClick={submit}
                disabled={tooShort || pending}
                className="btn-pop h-12 rounded-full px-7 font-bold"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("grading")}
                  </>
                ) : (
                  <>
                    {t("submit")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </div>

            {result && !result.ok && (
              <p className="mt-3 text-sm font-bold text-destructive">
                {t(`errors.${result.error}` as "errors.service")}
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Beat 3: how the other side would have received it. */
function Verdict({
  result,
  argued,
  text,
}: {
  result: Extract<SteelmanResult, { ok: true }>;
  argued: string;
  text: string;
}) {
  const t = useTranslations("steelman");
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex flex-col gap-5"
    >
      <FairnessMeter reached={result.fairness} />

      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("youArgued", { side: argued })}
        </p>
        <blockquote className="mt-2 text-[1.0625rem] leading-[1.7] font-medium">
          &ldquo;{text.trim()}&rdquo;
        </blockquote>

        <p className="mt-5 leading-relaxed font-semibold">{result.response}</p>

        {result.moves.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">{t("movesLabel")}</span>
            {result.moves.map((move) => (
              <span
                key={move.slug}
                className="rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-bold"
              >
                {move.label}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* The reveal. Held back until now so the child can tell whether they
          found the strongest point themselves or missed it. */}
      <section className="rounded-[1.75rem] border-2 border-mint/60 bg-mint/10 p-6">
        <p className="inline-flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] uppercase">
          <Quote className="size-4" aria-hidden />
          {t("revealLabel", { side: argued })}
        </p>
        <p className="mt-2 text-[1.0625rem] leading-relaxed font-semibold">{result.bestPoint}</p>
      </section>

      <section className="rounded-[1.75rem] border-2 border-dashed border-grape/45 bg-grape/5 p-6">
        <p className="inline-flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] text-grape uppercase">
          <Sparkles className="size-4" aria-hidden />
          {t("pushbackLabel")}
        </p>
        <p className="mt-2 text-lg leading-snug font-bold text-balance">{result.pushback}</p>
      </section>
    </motion.div>
  );
}

const FAIRNESS_TONE: Record<Fairness, string> = {
  strawman: "bg-muted text-muted-foreground border-border",
  partial: "bg-sky/20 text-foreground border-sky/60",
  fair: "bg-mint/25 text-foreground border-mint/70",
  generous: "bg-sunny text-[oklch(0.32_0.09_70)] border-sunny",
};

/**
 * Four rungs, weakest to strongest, with the child's result filled in.
 *
 * Shown as a scale rather than a single badge because the interesting
 * information is the distance: a child who lands on "partial" needs to see
 * that "fair" exists and what separates them, not just a word.
 */
function FairnessMeter({ reached }: { reached: Fairness }) {
  const t = useTranslations("steelman");
  const reduced = useReducedMotion();
  const index = FAIRNESS_ORDER.indexOf(reached);

  return (
    <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
      <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
        {t("fairnessLabel")}
      </p>

      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {FAIRNESS_ORDER.map((step, i) => {
          const hit = step === reached;
          return (
            <motion.li
              key={step}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: i <= index ? 1 : 0.4, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.08 }}
              className={`rounded-2xl border-2 px-4 py-3 ${
                hit ? `${FAIRNESS_TONE[step]} shadow-pop-sm` : "border-border bg-background"
              }`}
            >
              <span className="block font-heading text-sm font-extrabold">
                {t(`fairness.${step}` as "fairness.fair")}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <p className="mt-4 leading-relaxed font-semibold">
        {t(`fairnessNote.${reached}` as "fairnessNote.fair")}
      </p>
    </section>
  );
}
