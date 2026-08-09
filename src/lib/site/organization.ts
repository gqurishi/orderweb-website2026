/** Canonical site + Organization structured data / footer socials. */

export const SITE_ORIGIN =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "")) ||
  "https://orderweb.co.uk";

export const ORGANIZATION = {
  name: "OrderWeb Ltd",
  legalName: "OrderWeb Ltd",
  alternateName: "OrderWeb",
  description:
    "UK restaurant POS platform and custom software studio — commission-free ordering, websites and native apps.",
  email: "mail@orderweb.co.uk",
  telephone: undefined as string | undefined,
  address: {
    "@type": "PostalAddress" as const,
    addressLocality: "Brockley",
    addressRegion: "London",
    addressCountry: "GB",
  },
  areaServed: "GB",
};

export type SocialId = "facebook" | "instagram" | "youtube" | "x";

export type SocialLink = {
  id: SocialId;
  label: string;
  href: string;
};

/** Default profiles (also used as CMS seed values). */
export const DEFAULT_SOCIAL_URLS: Record<SocialId, string> = {
  facebook: "https://www.facebook.com/orderweb",
  instagram: "https://www.instagram.com/orderweb",
  youtube: "https://www.youtube.com/@orderweb",
  x: "https://x.com/orderweb",
};

const SOCIAL_META: { id: SocialId; label: string }[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X (Twitter)" },
];

function isHttpUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/** Build footer icons from CMS URLs. Blank / invalid URLs are omitted. */
export function resolveSocialLinks(urls: {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
}): SocialLink[] {
  const map: Record<SocialId, string | undefined> = {
    facebook: urls.facebook,
    instagram: urls.instagram,
    youtube: urls.youtube,
    x: urls.x,
  };
  return SOCIAL_META.map((item) => ({
    id: item.id,
    label: item.label,
    href: (map[item.id] ?? "").trim(),
  })).filter((item) => isHttpUrl(item.href));
}

/** @deprecated Prefer resolveSocialLinks with CMS values */
export const SOCIAL_LINKS: SocialLink[] = resolveSocialLinks(DEFAULT_SOCIAL_URLS);

export function organizationLogoUrl() {
  return `${SITE_ORIGIN}/orderweb-logo.png`;
}

export function organizationJsonLd(sameAs?: string[]) {
  const profiles =
    sameAs && sameAs.length
      ? sameAs.filter(isHttpUrl)
      : SOCIAL_LINKS.map((s) => s.href);

  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    alternateName: ORGANIZATION.alternateName,
    url: SITE_ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: organizationLogoUrl(),
    },
    image: organizationLogoUrl(),
    description: ORGANIZATION.description,
    email: ORGANIZATION.email,
    address: ORGANIZATION.address,
    areaServed: ORGANIZATION.areaServed,
    sameAs: profiles,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ORGANIZATION.email,
        areaServed: "GB",
        availableLanguage: ["English"],
      },
    ],
  };
}
