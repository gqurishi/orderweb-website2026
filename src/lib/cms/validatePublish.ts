import type {
  DpaContent,
  FaqContent,
  LegalPageContent,
  PageContentMap,
  PageKey,
  PageSeo,
} from "./types";

function requiredTitle(key: PageKey, content: PageContentMap[PageKey]): string {
  if (key === "privacy" || key === "terms" || key === "cookies" || key === "dpa") {
    return ((content as LegalPageContent | DpaContent).title ?? "").trim();
  }
  if (key === "faq") {
    return ((content as FaqContent).headline ?? "").trim();
  }
  const c = content as { hero?: { headline?: string } };
  return (c.hero?.headline ?? "").trim();
}

/** Returns human-readable blockers. Empty array = ok to publish. */
export function validatePublish(
  key: PageKey,
  content: PageContentMap[PageKey],
  seo: PageSeo,
): string[] {
  const errors: string[] = [];
  if (!requiredTitle(key, content)) {
    errors.push(
      key === "faq"
        ? "Page headline is required before publish."
        : key === "privacy" || key === "terms" || key === "cookies" || key === "dpa"
          ? "Page title is required before publish."
          : "Hero headline is required before publish.",
    );
  }
  if (key === "privacy" || key === "terms" || key === "cookies") {
    const sections = (content as LegalPageContent).sections ?? [];
    if (!sections.length) errors.push("Add at least one section before publish.");
  }
  if (key === "dpa") {
    const sections = (content as DpaContent).sections ?? [];
    if (!sections.length) errors.push("Add at least one section before publish.");
  }
  if (key === "faq") {
    const items = (content as FaqContent).items ?? [];
    if (!items.length) errors.push("Add at least one FAQ item before publish.");
  }
  if (!seo.metaTitle.trim()) {
    errors.push("SEO meta title is required before publish.");
  }
  if (!seo.metaDescription.trim()) {
    errors.push("SEO meta description is required before publish.");
  }
  return errors;
}
