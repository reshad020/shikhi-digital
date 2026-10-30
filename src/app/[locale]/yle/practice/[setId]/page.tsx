import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PracticePlayer } from "@/components/yle/practice-player";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { levelBySlug } from "@/lib/yle/syllabus";
import { ALL_SETS, setById } from "../../../../../../content/yle-practice";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ALL_SETS.map((set) => ({ locale, setId: set.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/yle/practice/[setId]">): Promise<Metadata> {
  const { setId } = await params;
  const set = setById(setId);
  return set ? { title: set.title } : { title: "Not found" };
}

/**
 * One practice set.
 *
 * Public and prerendered. A child should be able to practise without an
 * account, because the first thing a parent wants is to try it before being
 * asked for an email — and because every item here is marked in the browser,
 * an anonymous attempt costs nothing to serve. Progress tracking is what an
 * account buys.
 */
export default async function YlePracticePage({
  params,
}: PageProps<"/[locale]/yle/practice/[setId]">) {
  const { locale, setId } = await params;
  setRequestLocale(locale);

  const set = setById(setId);
  if (!set) notFound();

  const level = levelBySlug(set.level);
  const t = await getTranslations("yle");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <nav className="text-sm font-semibold text-muted-foreground">
          <Link href="/yle" className="hover:text-primary">
            {t("hubTitle")}
          </Link>
          {level && (
            <>
              {" / "}
              <Link href={`/yle/${level.slug}`} className="hover:text-primary">
                {level.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-5">
          <PracticePlayer set={set} />
        </div>
      </main>
    </>
  );
}
