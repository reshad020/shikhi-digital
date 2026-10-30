"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, Lightbulb, Loader2, PenLine, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitStory, type StoryResult } from "@/lib/yle/story-actions";
import { MAX_STORY_CHARS, MIN_STORY_CHARS } from "@/lib/yle/items";
import type { StoryPrompt } from "../../../content/yle-stories";

/**
 * Flyers Part 7, the story task.
 *
 * The result is ordered on purpose: what they did well, then at most three
 * named fixes, then the mark — last and smallest. A child who sees "3 out of
 * 5" first reads nothing else, and the fixes are the only part that changes
 * the next story.
 */
export function StoryWriter({ prompt }: { prompt: StoryPrompt }) {
  const t = useTranslations("yle");
  const reduced = useReducedMotion();

  const [text, setText] = useState("");
  const [result, setResult] = useState<StoryResult | null>(null);
  const [pending, startTransition] = useTransition();

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = text.trim().length < MIN_STORY_CHARS;

  function submit() {
    if (tooShort || pending) return;
    startTransition(async () => setResult(await submitStory({ promptId: prompt.id, text })));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6 shadow-pop-sm">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("storyPart")}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold">{prompt.title}</h2>
        <p className="mt-2 text-muted-foreground">{t("storyInstruction")}</p>

        <ol className="mt-5 flex flex-col gap-3">
          {prompt.moments.map((moment, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-grape text-sm font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-[1.0625rem] leading-snug font-semibold">{moment}</span>
            </li>
          ))}
        </ol>

        {/* Said plainly: the real paper gives pictures, and a child should know
            which half of the task they are rehearsing here. */}
        <p className="mt-5 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {t("storyPicturesNote")}
        </p>
      </section>

      {!result?.ok && (
        <section className="rounded-[1.75rem] border-2 border-grape/40 bg-grape/5 p-6">
          <p className="inline-flex items-center gap-2 font-heading text-sm font-extrabold">
            <Lightbulb className="size-4 text-sunny" aria-hidden />
            {prompt.tip}
          </p>

          <label htmlFor="story" className="sr-only">
            {prompt.title}
          </label>
          <textarea
            id="story"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_STORY_CHARS))}
            rows={8}
            placeholder={t("storyPlaceholder")}
            className="mt-4 w-full resize-none rounded-2xl border-2 border-border bg-background p-4 text-base leading-relaxed font-medium outline-none focus-visible:border-grape"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-muted-foreground">
              {t("storyWords", { n: words })}
            </span>
            <Button
              onClick={submit}
              disabled={tooShort || pending}
              className="btn-pop h-12 rounded-full px-7 font-bold"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("storyMarking")}
                </>
              ) : (
                <>
                  <PenLine className="size-4" />
                  {t("storySubmit")}
                </>
              )}
            </Button>
          </div>

          {result && !result.ok && (
            <p className="mt-3 text-sm font-bold text-destructive">
              {t(`storyErrors.${result.error}` as "storyErrors.service")}
            </p>
          )}
        </section>
      )}

      {result?.ok && <Verdict verdict={result.verdict} text={text} reduced={!!reduced} />}
    </div>
  );
}

function Verdict({
  verdict,
  text,
  reduced,
}: {
  verdict: Extract<StoryResult, { ok: true }>["verdict"];
  text: string;
  reduced: boolean;
}) {
  const t = useTranslations("yle");

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 230, damping: 24 }}
      className="flex flex-col gap-5"
    >
      {/* What they wrote, kept on screen: the fixes below quote it. */}
      <section className="rounded-[1.75rem] border-2 border-border bg-card p-6">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("storyYours")}
        </p>
        <p className="mt-2 text-[1.0625rem] leading-[1.8] font-medium whitespace-pre-line">
          {text.trim()}
        </p>
      </section>

      <section className="rounded-[1.75rem] border-2 border-mint/60 bg-mint/12 p-6">
        <p className="inline-flex items-center gap-2 font-heading text-sm font-extrabold">
          <Sparkles className="size-4" aria-hidden />
          {t("storyStrength")}
        </p>
        <p className="mt-2 leading-relaxed font-semibold">{verdict.strength}</p>
      </section>

      <section>
        <h3 className="font-heading text-xl font-extrabold">{t("storyFixes")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("storyFixesNote")}</p>

        <ul className="mt-4 flex flex-col gap-3">
          {verdict.fixes.map((fix, i) => (
            <li key={i} className="rounded-[1.5rem] border-2 border-border bg-card p-5">
              <p className="text-sm leading-relaxed font-semibold text-muted-foreground line-through decoration-destructive/60 decoration-2">
                {fix.quote}
              </p>
              <p className="mt-2 flex items-start gap-2 text-[1.0625rem] leading-snug font-bold">
                <Check className="mt-1 size-4 shrink-0 text-mint" aria-hidden />
                {fix.better}
              </p>
              <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm font-semibold">
                {fix.why}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* The mark comes last and smallest. A child who reads "3 out of 5"
          first stops reading, and the fixes above are the only part that
          changes the next story. */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border-2 border-border bg-muted/40 p-6">
        <div>
          <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            {t("storyMark")}
          </p>
          <p className="mt-1 font-heading text-2xl font-extrabold">
            {t("storyOutOf", { mark: verdict.mark })}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {verdict.coversAll ? t("storyCoversAll") : t("storyMissedOne")}
          </p>
        </div>
        <div className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Shield
              key={i}
              className={`size-7 ${i < verdict.mark ? "fill-sunny text-sunny" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border-2 border-dashed border-grape/45 bg-grape/5 p-6">
        <p className="font-heading text-xs font-extrabold tracking-[0.14em] text-grape uppercase">
          {t("storyNextTime")}
        </p>
        <p className="mt-2 text-lg leading-snug font-bold text-balance">{verdict.nextTime}</p>
      </section>
    </motion.div>
  );
}
