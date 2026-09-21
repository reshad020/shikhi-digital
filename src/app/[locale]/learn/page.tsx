import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarDays, ScanSearch, Swords, TrendingUp } from "lucide-react";
import { LessonGrid } from "@/components/library/lesson-grid";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getActiveChild } from "@/lib/data/children";
import { listLessonCards } from "@/lib/data/lessons";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  return { title: t("heading") };
}

/**
 * The library — and the signed-in home, since the proxy sends families here
 * from `/`.
 *
 * `/learn/[slug]` has existed since the beginning; `/learn` did not, so every
 * link pointing at "lessons" anywhere in the product led somewhere with no
 * lessons on it, and a lesson was reachable only by typing its slug.
 */
export default async function LearnIndexPage({ params }: PageProps<"/[locale]/learn">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [child, lessons, t] = await Promise.all([
    getActiveChild(),
    listLessonCards(locale),
    getTranslations("library"),
  ]);

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <header>
          <h1 className="font-heading text-3xl font-extrabold text-balance sm:text-4xl">
            {child ? t("greeting", { name: child.name }) : t("greetingAnon")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </header>

        {/* The two daily habits sit above the library on purpose: both are
            short, both are meant to be returned to, and both feed the same
            progression a lesson does. */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Shortcut
            href="/daily"
            icon={<CalendarDays className="size-5 text-sky" />}
            title={t("shortcutDaily")}
            note={t("shortcutDailyNote")}
          />
          <Shortcut
            href="/tricks"
            icon={<ScanSearch className="size-5 text-bubblegum" />}
            title={t("shortcutTricks")}
            note={t("shortcutTricksNote")}
          />
          <Shortcut
            href="/steelman"
            icon={<Swords className="size-5 text-grape" />}
            title={t("shortcutSteelman")}
            note={t("shortcutSteelmanNote")}
          />
          <Shortcut
            href="/progress"
            icon={<TrendingUp className="size-5 text-mint" />}
            title={t("shortcutProgress")}
            note={t("shortcutProgressNote")}
          />
        </div>

        <h2 className="mt-12 font-heading text-2xl font-extrabold">{t("heading")}</h2>
        <div className="mt-5">
          <LessonGrid lessons={lessons} />
        </div>
      </main>
    </>
  );
}

function Shortcut({
  href,
  icon,
  title,
  note,
}: {
  href: "/daily" | "/tricks" | "/progress" | "/steelman";
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-3xl border-2 border-border bg-card p-4 shadow-pop-sm transition-colors hover:border-primary/50"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading font-extrabold">{title}</span>
        <span className="block truncate text-xs font-semibold text-muted-foreground">{note}</span>
      </span>
      <ArrowRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
        aria-hidden
      />
    </Link>
  );
}
