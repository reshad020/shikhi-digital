import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Landing } from "@/components/landing/landing";
import { SiteHeader } from "@/components/site-header";
import { alternatesFor } from "@/lib/seo/config";

/**
 * The landing page — and nothing else.
 *
 * Signed-in families never reach it: the proxy sends them to `/learn`, which
 * is where a child actually wants to land. Keeping the branch out of this file
 * is what lets the page stay **static**. Reading the session here would make
 * the most conversion-critical page in the product server-render on every
 * request, uncacheable, behind an auth round trip — and the proxy already
 * resolves the user on every request anyway, so the check is free there.
 */
export async function generateMetadata(): Promise<Metadata> {
  // The root of each locale, with its six alternates and x-default.
  return { alternates: alternatesFor("/") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Landing />
      </main>
    </>
  );
}
