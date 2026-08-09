import type { PageKey, PageSeo } from "./types";

/** Default Open Graph images — 1200×630, named from page headers. */
export const DEFAULT_OG: Record<PageKey, string> = {
  home: "/og/og-restaurant-software-that-puts-you-back-in-control.jpg",
  about: "/og/og-about-orderweb-built-by-hospitality.jpg",
  pricing: "/og/og-pricing-orderweb-pos-and-custom-software.jpg",
  contact: "/og/og-contact-orderweb-pos-demos-and-quotes.jpg",
  "restaurant-pos": "/og/og-restaurant-management-system-orderweb.jpg",
  website: "/og/og-custom-website-design-and-build-orderweb.jpg",
  software: "/og/og-custom-software-web-apps-and-mobile-apps.jpg",
  privacy: "/og/og-privacy-policy-orderweb.jpg",
  terms: "/og/og-terms-and-conditions-orderweb.jpg",
  cookies: "/og/og-privacy-policy-orderweb.jpg",
  faq: "/og/og-faq-orderweb-pos-and-custom-software.jpg",
  dpa: "/og/og-data-processing-agreement-dpa-orderweb.jpg",
};

export const DEFAULT_SEO: Record<PageKey, PageSeo> = {
  home: {
    metaTitle: "OrderWeb — Restaurant POS & Custom Software Development",
    metaDescription:
      "Commission-free restaurant POS, online ordering and custom software — built in the UK.",
    ogImage: DEFAULT_OG.home,
  },
  about: {
    metaTitle: "About OrderWeb — Built by Hospitality, for Hospitality",
    metaDescription:
      "OrderWeb was built by someone who spent 8 years working restaurant floors. One transparent price, your own hardware, no add-on traps.",
    ogImage: DEFAULT_OG.about,
  },
  pricing: {
    metaTitle: "Pricing — OrderWeb POS & Custom Software",
    metaDescription:
      "Flat £59.99/month. 0% order commission. No setup fee. Optional white-label app and SMS.",
    ogImage: DEFAULT_OG.pricing,
  },
  contact: {
    metaTitle: "Contact OrderWeb — POS Demos & Project Quotes",
    metaDescription:
      "Get in touch with the OrderWeb team in Brockley, London. Book a demo or discuss a bespoke software project.",
    ogImage: DEFAULT_OG.contact,
  },
  "restaurant-pos": {
    metaTitle: "Restaurant POS for UK Restaurants — 0% Commission | OrderWeb",
    metaDescription:
      "Commission-free restaurant POS for UK venues. Orders, staff, payments and reports in one system — book a demo with OrderWeb.",
    ogImage: DEFAULT_OG["restaurant-pos"],
  },
  website: {
    metaTitle: "Custom Websites & Redesigns — OrderWeb",
    metaDescription:
      "Custom new websites and redesigns for restaurants and brands — built to convert. Get a quote from OrderWeb.",
    ogImage: DEFAULT_OG.website,
  },
  software: {
    metaTitle: "Custom Software — Web Apps & Mobile Apps | OrderWeb",
    metaDescription:
      "OrderWeb builds custom web applications and native mobile apps to your requirements — design, development, launch and support.",
    ogImage: DEFAULT_OG.software,
  },
  privacy: {
    metaTitle: "Privacy Policy — OrderWeb",
    metaDescription:
      "How OrderWeb Ltd collects, uses and protects personal data for our website, POS platform and customer enquiries.",
    ogImage: DEFAULT_OG.privacy,
  },
  terms: {
    metaTitle: "Terms & Conditions — OrderWeb",
    metaDescription:
      "Terms of use for the OrderWeb website, demos and software services provided by OrderWeb Ltd.",
    ogImage: DEFAULT_OG.terms,
  },
  cookies: {
    metaTitle: "Cookie & Similar Technologies Policy — OrderWeb",
    metaDescription:
      "How OrderWeb Ltd uses cookies and similar technologies under UK PECR and data-protection rules across our websites and restaurant applications.",
    ogImage: DEFAULT_OG.cookies,
  },
  faq: {
    metaTitle: "FAQ — OrderWeb POS & Custom Software",
    metaDescription:
      "Answers about OrderWeb pricing, commission-free POS, hardware, support, websites and custom software — for UK restaurant operators.",
    ogImage: DEFAULT_OG.faq,
  },
  dpa: {
    metaTitle: "Data Processing Agreement (DPA) — OrderWeb",
    metaDescription:
      "OrderWeb Ltd UK GDPR Article 28 Data Processing Agreement for restaurant Controllers using our multi-tenant SaaS platform.",
    ogImage: DEFAULT_OG.dpa,
  },
};

export function mergeSeo(key: PageKey, saved?: Partial<PageSeo> | null): PageSeo {
  const base = DEFAULT_SEO[key];
  const merged = { ...base, ...saved };
  // Keep a default share image if CMS left it blank
  if (!merged.ogImage?.trim()) merged.ogImage = base.ogImage;
  return merged;
}
