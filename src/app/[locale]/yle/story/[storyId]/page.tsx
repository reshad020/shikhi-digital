import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StoryWriter } from "@/components/yle/story-writer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { STORY_PROMPTS, storyById } from "../../../../../../content/yle-stories";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    STORY_PROMPTS.map((s) => ({ locale, storyId: s.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/yle/story/[storyId]">): Promise<Metadata> {
  const { locale, storyId } = await params;
  const story = storyById(storyId);
  if (!story) return { title: "Not found" };
  const t = await getTranslations({ locale, namespace: "yle" });
  return { title: `${story.title} — ${t("storyPart")}` };
}

/**
 * Flyers Part 7 practice.
 *
 * The page is public like the rest of YLE, but unlike the other parts this one
 * costs a model call per submission, so it is the first place a free tier will
 * be felt. Worth it: it is also the only part a competitor cannot mark.
 */
export default async function YleStoryPage({
  params,
}: PageProps<"/[locale]/yle/story/[storyId]">) {
  const { locale, storyId } = await params;
  setRequestLocale(locale);

  const story = storyById(storyId);
  if (!story) notFound();

  const t = await getTranslations("yle");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <nav className="text-sm font-semibold text-muted-foreground">
          <Link href="/yle" className="hover:text-primary">
            {t("hubTitle")}
          </Link>
          {" / "}
          <Link href="/yle/flyers" className="hover:text-primary">
            A2 Flyers
          </Link>
        </nav>

        <div className="mt-5">
          <StoryWriter prompt={story} />
        </div>
      </main>
    </>
  );
}
