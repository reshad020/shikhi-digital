import { locales, routing } from "@/i18n/routing";

/**
 * The single source of the brand claim.
 *
 * SEO_PLAN §6.1 rule 5: a model assembling "what is Shikhi Digital" from a crawl
 * reads the title, the OG card, the manifest, the footer and the schema. If those
 * disagree it learns four products. ieltsbiz hit exactly this bug. Change the
 * claim here and it lands everywhere, or it lands nowhere.
 */
export const SITE = {
  name: "Shikhi Digital",
  domain: "shikhi.digital",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shikhi.digital",

  /** One sentence. Used verbatim in metadata, schema and llms.txt. */
  claim:
    "Shikhi Digital is a learning platform for children aged 8 to 13 that grades how they reason, not just whether their answer was right.",

  /** The differentiator, phrased so an answer engine can quote it standalone. */
  differentiator:
    "A child can be right for a poor reason and wrong for a good one. Shikhi Digital reads the explanation a child writes and reports on the thinking behind it.",

  audience: "Parents and children aged 8-13",
  locales: locales.map((l) => l.code),
  defaultLocale: routing.defaultLocale,
} as const;

/**
 * Absolute URL for a path in a given locale, matching next-intl's `as-needed`
 * prefixing — the default locale carries no prefix.
 */
export function localeUrl(path: string, locale: string = SITE.defaultLocale) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const prefix = locale === SITE.defaultLocale ? "" : `/${locale}`;
  return `${SITE.url}${prefix}${clean}` || SITE.url;
}

/**
 * `alternates` for a path across every locale, plus x-default.
 *
 * Six locales were previously served with no alternates at all, which tells
 * Google they are unrelated pages competing with each other.
 */
export function alternatesFor(path: string) {
  const languages: Record<string, string> = {};
  for (const code of SITE.locales) languages[code] = localeUrl(path, code);
  languages["x-default"] = localeUrl(path, SITE.defaultLocale);

  return { canonical: localeUrl(path, SITE.defaultLocale), languages };
}
