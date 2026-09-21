import type { Metadata } from "next";
import { Baloo_2, Nunito, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { directionOf, routing } from "@/i18n/routing";
import { SITE, alternatesFor } from "@/lib/seo/config";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schema";
import "../globals.css";

// Rounded and chunky for headings; Nunito is highly legible for early readers.
const heading = Baloo_2({ variable: "--font-heading", subsets: ["latin"] });
const body = Nunito({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${SITE.name}` },
    description,
    // Six locales previously served with no alternates at all, which reads to a
    // crawler as six unrelated pages competing with one another.
    alternates: alternatesFor("/"),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      locale,
      url: SITE.url,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* One brand claim, from one constant — SEO_PLAN §6.1 rule 5. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([buildOrganizationSchema(), buildWebSiteSchema()]),
          }}
        />
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delay={200}>{children}</TooltipProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
