import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ear, PartyPopper } from "lucide-react";
import { ListenPlayer } from "@/components/listening/listen-player";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { countListened, getNextPassage } from "@/lib/listening/data";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/listening">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listening" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

/**
 * Listen Close.
 *
 * The first activity in the product that is not read-then-write. A child who
 * finds reading hard was previously locked out of everything here; listening
 * comprehension is a separate skill, and it is the one that carries a child
 * through a classroom and a conversation.
 */
export default async function ListeningPage({ params }: PageProps<"/[locale]/listening">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("listening");

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const [passage, done] = await Promise.all([
    getNextPassage(child.id, locale),
    countListened(child.id),
  ]);

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <header>
          <h1 className="inline-flex items-center gap-2 font-heading text-3xl font-extrabold">
            <Ear className="size-7 text-sky" aria-hidden />
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("tagline")}</p>
        </header>

        <div className="mt-8">
          {passage ? (
            <ListenPlayer passage={passage} />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-10 text-center">
              <PartyPopper className="size-10 text-sunny" aria-hidden />
              <p className="font-heading text-2xl font-extrabold">
                {done > 0 ? t("doneTitle") : t("emptyTitle")}
              </p>
              <p className="max-w-sm text-muted-foreground">
                {done > 0 ? t("doneBody", { count: done }) : t("emptyBody")}
              </p>
              <Link href="/thinking" className="font-bold text-primary underline underline-offset-4">
                {t("seeWriting")}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
