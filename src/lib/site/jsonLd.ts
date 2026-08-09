import { PAGE_META, type PageKey } from "@/lib/cms/types";
import { canonicalUrl } from "@/lib/cms/pageHead";
import { organizationJsonLd, SITE_ORIGIN } from "@/lib/site/organization";

export type JsonLdObject = Record<string, unknown>;

export function ldJsonScript(data: unknown) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data),
  };
}

/** Merge JSON-LD `@graph` nodes into a route `head()` result. */
export function withJsonLd<T extends { scripts?: unknown[] }>(
  head: T,
  ...nodes: Array<JsonLdObject | null | undefined | false>
) {
  const graph = nodes.filter(Boolean) as JsonLdObject[];
  if (!graph.length) return head;
  return {
    ...head,
    scripts: [
      ...((head.scripts as unknown[]) ?? []),
      ldJsonScript({
        "@context": "https://schema.org",
        "@graph": graph,
      }),
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name: "OrderWeb",
    alternateName: "OrderWeb Ltd",
    description:
      "UK restaurant POS platform and custom software studio — commission-free ordering, websites and native apps.",
    inLanguage: "en-GB",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(crumbs[crumbs.length - 1]?.path ?? "/")}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

/** Home → current page breadcrumb for any CMS public page except home. */
export function pageBreadcrumbJsonLd(pageKey: Exclude<PageKey, "home">) {
  const meta = PAGE_META[pageKey];
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: meta.title, path: meta.path },
  ]);
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  const cleaned = items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (!cleaned.length) return null;

  return {
    "@type": "FAQPage",
    "@id": `${canonicalUrl("/faq")}#faq`,
    mainEntity: cleaned.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function contactPageJsonLd() {
  return {
    "@type": "ContactPage",
    "@id": `${canonicalUrl("/contact")}#contactpage`,
    url: canonicalUrl("/contact"),
    name: "Contact OrderWeb",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    about: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export { organizationJsonLd };
