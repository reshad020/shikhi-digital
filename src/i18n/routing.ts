import { defineRouting } from "next-intl/routing";

/**
 * Locales the platform ships with. `dir` drives the <html dir> attribute so
 * Arabic (and any future RTL locale) mirrors the whole layout for free.
 *
 * `short` is deliberately native script rather than a flag emoji: Windows has
 * no glyphs for regional-indicator flags, so they degrade to bare letter pairs
 * ("GB", "SA") on a large share of desktops. A language is also not a country.
 */
export const locales = [
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "es", label: "Español", short: "ES", dir: "ltr" },
  { code: "fr", label: "Français", short: "FR", dir: "ltr" },
  { code: "hi", label: "हिन्दी", short: "हि", dir: "ltr" },
  { code: "zh", label: "中文", short: "中", dir: "ltr" },
  { code: "ar", label: "العربية", short: "ع", dir: "rtl" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const routing = defineRouting({
  locales: locales.map((l) => l.code),
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export function directionOf(locale: string): "ltr" | "rtl" {
  return locales.find((l) => l.code === locale)?.dir ?? "ltr";
}
