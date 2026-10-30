import type { MetadataRoute } from "next";
import { SITE, localeUrl } from "@/lib/seo/config";
import { createClient } from "@/lib/supabase/server";
import { TECHNIQUES } from "@/lib/tricks/techniques";
import { TOPICS } from "@/lib/maths/topics";
import { LEVELS } from "@/lib/yle/syllabus";
import { ALL_SETS } from "../../content/yle-practice";

/**
 * Public URLs only. Anything gated behind a family's session is excluded here
 * and in robots.ts — a sitemap entry is an invitation to crawl.
 *
 * Every entry carries `alternates.languages` so the six locales are understood
 * as translations of one page rather than as competitors.
 */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const code of SITE.locales) languages[code] = localeUrl(path, code);

  return {
    url: localeUrl(path),
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1),
    // Hub C. Static content, so no database round trip and no failure mode.
    entry("/spot-the-trick", "monthly", 0.9),
    ...TECHNIQUES.map((t) => entry(`/spot-the-trick/${t.slug}`, "monthly", 0.7)),
    // YLE. Static, public and the surface people actually search for, so it
    // ranks above the trick hub rather than below it.
    entry("/yle", "weekly", 0.95),
    ...LEVELS.map((l) => entry(`/yle/${l.slug}`, "monthly", 0.9)),
    ...ALL_SETS.map((s) => entry(`/yle/practice/${s.id}`, "monthly", 0.8)),
    // Maths. Static, public, and every topic page is a complete lesson on its
    // own rather than a teaser for a gated one.
    entry("/maths", "weekly", 0.95),
    ...TOPICS.map((t) => entry(`/maths/${t.slug}`, "monthly", 0.9)),
    // Low priority but listed: it is a page a parent may well search for by
    // name, and Google's OAuth review expects to find it.
    entry("/privacy", "yearly", 0.3),
  ];

  // Published lessons are the only public dynamic surface today. Read with the
  // anon client: if RLS ever changed, the sitemap shrinks rather than leaking.
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lessons")
      .select("slug, updated_at")
      .eq("status", "ready")
      .order("updated_at", { ascending: false });

    for (const lesson of data ?? []) {
      urls.push(
        entry(`/learn/${lesson.slug}`, "monthly", 0.8, new Date(lesson.updated_at)),
      );
    }
  } catch {
    // A sitemap that renders without the dynamic section beats a 500.
  }

  return urls;
}
