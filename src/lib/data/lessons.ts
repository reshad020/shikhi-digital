import "server-only";
import { createClient } from "@/lib/supabase/server";
import { parseStoryboard, type Storyboard } from "@/lib/storyboard/schema";
import type { Lesson } from "@/lib/supabase/types";

export async function listLessons(): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  return data;
}

/** A published lesson plus its parsed storyboard, or null if either is missing. */
export async function getPlayableLesson(
  slug: string,
): Promise<{ lesson: Lesson; storyboard: Storyboard } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .eq("status", "ready")
    .maybeSingle();

  if (!data) return null;
  const storyboard = parseStoryboard(data.storyboard);
  return storyboard ? { lesson: data, storyboard } : null;
}

/** Published lessons for the browse list, newest first. */
export async function listPublishedLessons(locale?: string): Promise<Lesson[]> {
  const supabase = await createClient();
  let query = supabase
    .from("lessons")
    .select("*")
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (locale) query = query.eq("locale", locale);

  const { data } = await query;
  return data ?? [];
}

/** What the browse grid needs — and nothing else. */
export type LessonCard = {
  slug: string;
  subject: string;
  title: string;
  hook: string;
  heroEmoji: string;
  scenes: number;
  questions: number;
  /** Questions on this lesson that will ask the child to justify themselves. */
  defends: number;
};

/**
 * Published lessons, reduced to card data.
 *
 * The storyboard is parsed and thrown away here rather than handed to the
 * grid: a full storyboard carries every scene, every quiz option and every
 * correct answer, and a browse page has no business shipping the answers to
 * lessons the child has not played yet.
 */
export async function listLessonCards(locale?: string): Promise<LessonCard[]> {
  const lessons = await listPublishedLessons(locale);

  return lessons.flatMap((lesson) => {
    const storyboard = parseStoryboard(lesson.storyboard);
    if (!storyboard) return [];

    return [
      {
        slug: lesson.slug,
        subject: lesson.subject,
        title: storyboard.title,
        hook: storyboard.hook,
        heroEmoji: storyboard.heroEmoji,
        scenes: storyboard.scenes.length,
        questions: storyboard.quiz.length,
        defends: storyboard.quiz.filter((q) => q.defend).length,
      },
    ];
  });
}
