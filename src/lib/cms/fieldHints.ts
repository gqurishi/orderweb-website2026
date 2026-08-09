import type { PageKey } from "./types";

/** Soft guidance shown in the page editor (not hard blocks except via validatePublish). */
export const PAGE_FIELD_HINTS: Record<
  PageKey,
  { heroHeadline?: string; heroImage?: string; general?: string }
> = {
  home: {
    heroHeadline: "Keep the hero line short — about 40–70 characters works best.",
    heroImage: "Recommended: desktop ~1920×1080, mobile ~1080×1920 (JPG/PNG/WebP).",
    general: "Draft saves freely. Publish requires a non-empty hero headline.",
  },
  about: {
    heroHeadline: "Aim for one clear story title — under ~60 characters.",
    heroImage: "Recommended: ~1200×900 story illustration.",
  },
  pricing: {
    heroHeadline: "Lead with the offer (price / commission) in under ~50 characters.",
    heroImage: "Recommended: ~1200×900 pricing visual.",
  },
  contact: {
    heroHeadline: "Invite action — under ~60 characters.",
    heroImage: "Recommended: ~900×900 hero illustration.",
  },
  "restaurant-pos": {
    heroHeadline: "Product benefit in one line — under ~70 characters.",
    heroImage: "Recommended: ~1200×900 hardware / product shot.",
  },
  website: {
    heroHeadline: "Customer-facing promise — under ~70 characters.",
    heroImage: "Recommended: ~1200×700 device mockup.",
  },
  software: {
    heroHeadline: "What you build — under ~80 characters.",
    heroImage: "Recommended: ~800×1600 phone / product shot.",
  },
  privacy: {
    general:
      "Edit like About: use the Privacy page map (Parts 1–2). Update “Last updated” when you publish changes.",
  },
  terms: {
    general:
      "Edit like About: use the Terms page map (Parts 1–2). Update “Last updated” when you publish changes.",
  },
  cookies: {
    general:
      "Cookie / PECR policy editor — same workflow as Privacy & Terms: edit Parts 1–2, Save draft, Preview, then Publish. Update “Last updated” whenever you change the live policy.",
  },
  faq: {
    general:
      "Edit like About: use the FAQ page map (Parts 1–3). Add, remove, or reorder questions in Part 2.",
  },
  dpa: {
    general:
      "Edit like About: use the DPA page map (Parts 1–4). Update “Last updated” when you publish changes. Sub-processors are simple table rows in Part 3.",
  },
};

export const SEO_HINTS = {
  metaTitle: "Recommended 50–60 characters.",
  metaDescription: "Recommended 140–160 characters.",
  ogImage: "Recommended 1200×630 share image (JPG/PNG).",
};
