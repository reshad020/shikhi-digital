import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // A child's own writing, and everything behind a family's session, must
        // never be indexed. /report and /children are per-family; /admin is a tool.
        disallow: ["/admin", "/api", "/auth", "/children", "/report", "/signin", "/signup"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
