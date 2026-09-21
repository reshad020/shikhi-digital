"use client";

import { useActionState, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { locales } from "@/i18n/routing";
import { createLesson, type LessonFormState } from "../../actions";

const initialState: LessonFormState = {};

const SAMPLE = `Nelson Mandela was born in 1918 in a small village in South Africa. ...`;

export function LessonForm() {
  const [state, formAction, pending] = useActionState(createLesson, initialState);
  const [sourceText, setSourceText] = useState("");

  const words = sourceText.trim().split(/\s+/).filter(Boolean).length;
  const inRange = words >= 150 && words <= 900;

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="p-6">
        <form action={formAction} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold">Who or what is this about?</span>
              <input
                name="subject"
                required
                placeholder="Nelson Mandela"
                className="h-12 rounded-2xl border-2 border-border bg-background px-4 outline-none focus-visible:border-ring"
              />
              {state.fieldErrors?.subject && (
                <span className="text-sm font-semibold text-destructive">
                  {state.fieldErrors.subject}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold">Language</span>
              <select
                name="locale"
                defaultValue="en"
                className="h-12 rounded-2xl border-2 border-border bg-background px-4 outline-none focus-visible:border-ring"
              >
                {locales.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between text-sm font-bold">
              Your writing
              <span
                className={`text-xs font-semibold ${
                  words === 0
                    ? "text-muted-foreground"
                    : inRange
                      ? "text-mint"
                      : "text-destructive"
                }`}
              >
                {words} words {words > 0 && !inRange && "(aim for 400-500)"}
              </span>
            </span>
            <textarea
              name="sourceText"
              required
              rows={16}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={SAMPLE}
              className="resize-y rounded-2xl border-2 border-border bg-background p-4 font-sans leading-relaxed outline-none focus-visible:border-ring"
            />
            {state.fieldErrors?.sourceText && (
              <span className="text-sm font-semibold text-destructive">
                {state.fieldErrors.sourceText}
              </span>
            )}
          </label>

          {state.error && (
            <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={pending}
              className="btn-pop h-12 rounded-full px-6 text-base font-bold"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {pending ? "Designing the storyboard…" : "Generate storyboard"}
            </Button>
            {pending && (
              <span className="text-sm text-muted-foreground">
                This usually takes 15-40 seconds.
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
