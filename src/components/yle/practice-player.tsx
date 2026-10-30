"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, RotateCcw, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { isCorrect, jumble, type PracticeSet } from "@/lib/yle/items";
import { MAX_SHIELDS_PER_PAPER, shieldsFor } from "@/lib/yle/syllabus";
import { recordAttempt } from "@/lib/yle/actions";

/**
 * YLE practice, marked in the browser.
 *
 * Every item type here has an exact answer, so there is no grader call, no
 * cost per attempt and nothing to break when an API is down. A child can sit
 * ten sets back to back and the only limit is their patience.
 *
 * Two decisions that are about exam preparation rather than about software:
 *
 * - **Nothing is marked until the whole set is submitted.** The real paper
 *   gives no feedback until it is over, and a child who has practised with a
 *   green tick after every question has practised a different task.
 * - **Every answer gets its note, right or wrong.** The note explains *why*
 *   the answer is what it is — "'how many' asks for a number" — because the
 *   point is the rule, not the mark. A child who only learns they were wrong
 *   has learned the least useful half.
 */
export function PracticePlayer({ set }: { set: PracticeSet }) {
  const t = useTranslations("yle");
  const reduced = useReducedMotion();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState(false);
  /**
   * Whether the attempt was kept.
   *
   * Deliberately learned from the save itself rather than from a prop. The
   * page is prerendered for every set in every locale, and reading the session
   * there to pass `signedIn` down would make all 198 of them dynamic — paying
   * for a server render on the whole public bank to decide which of two
   * sentences to show at the end. The action already knows, so it reports
   * back, and the page stays static.
   */
  const [saveState, setSaveState] = useState<"idle" | "saved" | "anonymous">("idle");
  const [, startSaving] = useTransition();
  /**
   * When the child started answering, not when the tab opened.
   *
   * Starts null and is set on the first answer. That keeps `Date.now()` out of
   * render, which the React Compiler rejects as impure, and it measures the
   * right thing anyway: a set left open in a background tab for an hour took
   * four minutes of work, not sixty.
   */
  const startedAt = useRef<number | null>(null);

  const gaps = useMemo(
    () => (set.passage ? set.passage.split(/___\s*(?:\(\d+\))?/g) : null),
    [set.passage],
  );

  const results = useMemo(
    () => set.questions.map((q) => isCorrect(q, answers[q.id] ?? "")),
    [set.questions, answers],
  );
  const correct = results.filter(Boolean).length;
  const shields = shieldsFor(correct, set.questions.length);
  const answeredAll = set.questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  function set1(id: string, value: string) {
    if (marked) return;
    startedAt.current ??= Date.now();
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function reset() {
    setAnswers({});
    setMarked(false);
    setSaveState("idle");
    startedAt.current = null;
  }

  /**
   * Mark, then record.
   *
   * The result appears from the browser's own marking, with no await in front
   * of it: a slow network must never hold up the answer a child is waiting
   * for. Saving happens behind that, and the server marks the set again from
   * the catalogue rather than trusting what is sent — so the only thing the
   * client decides is what to display.
   */
  function markIt() {
    setMarked(true);

    startSaving(async () => {
      const result = await recordAttempt({
        setId: set.id,
        answers,
        seconds: startedAt.current
          ? Math.round((Date.now() - startedAt.current) / 1000)
          : undefined,
      });
      setSaveState(result.saved ? "saved" : "anonymous");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("partLabel", { part: set.part })}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold text-balance">{set.title}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{set.instruction}</p>

        {set.wordBox && (
          <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border-2 border-dashed border-border p-4">
            {set.wordBox.map((word) => (
              <span
                key={word}
                className="rounded-full border-2 border-border bg-background px-3 py-1 font-heading text-sm font-bold"
              >
                {word}
              </span>
            ))}
          </div>
        )}

        {/* The passage, with the gaps numbered in place so a child reads the
            whole text rather than hopping between isolated sentences. */}
        {gaps && (
          <p className="mt-5 text-[1.0625rem] leading-[2] font-medium whitespace-pre-line">
            {gaps.map((chunk, i) => (
              <span key={i}>
                {chunk}
                {i < gaps.length - 1 && (
                  <span className="mx-1 inline-flex min-w-16 items-center justify-center rounded-lg border-2 border-grape/50 bg-grape/8 px-2 font-heading text-sm font-extrabold text-grape">
                    {i + 1}
                  </span>
                )}
              </span>
            ))}
          </p>
        )}
      </section>

      <ol className="flex flex-col gap-3">
        {set.questions.map((q, i) => {
          const given = answers[q.id] ?? "";
          const ok = results[i];

          return (
            <li
              key={q.id}
              className={`rounded-[1.5rem] border-2 p-5 transition-colors ${
                !marked
                  ? "border-border bg-card"
                  : ok
                    ? "border-mint/60 bg-mint/10"
                    : "border-tangerine/60 bg-tangerine/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full font-heading text-sm font-extrabold ${
                    !marked
                      ? "bg-muted text-muted-foreground"
                      : ok
                        ? "bg-mint text-[oklch(0.28_0.07_165)]"
                        : "bg-tangerine text-white"
                  }`}
                >
                  {marked ? ok ? <Check className="size-4" /> : <X className="size-4" /> : i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base leading-snug font-bold text-balance">
                    {q.prompt}
                  </p>

                  {set.kind === "spelling" && (
                    <p className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
                      {jumble(q.answer, q.id).map((letter, n) => (
                        <span
                          key={n}
                          className="grid size-8 place-items-center rounded-lg border-2 border-border bg-background font-heading text-base font-extrabold uppercase"
                        >
                          {letter}
                        </span>
                      ))}
                    </p>
                  )}

                  {q.options ? (
                    <div className="mt-3 flex flex-col gap-2">
                      {q.options.map((option, n) => {
                        const picked = given === option;
                        const isAnswer = marked && option === q.answer;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={marked}
                            onClick={() => set1(q.id, option)}
                            aria-pressed={picked}
                            className={`rounded-2xl border-2 px-4 py-3 text-start font-semibold transition-colors ${
                              isAnswer
                                ? "border-mint bg-mint/20"
                                : picked
                                  ? marked
                                    ? "border-tangerine bg-tangerine/15"
                                    : "border-grape bg-grape/10"
                                  : "border-border bg-background hover:border-primary/50 disabled:opacity-70"
                            }`}
                          >
                            <span className="me-2 font-heading font-extrabold text-muted-foreground">
                              {String.fromCharCode(65 + n)}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      value={given}
                      disabled={marked}
                      onChange={(e) => set1(q.id, e.target.value)}
                      placeholder={t("typeHere")}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="mt-3 h-12 w-full max-w-xs rounded-2xl border-2 border-border bg-background px-4 text-base font-semibold outline-none focus-visible:border-grape disabled:opacity-80"
                    />
                  )}

                  {/* The note is the point. Shown whether they got it right or
                      not, because the rule is what transfers to the real paper. */}
                  {marked && (
                    <div className="mt-3 rounded-2xl border-2 border-dashed border-border bg-background/60 px-4 py-3">
                      {!ok && (
                        <p className="font-heading text-sm font-extrabold">
                          {t("theAnswer", { answer: q.answer })}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed font-semibold text-muted-foreground">
                        {q.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {!marked ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted-foreground">
            {t("answeredCount", { n: Object.values(answers).filter((v) => v.trim()).length, total: set.questions.length })}
          </p>
          <Button
            onClick={markIt}
            disabled={!answeredAll}
            className="btn-pop h-13 rounded-full px-8 text-base font-extrabold"
          >
            {t("markIt")}
            <ArrowRight className="size-5 rtl:rotate-180" />
          </Button>
        </div>
      ) : (
        <motion.section
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 230, damping: 24 }}
          className="rounded-[1.75rem] border-2 border-grape/40 bg-grape/5 p-6 text-center"
        >
          <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            {t("yourScore", { correct, total: set.questions.length })}
          </p>

          <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
            {Array.from({ length: MAX_SHIELDS_PER_PAPER }).map((_, i) => (
              <Shield
                key={i}
                className={`size-8 ${i < shields ? "fill-sunny text-sunny" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="mt-2 font-heading text-xl font-extrabold">
            {t("shields", { n: shields, max: MAX_SHIELDS_PER_PAPER })}
          </p>

          {/* Said plainly, because it is the single most reassuring fact about
              YLE and most preparation sites bury it. */}
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-semibold text-muted-foreground">
            {t("shieldsNote")}
          </p>

          {/* The moment a child has just earned something is the only moment
              an account is worth anything to them, and it was the one moment
              the product asked for nothing. Signed in, it says the work
              counted; signed out, it says what was lost — once, plainly, with
              the practice already finished and nothing withheld. */}
          {saveState === "saved" && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1.5 text-sm font-bold text-[oklch(0.42_0.1_165)] dark:text-mint">
              <Check className="size-4" />
              {t("savedToProgress")}
            </p>
          )}

          {saveState === "anonymous" && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-grape/40 px-5 py-4">
              <p className="font-heading font-extrabold">{t("keepShieldsTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed font-semibold text-muted-foreground">
                {t("keepShieldsBody")}
              </p>
              <Button
                nativeButton={false}
                className="btn-pop mt-3 h-11 rounded-full px-6 font-extrabold"
                render={<Link href="/signup" />}
              >
                {t("keepShieldsCta")}
              </Button>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={reset}
              className="h-12 rounded-full border-2 font-bold"
            >
              <RotateCcw className="size-4" />
              {t("tryAgain")}
            </Button>
            <Button
              nativeButton={false}
              className="btn-pop h-12 rounded-full px-6 font-bold"
              render={<Link href={`/yle/${set.level}`} />}
            >
              {t("morePractice")}
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
}
