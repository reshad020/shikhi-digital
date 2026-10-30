"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Delete, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { MathsVisual } from "@/components/maths/visual";
import { isMathsCorrect, type Topic } from "@/lib/maths/topics";

/**
 * Maths practice, one question at a time.
 *
 * The YLE player deliberately withholds marking until the whole set is
 * submitted, because that is what the real paper does. This is the opposite
 * case and takes the opposite decision: nobody is rehearsing an exam here, so
 * a child finds out immediately, while the picture that explains it is still
 * in front of them. A note delivered ten questions later is a note about a
 * drawing they can no longer see.
 *
 * Marking is exact string comparison — no model call, no cost, no failure
 * mode. A child can sit here for an hour and the only limit is attention.
 */
export function MathsPractice({ topic }: { topic: Topic }) {
  const t = useTranslations("maths");
  const tt = useTranslations("maths.topics");
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  /** Right first time. A second go is worth having; it is not worth a point. */
  const [score, setScore] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  const question = topic.questions[index];
  const ok = checked && isMathsCorrect(question, value);

  function check() {
    if (!value.trim() || checked) return;
    setChecked(true);
    if (isMathsCorrect(question, value) && !tried) setScore((s) => s + 1);
  }

  /** A wrong answer does not end the question — it rubs out and tries again. */
  function retry() {
    setChecked(false);
    setTried(true);
    setValue("");
  }

  function next() {
    if (index + 1 >= topic.questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setValue("");
    setChecked(false);
    setTried(false);
  }

  function restart() {
    setIndex(0);
    setValue("");
    setChecked(false);
    setScore(0);
    setTried(false);
    setDone(false);
  }

  if (done) {
    return <Finished topic={topic} score={score} onRestart={restart} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress. Segments rather than a percentage: five of seven is a thing
          a child can see at a glance, 71% is not. */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {topic.questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < index ? "bg-grape" : i === index ? "bg-grape/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="font-heading text-sm font-extrabold tabular-nums text-muted-foreground">
          {t("progress", { n: index + 1, total: topic.questions.length })}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={question.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`rounded-[1.75rem] border-2 bg-card shadow-pop-sm transition-colors ${
            !checked
              ? "border-border"
              : ok
                ? "border-mint/70 bg-mint/8"
                : "border-tangerine/70 bg-tangerine/8"
          }`}
        >
          <div className="border-b-2 border-dashed border-border/70">
            <MathsVisual visual={question.visual} />
          </div>

          <div className="p-6">
            <h2 className="font-heading text-xl leading-snug font-extrabold text-balance">
              {tt(`${topic.slug}.q.${question.id}.prompt`)}
            </h2>

            {question.options ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const picked = value === option;
                  const isAnswer = checked && isMathsCorrect(question, option);
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={checked}
                      onClick={() => setValue(option)}
                      aria-pressed={picked}
                      className={`min-w-24 rounded-2xl border-2 px-5 py-3 font-heading text-lg font-extrabold transition-colors ${
                        isAnswer
                          ? "border-mint bg-mint/25"
                          : picked
                            ? checked
                              ? "border-tangerine bg-tangerine/20"
                              : "border-grape bg-grape/12"
                            : "border-border bg-background hover:border-grape/60 disabled:opacity-70"
                      }`}
                    >
                      {t(`choice.${option}`)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <AnswerPad
                value={value}
                disabled={checked}
                state={checked ? (ok ? "right" : "wrong") : "open"}
                onChange={setValue}
                onEnter={check}
              />
            )}

            {/* The note, shown on a right answer too — being right by rule and
                being right by luck look identical from the outside, and only
                one of them works on the next question. */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-dashed border-border bg-background/70 px-4 py-3">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                        ok ? "bg-mint text-[oklch(0.28_0.07_165)]" : "bg-tangerine text-white"
                      }`}
                    >
                      {ok ? <Check className="size-4" /> : <X className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      {!ok && (
                        <p className="font-heading text-base font-extrabold">
                          {t("theAnswer", {
                            answer: question.options
                              ? t(`choice.${question.answer}`)
                              : question.answer,
                          })}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed font-semibold text-muted-foreground">
                        {tt(`${topic.slug}.q.${question.id}.note`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!checked ? (
                <Button
                  onClick={check}
                  disabled={!value.trim()}
                  className="btn-pop h-13 rounded-full px-8 text-base font-extrabold"
                >
                  {t("check")}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={next}
                    className="btn-pop h-13 rounded-full px-8 text-base font-extrabold"
                  >
                    {index + 1 >= topic.questions.length ? t("finish") : t("next")}
                    <ArrowRight className="size-5 rtl:rotate-180" />
                  </Button>
                  {!ok && (
                    <Button
                      variant="outline"
                      onClick={retry}
                      className="h-13 rounded-full border-2 px-6 font-bold"
                    >
                      <RotateCcw className="size-4" />
                      {t("anotherGo")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

/**
 * The answer box and its keypad.
 *
 * A plain text input is the wrong control here. `inputMode="numeric"` gives a
 * phone keypad with no slash and no minus sign, which puts fractions and
 * negatives out of reach; `inputMode="text"` gives a full keyboard that covers
 * the picture on every phone, and the picture is the lesson. Twelve buttons
 * solve both, and they are large enough for a child to hit without aiming.
 */
function AnswerPad({
  value,
  disabled,
  state,
  onChange,
  onEnter,
}: {
  value: string;
  disabled: boolean;
  state: "open" | "right" | "wrong";
  onChange: (next: string) => void;
  onEnter: () => void;
}) {
  const t = useTranslations("maths");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "/", "0", "−"];

  return (
    <div className="mt-4 flex flex-col items-start gap-3">
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        // No on-screen keyboard on touch devices — the keypad below is the way
        // in — but still typeable on a laptop, which is faster.
        inputMode="none"
        autoComplete="off"
        spellCheck={false}
        aria-label={t("yourAnswer")}
        dir="ltr"
        className={`h-16 w-full max-w-56 rounded-2xl border-2 bg-background px-5 text-center font-heading text-3xl font-extrabold tabular-nums outline-none ${
          state === "right"
            ? "border-mint"
            : state === "wrong"
              ? "border-tangerine"
              : "border-border focus-visible:border-grape"
        }`}
      />

      {!disabled && (
        <div className="grid w-full max-w-56 grid-cols-3 gap-2" dir="ltr">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              // The minus key types a plain hyphen; `normaliseMaths` is what
              // reconciles that with the typographic minus used in answers.
              onClick={() => onChange(value + (k === "−" ? "-" : k))}
              className="h-12 rounded-xl border-2 border-border bg-background font-heading text-xl font-extrabold transition-colors hover:border-grape/60 active:bg-muted"
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange(value.slice(0, -1))}
            aria-label={t("rubOut")}
            className="col-span-3 grid h-12 place-items-center rounded-xl border-2 border-border bg-muted/60 transition-colors hover:border-grape/60"
          >
            <Delete className="size-5 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}

function Finished({
  topic,
  score,
  onRestart,
}: {
  topic: Topic;
  score: number;
  onRestart: () => void;
}) {
  const t = useTranslations("maths");
  const tt = useTranslations("maths.topics");
  const reduced = useReducedMotion();
  const total = topic.questions.length;

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="rounded-[1.75rem] border-2 border-grape/40 bg-grape/5 p-8 text-center"
    >
      <span className="text-6xl" aria-hidden>
        {topic.emoji}
      </span>
      <p className="mt-4 font-heading text-4xl font-extrabold tabular-nums">
        {t("scoreOf", { score, total })}
      </p>
      <p className="mt-1 font-heading text-sm font-extrabold text-muted-foreground">
        {t("firstTime")}
      </p>

      {/* The idea, repeated at the end. That is the thing worth carrying away
          from a topic; the score is not. */}
      <p className="mx-auto mt-5 max-w-md rounded-2xl border-2 border-dashed border-border bg-background/60 px-5 py-4 leading-relaxed font-semibold">
        {tt(`${topic.slug}.idea`)}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onRestart}
          className="h-12 rounded-full border-2 font-bold"
        >
          <RotateCcw className="size-4" />
          {t("goAgain")}
        </Button>
        <Button
          nativeButton={false}
          className="btn-pop h-12 rounded-full px-6 font-bold"
          render={<Link href="/maths" />}
        >
          {t("anotherTopic")}
        </Button>
      </div>
    </motion.section>
  );
}
