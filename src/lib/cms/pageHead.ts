import type { PageSeo } from "./types";
import { SITE_ORIGIN } from "@/lib/site/organization";

/** Absolute canonical URL for a site path (no query/hash). */
export function canonicalUrl(path: string) {
  const raw = (path || "/").trim() || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized =
    withSlash === "/" ? "/" : withSlash.replace(/\/+$/, "").split("?")[0]!.split("#")[0]!;
  return normalized === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${normalized}`;
}

export function pageHeadFromSeo(
  seo: PageSeo | undefined,
  fallback: { title: string; description: string; path: string },
) {
  const title = seo?.metaTitle?.trim() || fallback.title;
  const description = seo?.metaDescription?.trim() || fallback.description;
  const rawOg = seo?.ogImage?.trim() || "";
  const ogImage = rawOg
    ? rawOg.startsWith("http://") || rawOg.startsWith("https://")
      ? rawOg
      : `${SITE_ORIGIN}${rawOg.startsWith("/") ? rawOg : `/${rawOg}`}`
    : "";
  const canonical = canonicalUrl(fallback.path);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "OrderWeb" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
