"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateStoryboard, StoryboardError } from "@/lib/storyboard/generate";
import { routing, type Locale } from "@/i18n/routing";

export type LessonFormState = { error?: string; fieldErrors?: Record<string, string> };

const MIN_WORDS = 150;
const MAX_WORDS = 900;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function slugify(value: string) {
  const base = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "lesson";
}

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(subject: string) {
  const supabase = await createClient();
  const base = slugify(subject);
  for (let n = 1; n < 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { data } = await supabase.from("lessons").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Creates the lesson row first, then generates. If generation fails the lesson
 * still exists with status "failed" and the error attached, so the admin can
 * fix their text and retry instead of losing what they wrote.
 *
 * Authorisation is not checked here: the insert policy on `lessons` requires
 * is_admin(), so a non-admin's write is refused by the database.
 */
export async function createLesson(
  _prev: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  const subject = String(formData.get("subject") ?? "").trim();
  const sourceText = String(formData.get("sourceText") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");

  const fieldErrors: Record<string, string> = {};
  if (subject.length < 2) fieldErrors.subject = "Who or what is this lesson about?";
  if (!routing.locales.includes(locale as Locale)) fieldErrors.locale = "Pick a language.";

  const words = countWords(sourceText);
  if (words < MIN_WORDS) {
    fieldErrors.sourceText = `Write at least ${MIN_WORDS} words — you have ${words}.`;
  } else if (words > MAX_WORDS) {
    fieldErrors.sourceText = `Keep it under ${MAX_WORDS} words — you have ${words}.`;
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      subject,
      source_text: sourceText,
      locale,
      slug: await uniqueSlug(subject),
      status: "generating",
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !lesson) {
    return { error: "Could not create the lesson. Are you signed in as an admin?" };
  }

  await runGeneration(lesson.id);
  redirect(`/admin/lessons/${lesson.id}`);
}

export async function regenerateLesson(lessonId: string) {
  const supabase = await createClient();
  await supabase
    .from("lessons")
    .update({ status: "generating", error: null })
    .eq("id", lessonId);
  await runGeneration(lessonId);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath("/admin");
  redirect("/admin");
}

async function runGeneration(lessonId: string) {
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, subject, source_text, locale, slug")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return;

  try {
    const { storyboard, model } = await generateStoryboard({
      subject: lesson.subject,
      sourceText: lesson.source_text,
      locale: lesson.locale as Locale,
    });

    await supabase
      .from("lessons")
      .update({ storyboard, model, status: "ready", error: null })
      .eq("id", lessonId);

    revalidatePath(`/${lesson.locale}/learn/${lesson.slug}`);
  } catch (error) {
    const message =
      error instanceof StoryboardError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Generation failed for an unknown reason.";
    await supabase.from("lessons").update({ status: "failed", error: message }).eq("id", lessonId);
  }
}
