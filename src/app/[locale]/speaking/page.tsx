import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mic, PartyPopper } from "lucide-react";
import { CuePractice } from "@/components/speaking/cue-practice";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { nextCue } from "@/lib/speaking/data";
import type { SpeakingCue } from "@/lib/speaking/cue";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/speaking">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "speaking" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

/**
 * Speak Up.
 *
 * Speaking is the skill this product is for, and the one a learner will find
 * a reason to skip. So the page asks for one small thing, hands over the words
 * first, and never shows a score.
 *
 * Content comes from the shared pool, which generates on a miss -- so the bank
 * grows as the product is used rather than being a fixed file. The hand-written
 * starters (`npm run seed:speaking`) are what make this work on a cold
 * database and on a day the model is unreachable.
 */
export default async function SpeakingPage({ params }: PageProps<"/[locale]/speaking">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("speaking");

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  /**
   * A dry pool is an ordinary Tuesday, not an exception.
   *
   * `serveFromPool` generates when it has nothing unseen and the pool is too
   * thin to repeat, so this throws whenever the model is out of credit, rate
   * limited or unreachable. That must not be a stack trace: the child came
   * here to speak, and the honest answer is "nothing new right now", not a
   * crashed page. Logged so the operator sees it even though the child does not.
   */
  let cue: SpeakingCue | null = null;
  let repeat = false;
  try {
    const served = await nextCue(child.id, undefined, locale);
    cue = served.payload;
    repeat = served.repeat;
  } catch (error) {
    console.error("[speaking] could not serve a cue:", error);
  }

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <header className="mb-8">
          <h1 className="inline-flex items-center gap-2 font-heading text-3xl font-extrabold">
            <Mic className="size-7 text-bubblegum" aria-hidden />
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
        </header>

        {cue ? (
          <CuePractice cue={cue} repeat={repeat} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-10 text-center">
            <PartyPopper className="size-10 text-sunny" aria-hidden />
            <p className="font-heading text-2xl font-extrabold">{t("emptyTitle")}</p>
            <p className="max-w-sm text-muted-foreground">{t("emptyBody")}</p>
            <Link href="/learn" className="font-bold text-primary underline underline-offset-4">
              {t("emptyLink")}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
