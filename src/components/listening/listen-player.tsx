"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Ear, Loader2, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/landing/grade-stamp";
import { useCelebration } from "@/hooks/use-celebration";
import {
  fetchTranscript,
  submitListening,
  type ListeningResult,
} from "@/lib/listening/actions";
import { MAX_REASONING_CHARS, MIN_REASONING_CHARS } from "@/lib/reasoning/schema";
import type { PlayablePassage } from "@/lib/listening/data";

/**
 * Listen Close.
 *
 * The passage is spoken by the browser's own speech engine rather than a
 * pre-rendered audio file. That is a real trade — a hosted neural voice sounds
 * better — but it buys three things that matter more for a first version: no
 * per-play cost, no storage, and no generation step between an admin writing a
 * passage and a child hearing it. It also means the child can slow it down,
 * which a fixed audio file cannot offer.
 *
 * **The words are never on screen while they play.** That is the entire
 * exercise; a transcript visible during playback makes this a reading task
 * with background noise. The text is fetched only when play is pressed and
 * shown only once the questions are answered.
 */

type Stage = "listen" | "recall" | "inference" | "write" | "done";

export function ListenPlayer({ passage }: { passage: PlayablePassage }) {
  const t = useTranslations("listening");
  const locale = useLocale();
  const reduced = useReducedMotion();
  const celebrate = useCelebration();

  const [stage, setStage] = useState<Stage>("listen");
  const [speaking, setSpeaking] = useState(false);
  const [plays, setPlays] = useState(0);
  const [slow, setSlow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [recallIndex, setRecallIndex] = useState<number | null>(null);
  const [inferenceIndex, setInferenceIndex] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ListeningResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Cached after the first play so replays cost nothing.
  const transcript = useRef<string | null>(null);

  /**
   * Whether this browser can speak at all.
   *
   * `useSyncExternalStore` rather than an effect: setting state from an effect
   * body is a cascading render, and the server snapshot lets the player render
   * optimistically instead of flashing the unsupported card before hydration.
   */
  const supported = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => true,
  );

  useEffect(() => {
    // Speech carries on after navigation unless it is explicitly cancelled.
    return () => window.speechSynthesis?.cancel();
  }, []);

  /** Prefer a voice for the page's language; fall back to whatever exists. */
  const pickVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase())) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
      voices[0] ??
      null
    );
  }, [locale]);

  const speak = useCallback(
    (words: string) => {
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(words);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? locale;
      // Just under natural pace: comfortably followable for an eight-year-old
      // without sounding like a slowed recording.
      utterance.rate = slow ? 0.72 : 0.95;
      utterance.pitch = 1;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      synth.speak(utterance);
    },
    [locale, pickVoice, slow],
  );

  async function play() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!transcript.current) {
      setLoading(true);
      transcript.current = await fetchTranscript(passage.id);
      setLoading(false);
      if (!transcript.current) return;
    }

    setPlays((n) => n + 1);
    speak(transcript.current);
  }

  function submit() {
    if (recallIndex === null || inferenceIndex === null || pending) return;
    window.speechSynthesis?.cancel();

    startTransition(async () => {
      const outcome = await submitListening({
        passageId: passage.id,
        recallIndex,
        inferenceIndex,
        plays: Math.max(plays, 1),
        text,
      });
      setResult(outcome);
      if (outcome.ok) {
        setStage("done");
        if (outcome.inferenceCorrect) celebrate("correct");
      }
    });
  }

  if (!supported) {
    return (
      <div className="rounded-[1.75rem] border-2 border-tangerine/50 bg-tangerine/10 p-6">
        <p className="font-heading text-lg font-extrabold">{t("unsupportedTitle")}</p>
        <p className="mt-1 text-muted-foreground">{t("unsupportedBody")}</p>
      </div>
    );
  }

  if (stage === "done" && result?.ok) {
    return <Verdict result={result} plays={plays} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The ear. Deliberately the only thing on screen while it speaks. */}
      <section className="flex flex-col items-center gap-5 rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-pop-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1 font-heading text-xs font-extrabold tracking-wider text-sky uppercase">
          <Ear className="size-3.5" aria-hidden />
          {passage.topic}
        </span>

        <div className="relative">
          {/* Rings only while speaking, so the button is visibly "live" without
              a waveform that would imply a recording being scrubbed. */}
          {speaking && !reduced && (
            <>
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-grape"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
                />
              ))}
            </>
          )}
          <button
            type="button"
            onClick={play}
            disabled={loading}
            aria-label={speaking ? t("stop") : t("play")}
            className="btn-pop relative grid size-28 place-items-center rounded-full bg-grape text-primary-foreground disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-10 animate-spin" />
            ) : speaking ? (
              <Pause className="size-10" />
            ) : (
              <Play className="size-10 translate-x-1 rtl:-translate-x-1" />
            )}
          </button>
        </div>

        <p className="font-heading text-lg font-extrabold">
          {plays === 0 ? t("pressPlay") : speaking ? t("listening") : t("playedCount", { count: plays })}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSlow((s) => !s)}
            aria-pressed={slow}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
              slow ? "border-mint bg-mint/15" : "border-border bg-background hover:bg-muted"
            }`}
          >
            {t("slower")}
          </button>
          {plays > 0 && !speaking && (
            <button
              type="button"
              onClick={play}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
            >
              <RotateCcw className="size-4" aria-hidden />
              {t("again")}
            </button>
          )}
        </div>

        {/* Replaying is never discouraged. Needing to hear something twice is
            normal, and a counter that feels like a penalty teaches a child to
            guess rather than listen again. */}
        <p className="max-w-sm text-sm font-semibold text-muted-foreground">{t("replayNote")}</p>
      </section>

      {plays > 0 && (
        <>
          <Question
            label={t("recallLabel")}
            question={passage.recallQuestion}
            options={passage.recallOptions}
            picked={recallIndex}
            onPick={(i) => {
              setRecallIndex(i);
              if (stage === "listen") setStage("recall");
            }}
          />

          {recallIndex !== null && (
            <Question
              label={t("inferenceLabel")}
              hint={t("inferenceHint")}
              question={passage.inferenceQuestion}
              options={passage.inferenceOptions}
              picked={inferenceIndex}
              onPick={(i) => {
                setInferenceIndex(i);
                if (stage !== "write") setStage("write");
              }}
              accent
            />
          )}

          {inferenceIndex !== null && (
            <motion.section
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="rounded-[1.75rem] border-2 border-grape/40 bg-grape/5 p-6"
            >
              <p className="font-heading text-lg leading-snug font-extrabold text-balance">
                {passage.defendPrompt}
              </p>

              <label htmlFor="listen-why" className="sr-only">
                {passage.defendPrompt}
              </label>
              <textarea
                id="listen-why"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_REASONING_CHARS))}
                rows={4}
                placeholder={t("placeholder")}
                className="mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 text-base leading-relaxed font-medium outline-none focus-visible:border-grape"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-muted-foreground">
                  {t("counter", { n: text.trim().length, max: MAX_REASONING_CHARS })}
                </span>
                <Button
                  onClick={submit}
                  disabled={text.trim().length < MIN_REASONING_CHARS || pending}
                  className="btn-pop h-12 rounded-full px-7 font-bold"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("checking")}
                    </>
                  ) : (
                    t("submit")
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
        </>
      )}
    </div>
  );
}

function Question({
  label,
  hint,
  question,
  options,
  picked,
  onPick,
  accent = false,
}: {
  label: string;
  hint?: string;
  question: string;
  options: string[];
  picked: number | null;
  onPick: (index: number) => void;
  accent?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className={`rounded-[1.75rem] border-2 p-6 ${
        accent ? "border-sunny/70 bg-sunny/8" : "border-border bg-card"
      }`}
    >
      <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <h2 className="mt-2 font-heading text-xl leading-snug font-extrabold text-balance">
        {question}
      </h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {options.map((option, i) => (
          <button
            key={option}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={picked === i}
            className={`rounded-2xl border-2 px-5 py-4 text-start text-lg font-semibold transition-colors ${
              picked === i
                ? "border-grape bg-grape/10"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </motion.section>
  );
}

/** What they got, and finally the words they were listening to. */
function Verdict({
  result,
  plays,
}: {
  result: Extract<ListeningResult, { ok: true }>;
  plays: number;
}) {
  const t = useTranslations("listening");
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex flex-col gap-5"
    >
      <section className="grid gap-3 sm:grid-cols-2">
        <Outcome ok={result.recallCorrect} label={t("recallLabel")} note={result.recallFeedback} />
        <Outcome
          ok={result.inferenceCorrect}
          label={t("inferenceLabel")}
          note={result.inferenceFeedback}
        />
      </section>

      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
        <div className="flex flex-wrap items-center gap-2">
          <GradeStamp
            grade={result.quality}
            label={t(`quality.${result.quality}` as "quality.solid")}
            tilt={-6}
          />
          {result.moves.map((move) => (
            <span
              key={move.slug}
              className="rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground"
            >
              {move.label}
            </span>
          ))}
        </div>
        <p className="mt-4 leading-relaxed font-semibold">{result.response}</p>
      </section>

      <section className="rounded-[1.75rem] border-2 border-dashed border-grape/45 bg-grape/5 p-6">
        <p className="inline-flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] text-grape uppercase">
          <Sparkles className="size-4" aria-hidden />
          {t("pushbackLabel")}
        </p>
        <p className="mt-2 text-lg leading-snug font-bold text-balance">{result.pushback}</p>
      </section>

      {/* Only now. A child who missed something gets to see exactly what they
          missed, which is the part that actually teaches listening. */}
      <section className="rounded-[1.75rem] border-2 border-border bg-muted/40 p-6">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("transcriptLabel", { count: plays })}
        </p>
        <h3 className="mt-2 font-heading text-xl font-extrabold">{result.title}</h3>
        <p className="mt-3 text-[1.0625rem] leading-[1.8] font-medium">{result.transcript}</p>
      </section>
    </motion.div>
  );
}

function Outcome({ ok, label, note }: { ok: boolean; label: string; note: string }) {
  return (
    <div
      className={`rounded-[1.5rem] border-2 p-5 ${
        ok ? "border-mint/60 bg-mint/12" : "border-border bg-card"
      }`}
    >
      <p className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
        <span
          className={`grid size-5 place-items-center rounded-full ${
            ok ? "bg-mint text-[oklch(0.28_0.07_165)]" : "bg-muted-foreground/25 text-muted-foreground"
          }`}
          aria-hidden
        >
          {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        </span>
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed font-semibold">{note}</p>
    </div>
  );
}
