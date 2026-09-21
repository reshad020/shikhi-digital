import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateJson } from "@/lib/gemini";
import { MOVE_LABELS, type StrongMove } from "@/lib/reasoning/moves";
import { locales, routing, type Locale } from "@/i18n/routing";
import type { WeeklyReportRow } from "@/lib/supabase/types";
import {
  MIN_ATTEMPTS_FOR_REPORT,
  climbingMove,
  endOfWeek,
  nextMove,
  pickQuote,
  startOfWeek,
  type AttemptRow,
} from "./analyse";

const NarrativeSchema = z.object({
  headline: z
    .string()
    .describe("Six words or fewer, warm and specific to this week. Not a greeting."),
  summary: z
    .string()
    .describe(
      "Two or three sentences to the parent about how their child is thinking. Plain, specific, never inflated.",
    ),
  dinnerQuestions: z
    .array(z.string())
    .min(3)
    .max(3)
    .describe("Three questions for the parent to ask out loud, away from a screen."),
});

/**
 * The narrative is written from figures this module has already computed. The
 * model never sees the raw attempts, never decides what improved, and never
 * touches the quote — it phrases findings it is handed. That separation is what
 * makes the report evidence rather than flattery.
 */
function buildSystem(locale: Locale) {
  const language = locales.find((l) => l.code === locale)?.label ?? "English";

  return `You write a short weekly note to a parent about how their 8-13 year old child has been thinking.

Write in ${language}, addressed to the parent, about their child. Never address the child.

## What you are given
Figures already worked out from what the child actually wrote this week, and one real quote in their own words. Every one of these is true. Your job is to phrase them warmly and precisely.

## What you must not do
- Do not invent progress, comparisons or milestones that are not in the figures.
- Do not call the child gifted, advanced, exceptional, or ahead of their age. Parents recognise flattery instantly and it destroys the credibility of everything else in the note.
- Do not quote or reword the child's words in your summary — the quote is shown separately, in full, exactly as they wrote it.
- Do not mention scores, percentages, levels or minutes spent.
- Do not use the words "AI", "model" or "algorithm".

## Tone
The tone of a good teacher at parents' evening: specific, unhurried, honest about where things stand. If the week was quiet, say something true about a quiet week rather than dressing it up.

## summary
Two or three sentences. Name the thinking skill they leaned on, say what that actually looks like in practice, then name the one to watch for next as something to look forward to rather than something missing.

## dinnerQuestions
Three questions for the parent to ask at the table, out loud, with no screen involved. They must:
- be answerable by the child from the topics they explored this week
- be open questions that invite an opinion or an explanation, never a fact test
- sound like a curious adult, not a worksheet
- get shorter and easier as they go, so there is always one the child can answer`;
}

export type WeeklyReportResult =
  | { status: "ready"; report: WeeklyReportRow }
  | { status: "tooEarly"; have: number; need: number; weekStart: Date };

/** Postgres `date` columns want YYYY-MM-DD, not a full timestamp. */
function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * A Supabase client this function can run against.
 *
 * Defaults to the caller's session, which is what every page wants: row level
 * security then scopes the report to the parent's own children. The weekly
 * mail job passes the service-role client instead, because it runs on a
 * schedule with no session and must see every family.
 */
type ReportClient = Awaited<ReturnType<typeof createClient>>;

export async function getWeeklyReport({
  childId,
  weekStart,
  client,
}: {
  childId: string;
  weekStart?: Date;
  client?: ReportClient;
}): Promise<WeeklyReportResult> {
  const week = startOfWeek(weekStart ?? new Date());
  const weekKey = toDateKey(week);
  const supabase = client ?? (await createClient());

  const { data: existing } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("child_id", childId)
    .eq("week_start", weekKey)
    .maybeSingle();

  if (existing) return { status: "ready", report: existing };

  const { data: rows } = await supabase
    .from("reasoning_attempts")
    .select("id, text, quality, moves, created_at, question_id, lesson_id, lessons(subject)")
    .eq("child_id", childId)
    .gte("created_at", week.toISOString())
    .lt("created_at", endOfWeek(week).toISOString())
    .order("created_at", { ascending: true });

  const attempts = rows ?? [];
  if (attempts.length < MIN_ATTEMPTS_FOR_REPORT) {
    return {
      status: "tooEarly",
      have: attempts.length,
      need: MIN_ATTEMPTS_FOR_REPORT,
      weekStart: week,
    };
  }

  // analyse.ts works on plain rows; moves arrives as jsonb, it expects a string.
  const analysable: AttemptRow[] = attempts.map((a) => ({
    id: a.id,
    text: a.text,
    quality: a.quality,
    moves: JSON.stringify(a.moves ?? []),
    createdAt: new Date(a.created_at),
    questionId: a.question_id,
  }));

  const quote = pickQuote(analysable)!;
  const climbing = climbingMove(analysable) as StrongMove;
  const next = nextMove(analysable) as StrongMove;

  const quoteRow = attempts.find((a) => a.id === quote.id)!;
  const subjects = [
    ...new Set(
      attempts
        .map((a) => (a.lessons as { subject: string } | null)?.subject)
        .filter((s): s is string => Boolean(s)),
    ),
  ];

  // The question the quote answered, so the parent has context for it.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("storyboard, locale")
    .eq("id", quoteRow.lesson_id)
    .maybeSingle();

  let quoteQuestion = "";
  try {
    const storyboard = lesson?.storyboard as { quiz?: { id: string; question: string }[] } | null;
    quoteQuestion = storyboard?.quiz?.find((q) => q.id === quote.questionId)?.question ?? "";
  } catch {
    quoteQuestion = "";
  }

  const locale = (
    routing.locales.includes(lesson?.locale as Locale) ? lesson?.locale : routing.defaultLocale
  ) as Locale;

  const qualityCounts = analysable.reduce<Record<string, number>>((acc, a) => {
    acc[a.quality] = (acc[a.quality] ?? 0) + 1;
    return acc;
  }, {});

  const prompt = `This week's figures:

- Explanations written: ${attempts.length}
- Topics explored: ${subjects.join(", ")}
- How the reasoning was rated: ${Object.entries(qualityCounts)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ")}
- Thinking skill they leaned on most: ${MOVE_LABELS[climbing]}
- Thinking skill to look for next: ${MOVE_LABELS[next]}

One thing they wrote, in their own words, answering "${quoteQuestion}":
"""
${quote.text}
"""

Write the parent's note.`;

  const { data, model } = await generateJson({
    schema: NarrativeSchema,
    system: buildSystem(locale),
    prompt,
    temperature: 0.6,
    maxOutputTokens: 2000,
  });

  const { data: created, error } = await supabase
    .from("weekly_reports")
    .insert({
      child_id: childId,
      week_start: weekKey,
      locale,
      attempt_count: attempts.length,
      lesson_count: subjects.length,
      lessons: subjects,
      quote_attempt_id: quote.id,
      quote_text: quote.text,
      quote_question: quoteQuestion,
      climbing_move: climbing,
      next_move: next,
      headline: data.headline,
      summary: data.summary,
      dinner_questions: data.dinnerQuestions,
      model,
    })
    .select()
    .single();

  if (error || !created) throw error ?? new Error("Failed to store the weekly report");
  return { status: "ready", report: created };
}
