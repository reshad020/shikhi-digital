import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FakeOrReal } from "@/components/daily/fake-or-real";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { getActivityStreak, getAttempt, getTodaysChallenge } from "@/lib/daily/data";
import type { Tell } from "@/lib/daily/tells";

export default async function DailyPage({ params }: PageProps<"/[locale]/daily">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("daily");

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const challenge = await getTodaysChallenge(locale);

  if (!challenge) {
    return (
      <>
        <SiteHeader child={child} signedIn />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
          <CalendarDays className="size-10 text-muted-foreground" aria-hidden />
          <p className="font-heading text-2xl font-extrabold">{t("title")}</p>
          <p className="text-muted-foreground">{t("none")}</p>
        </main>
      </>
    );
  }

  const [attempt, streak] = await Promise.all([
    getAttempt(child.id, challenge.id),
    getActivityStreak(child.id),
  ]);

  // Shuffled here rather than in the browser: the true claim must not be
  // identifiable from DOM order, and a client shuffle would still ship both
  // labelled in the payload.
  const claims = [
    { slot: "true_claim" as const, text: challenge.true_claim },
    { slot: "false_claim" as const, text: challenge.false_claim },
  ];
  if ((challenge.id.charCodeAt(0) + challenge.publish_on.charCodeAt(9)) % 2 === 1) {
    claims.reverse();
  }

  const tellOptions = [...new Set([challenge.tell, ...(challenge.tell_options as string[])])].sort(
    () => 0,
  ) as Tell[];

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {attempt ? (
          <div className="flex flex-col items-center gap-3 rounded-4xl border-2 bg-card p-8 text-center shadow-pop">
            <Check className="size-10 text-mint" aria-hidden />
            <p className="font-heading text-2xl font-extrabold">{t("alreadyPlayed")}</p>
            <p className="text-muted-foreground">{t("comeBack")}</p>
            {streak.days > 0 && (
              <p className="font-bold text-tangerine">{t("streakLabel", { count: streak.days })}</p>
            )}
          </div>
        ) : (
          <FakeOrReal
            challengeId={challenge.id}
            claims={claims}
            tellOptions={tellOptions}
            startingStreak={streak.days}
          />
        )}
      </main>
    </>
  );
}
