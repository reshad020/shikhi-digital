import { SITE, localeUrl } from "./config";

/**
 * JSON-LD builders. Each returns a plain object; render with
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
 *
 * Schema is the machine-readable half of SEO_PLAN §5-§6: it is how a snippet
 * gets built and how an answer engine decides what a page asserts.
 */

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.claim,
    // Kept explicitly distinct from Shikhi AI (shikhiai.com) so the two brands
    // do not blur into one entity in AI answers — SEO_PLAN §10.
    slogan: "Grade the thinking, not the answer.",
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.claim,
    inLanguage: SITE.locales,
  };
}

export function buildBreadcrumbSchema(
  trail: { name: string; path: string }[],
  locale: string = SITE.defaultLocale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: localeUrl(crumb.path, locale),
    })),
  };
}

/** FAQ blocks must be visible on the page too — schema-only FAQs are a penalty risk. */
export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function buildHowToSchema(input: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    step: input.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * The GEO workhorse (SEO_PLAN §6.2). Original data is the most citable asset
 * class there is, and `n` is not optional — an undisclosed sample size is what
 * separates a study from a blog post.
 */
export function buildDatasetSchema(input: {
  name: string;
  description: string;
  path: string;
  sampleSize: number;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    url: localeUrl(input.path),
    creator: { "@type": "Organization", name: SITE.name, url: SITE.url },
    datePublished: input.datePublished,
    variableMeasured: "Thinking moves observed in children's written reasoning",
    measurementTechnique: `Aggregate analysis of ${input.sampleSize} graded explanations`,
    isAccessibleForFree: true,
  };
}

/** Hub index pages. Gives Google an explicit inventory to build sitelinks from. */
export function buildItemListSchema(
  items: { name: string; path: string }[],
  locale: string = SITE.defaultLocale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: localeUrl(item.path, locale),
    })),
  };
}
