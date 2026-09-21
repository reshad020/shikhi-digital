"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateChallenges } from "@/lib/daily/generate";
import { todayKey } from "@/lib/daily/data";
import type { Locale } from "@/i18n/routing";

/**
 * Generates a batch as DRAFTS on the next free dates.
 *
 * Nothing reaches a child until a human publishes it. This is the same rule the
 * strategy applies to news content, and it exists because a model will
 * eventually produce something confidently wrong — the only question is whether
 * a person sees it first.
 */
export async function generateDailyBatch(formData: FormData) {
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const count = Math.min(Math.max(Number(formData.get("count") ?? 5), 1), 7);

  const supabase = await createClient();

  const { data: scheduled } = await supabase
    .from("daily_challenges")
    .select("publish_on, true_claim")
    .eq("locale", locale)
    .gte("publish_on", todayKey())
    .order("publish_on", { ascending: true });

  const taken = new Set((scheduled ?? []).map((r) => r.publish_on));
  const avoid = (scheduled ?? []).map((r) => r.true_claim);

  const { challenges, model } = await generateChallenges({ locale, count, avoid });

  // Fill the earliest free days from today onward.
  const rows = [];
  const cursor = new Date(`${todayKey()}T00:00:00Z`);
  for (const challenge of challenges) {
    while (taken.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const day = cursor.toISOString().slice(0, 10);
    taken.add(day);

    rows.push({
      publish_on: day,
      locale,
      true_claim: challenge.trueClaim,
      false_claim: challenge.falseClaim,
      tell: challenge.tell,
      tell_options: [challenge.tell, ...challenge.distractorTells],
      explanation: challenge.explanation,
      source_note: challenge.sourceNote,
      status: "draft" as const,
      model,
    });
  }

  await supabase.from("daily_challenges").insert(rows);
  revalidatePath("/admin/daily");
}

export async function publishChallenge(id: string) {
  const supabase = await createClient();
  await supabase.from("daily_challenges").update({ status: "ready" }).eq("id", id);
  revalidatePath("/admin/daily");
}

export async function deleteChallenge(id: string) {
  const supabase = await createClient();
  await supabase.from("daily_challenges").delete().eq("id", id);
  revalidatePath("/admin/daily");
}

export async function reviewAttempt(formData: FormData) {
  const attemptId = String(formData.get("attemptId") ?? "");
  // Which table the writing lives in. Defended answers and steelman arguments
  // are both flagged by their graders and both land in this one queue.
  const source = String(formData.get("source") ?? "reasoning");
  const outcome = String(formData.get("outcome") ?? "ok");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!attemptId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("attempt_reviews").insert({
    attempt_id: source === "steelman" ? null : attemptId,
    steelman_attempt_id: source === "steelman" ? attemptId : null,
    reviewed_by: user.id,
    outcome: outcome === "needs_contact" ? "needs_contact" : "ok",
    note,
  });
  revalidatePath("/admin/flagged");
}

/**
 * Generates one puzzle per technique as drafts. Same rule as everything else
 * here: a human publishes before a child sees it.
 */
export async function generateTrickPuzzles(formData: FormData) {
  const { TECHNIQUES } = await import("@/lib/tricks/techniques");
  const { generatePuzzle } = await import("@/lib/tricks/generate");

  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = [];
  for (const technique of TECHNIQUES) {
    try {
      const { puzzle, options, model } = await generatePuzzle({ technique, locale });
      rows.push({
        technique: technique.slug,
        locale,
        artefact: puzzle.artefact,
        options,
        explanation: puzzle.explanation,
        status: "draft" as const,
        model,
        created_by: user?.id ?? null,
      });
    } catch (error) {
      // One bad technique should not lose the whole batch.
      console.error("[tricks] generation failed for " + technique.slug, error);
    }
  }

  if (rows.length > 0) await supabase.from("trick_puzzles").insert(rows);
  revalidatePath("/admin/tricks");
}

export async function publishPuzzle(id: string) {
  const supabase = await createClient();
  await supabase.from("trick_puzzles").update({ status: "ready" }).eq("id", id);
  revalidatePath("/admin/tricks");
}

export async function deletePuzzle(id: string) {
  const supabase = await createClient();
  await supabase.from("trick_puzzles").delete().eq("id", id);
  revalidatePath("/admin/tricks");
}
