import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPlayableLesson } from "@/lib/data/lessons";
import { StoryPlayer } from "@/components/storyboard/story-player";
import { SiteHeader } from "@/components/site-header";
import { getActiveChild } from "@/lib/data/children";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPlayableLesson(slug);
  if (!found) return { title: "Lesson not found" };
  return { title: found.storyboard.title, description: found.storyboard.hook };
}

export default async function LearnPage({ params }: PageProps<"/[locale]/learn/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [found, child] = await Promise.all([getPlayableLesson(slug), getActiveChild()]);
  if (!found) notFound();
  const { storyboard } = found;

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-2xl px-4 pt-10 pb-8 text-center">
          <span className="text-5xl" aria-hidden>
            {storyboard.heroEmoji}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-balance sm:text-5xl">
            {storyboard.title}
          </h1>
          <p className="mt-3 text-lg font-medium text-muted-foreground text-balance">
            {storyboard.hook}
          </p>
        </section>

        <StoryPlayer storyboard={storyboard} lessonId={found.lesson.id} />
      </main>
    </>
  );
}
