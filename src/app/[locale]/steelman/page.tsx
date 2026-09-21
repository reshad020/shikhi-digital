import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PartyPopper, Swords } from "lucide-react";
import { Arena } from "@/components/steelman/arena";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { countAttempts, getNextPrompt } from "@/lib/steelman/data";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/steelman">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "steelman" });
  // A child's own writing lives behind this route the moment they submit.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function SteelmanPage({ params }: PageProps<"/[locale]/steelman">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("steelman");

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const [prompt, done] = await Promise.all([
    getNextPrompt(child.id, locale),
    countAttempts(child.id),
  ]);

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <header>
          <h1 className="inline-flex items-center gap-2 font-heading text-3xl font-extrabold">
            <Swords className="size-7 text-grape" aria-hidden />
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
        </header>

        <div className="mt-8">
          {prompt ? (
            <Arena prompt={prompt} />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-10 text-center">
              <PartyPopper className="size-10 text-sunny" aria-hidden />
              <p className="font-heading text-2xl font-extrabold">
                {done > 0 ? t("doneTitle") : t("emptyTitle")}
              </p>
              <p className="max-w-sm text-muted-foreground">
                {done > 0 ? t("doneBody", { count: done }) : t("emptyBody")}
              </p>
              <Link
                href="/progress"
                className="font-bold text-primary underline underline-offset-4"
              >
                {t("seeProgress")}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
