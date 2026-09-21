import type { MetadataRoute } from "next";
import { SITE, localeUrl } from "@/lib/seo/config";
import { createClient } from "@/lib/supabase/server";
import { TECHNIQUES } from "@/lib/tricks/techniques";

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
