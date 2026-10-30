"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generatePassage } from "@/lib/listening/generate";
import type { Locale } from "@/i18n/routing";

/**
 * Generates passages as DRAFTS. Nothing reaches a child unreviewed.
 *
 * The review that matters here is whether the inference question is genuinely
 * an inference. Models drift towards asking something the passage states
 * outright, which turns the second question into a duplicate of the first and
 * quietly removes the only part of the exercise that requires thinking.
 */
export async function generatePassages(formData: FormData) {
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const count = Math.min(Math.max(Number(formData.get("count") ?? 3), 1), 6);
  const topicHint = String(formData.get("topic") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("listening_passages")
    .select("title")
    .eq("locale", locale)
    .order("created_at", { ascending: false })
    .limit(40);

  const avoid = (existing ?? []).map((r) => r.title);

  // Sequential, not parallel: each call is independent and a burst of six is
  // the easiest way to hit a rate limit on a shared key.
  for (let i = 0; i < count; i++) {
    try {
      const { draft, model } = await generatePassage({ locale, topicHint, avoid });
      avoid.push(draft.title);

      await supabase.from("listening_passages").insert({
        locale,
        title: draft.title,
        topic: draft.topic,
        transcript: draft.transcript,
        recall_question: draft.recallQuestion,
        recall_options: draft.recallOptions,
        inference_question: draft.inferenceQuestion,
        inference_options: draft.inferenceOptions,
        defend_prompt: draft.defendPrompt,
        status: "draft",
        model,
        created_by: user?.id ?? null,
      });
    } catch (error) {
      // One bad generation must not lose the drafts that already succeeded.
      console.error("[admin] passage generation failed:", error);
    }
  }

  revalidatePath("/admin/listening");
}

export async function publishPassage(id: string) {
  const supabase = await createClient();
  await supabase.from("listening_passages").update({ status: "ready" }).eq("id", id);
  revalidatePath("/admin/listening");
}

export async function deletePassage(id: string) {
  const supabase = await createClient();
  await supabase.from("listening_passages").delete().eq("id", id);
  revalidatePath("/admin/listening");
}
