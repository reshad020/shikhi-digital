"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveChild } from "@/lib/data/children";
import { routing, type Locale } from "@/i18n/routing";
import { MOVE_LABELS, type ThinkingMove } from "@/lib/reasoning/moves";
import { gradeSteelman } from "./grade";
import { MAX_STEELMAN_CHARS, MIN_STEELMAN_CHARS, type Fairness } from "./schema";

export type SteelmanResult =
  | {
      ok: true;
      fairness: Fairness;
      quality: "developing" | "solid" | "excellent";
      moves: { slug: string; label: string }[];
      response: string;
      pushback: string;
      /** The strongest point we had for the side they argued, revealed now. */
      bestPoint: string;
    }
  | { ok: false; error: string };

/**
 * Grade one steelman argument and store it.
 *
 * Everything that matters is re-derived from the database: the client sends a
 * prompt id, which side the child believes, and their text. It never sends the
 * claim, the sides, or the strongest points — so a modified payload cannot
 * feed the grader a softer question than the one on screen, and the reveal
 * cannot be fished out before the child has written anything.
 */
export async function submitSteelman(input: {
  promptId: string;
  believes: "a" | "b";
  text: string;
}): Promise<SteelmanResult> {
  const text = input.text.trim();

  if (text.length < MIN_STEELMAN_CHARS) return { ok: false, error: "tooShort" };
  if (text.length > MAX_STEELMAN_CHARS) return { ok: false, error: "tooLong" };
  if (input.believes !== "a" && input.believes !== "b") return { ok: false, error: "badInput" };

  try {
    const child = await getActiveChild();
    if (!child) return { ok: false, error: "noChild" };

    const supabase = await createClient();

    const { data: prompt } = await supabase
      .from("steelman_prompts")
      .select("id, locale, claim, context, side_a, side_b, best_for_a, best_for_b")
      .eq("id", input.promptId)
      .eq("status", "ready")
      .maybeSingle();

    if (!prompt) return { ok: false, error: "notFound" };

    // They argue the side they did NOT pick. Derived here, never sent.
    const arguedSide = input.believes === "a" ? prompt.side_b : prompt.side_a;
    const believedSide = input.believes === "a" ? prompt.side_a : prompt.side_b;
    const bestPoint = input.believes === "a" ? prompt.best_for_b : prompt.best_for_a;

    const locale = (
      routing.locales.includes(prompt.locale as Locale) ? prompt.locale : routing.defaultLocale
    ) as Locale;

    const { verdict, model } = await gradeSteelman({
      locale,
      claim: prompt.claim,
      context: prompt.context,
      believedSide,
      arguedSide,
      childText: text,
    });

    const { error } = await supabase.from("steelman_attempts").insert({
      child_id: child.id,
      prompt_id: prompt.id,
      believes: input.believes,
      text,
      quality: verdict.quality,
      fairness: verdict.fairness,
      moves: verdict.moves,
      response: verdict.response,
      pushback: verdict.pushback,
      flagged: verdict.flagged,
    });

    // 23505 = this child already argued this claim. Not worth an error screen;
    // they still get to read the verdict they just earned.
    if (error && error.code !== "23505") throw error;

    void model;

    // Deliberately not revalidating. The verdict, the reveal and the pushback
    // are the entire payoff, and re-rendering the page would swap in the next
    // claim the instant the child earned them — the same mistake the daily
    // challenge made once.
    return {
      ok: true,
      fairness: verdict.fairness,
      quality: verdict.quality,
      moves: verdict.moves.map((slug) => ({
        slug,
        label: MOVE_LABELS[slug as ThinkingMove] ?? slug,
      })),
      response: verdict.response,
      pushback: verdict.pushback,
      bestPoint,
    };
  } catch (error) {
    console.error("[steelman] submit failed:", error);
    return { ok: false, error: "service" };
  }
}
