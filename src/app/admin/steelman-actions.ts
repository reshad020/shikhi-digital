"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateSteelmanPrompt } from "@/lib/steelman/generate";
import type { Locale } from "@/i18n/routing";

/**
 * Generates claims as DRAFTS. Nothing reaches a child unreviewed.
 *
 * The review that matters here is not tone, it is whether both sides are
 * genuinely arguable. A claim with an obviously correct side produces
 * strawmen from every child who tries it and then marks them down for the
 * prompt's failure — so the draft shows both prepared arguments side by side,
 * which makes a lopsided claim visible at a glance.
 */
export async function generateSteelmanPrompts(formData: FormData) {
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const count = Math.min(Math.max(Number(formData.get("count") ?? 3), 1), 6);
  const topicHint = String(formData.get("topic") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sequential rather than parallel: each call is independent, and a burst of
  // six is the easiest way to hit a rate limit on a shared key.
  for (let i = 0; i < count; i++) {
    try {
      const { draft, model } = await generateSteelmanPrompt({ locale, topicHint });

      await supabase.from("steelman_prompts").insert({
        locale,
        claim: draft.claim,
        context: draft.context,
        side_a: draft.sideA,
        side_b: draft.sideB,
        best_for_a: draft.bestForA,
        best_for_b: draft.bestForB,
        status: "draft",
        model,
        created_by: user?.id ?? null,
      });
    } catch (error) {
      // One bad generation must not lose the drafts that already succeeded.
      console.error("[admin] steelman generation failed:", error);
    }
  }

  revalidatePath("/admin/steelman");
}

export async function publishSteelmanPrompt(id: string) {
  const supabase = await createClient();
  await supabase.from("steelman_prompts").update({ status: "ready" }).eq("id", id);
  revalidatePath("/admin/steelman");
}

export async function deleteSteelmanPrompt(id: string) {
  const supabase = await createClient();
  await supabase.from("steelman_prompts").delete().eq("id", id);
  revalidatePath("/admin/steelman");
}
