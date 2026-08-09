/** Footer trust badges (PCI, ICO, …). Manage in Admin → Trust Badges. */

export type FooterBadgeItem = {
  id: string;
  /** Admin-only label */
  label: string;
  enabled: boolean;
  /** Custom image URL; blank uses defaultImage */
  image: string;
  alt: string;
  href: string;
  /** Built-in fallback when image is blank */
  defaultImage: string;
};

export type FooterBadgePublic = {
  id: string;
  imageUrl: string;
  alt: string;
  href: string;
};

export const DEFAULT_FOOTER_BADGES: FooterBadgeItem[] = [
  {
    id: "pci",
    label: "PCI DSS",
    enabled: true,
    image: "",
    alt: "PCI DSS Compliant",
    href: "",
    defaultImage: "/badges/pci-dss-compliant.png",
  },
  {
    id: "ico",
    label: "ICO Registered",
    enabled: true,
    image: "",
    alt: "ICO Registered — Information Commissioner's Office",
    href: "https://ico.org.uk/",
    defaultImage: "/badges/ico-registered.png",
  },
];

/** @deprecated — kept for older CMS rows during migration */
export const DEFAULT_FOOTER_BADGE_IMAGE = DEFAULT_FOOTER_BADGES[0]!.defaultImage;
/** @deprecated */
export const DEFAULT_FOOTER_BADGE_ALT = DEFAULT_FOOTER_BADGES[0]!.alt;

export function normalizeFooterBadges(raw: unknown): FooterBadgeItem[] {
  const byId = new Map(DEFAULT_FOOTER_BADGES.map((b) => [b.id, { ...b }]));

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      const id = typeof r.id === "string" && r.id.trim() ? r.id.trim() : "";
      if (!id) continue;
      const base = byId.get(id) ?? {
        id,
        label: typeof r.label === "string" && r.label.trim() ? r.label.trim() : id,
        enabled: true,
        image: "",
        alt: "",
        href: "",
        defaultImage: "",
      };
      byId.set(id, {
        ...base,
        label:
          typeof r.label === "string" && r.label.trim() ? r.label.trim() : base.label,
        enabled: typeof r.enabled === "boolean" ? r.enabled : base.enabled,
        image: typeof r.image === "string" ? r.image.trim() : base.image,
        alt: typeof r.alt === "string" ? r.alt.trim() : base.alt,
        href: typeof r.href === "string" ? r.href.trim() : base.href,
        defaultImage:
          typeof r.defaultImage === "string" && r.defaultImage.trim()
            ? r.defaultImage.trim()
            : base.defaultImage,
      });
    }
  }

  // Preserve default order first, then any custom extras
  const ordered: FooterBadgeItem[] = [];
  for (const def of DEFAULT_FOOTER_BADGES) {
    ordered.push(byId.get(def.id) ?? { ...def });
    byId.delete(def.id);
  }
  for (const extra of byId.values()) ordered.push(extra);
  return ordered;
}

/** Migrate legacy single-badge settings into the badges list. */
export function migrateLegacyFooterBadges(input?: {
  footerBadges?: unknown;
  footerBadgeEnabled?: boolean;
  footerBadgeImage?: string;
  footerBadgeAlt?: string;
  footerBadgeHref?: string;
} | null): FooterBadgeItem[] {
  if (input && Array.isArray(input.footerBadges) && input.footerBadges.length) {
    return normalizeFooterBadges(input.footerBadges);
  }

  const badges = DEFAULT_FOOTER_BADGES.map((b) => ({ ...b }));
  const pci = badges.find((b) => b.id === "pci");
  if (pci && input) {
    if (typeof input.footerBadgeEnabled === "boolean") {
      pci.enabled = input.footerBadgeEnabled;
    }
    if (typeof input.footerBadgeImage === "string") {
      pci.image = input.footerBadgeImage.trim();
    }
    if (typeof input.footerBadgeAlt === "string" && input.footerBadgeAlt.trim()) {
      pci.alt = input.footerBadgeAlt.trim();
    }
    if (typeof input.footerBadgeHref === "string") {
      pci.href = input.footerBadgeHref.trim();
    }
  }
  return badges;
}

export function resolveFooterBadges(input?: {
  footerBadges?: unknown;
  footerBadgeEnabled?: boolean;
  footerBadgeImage?: string;
  footerBadgeAlt?: string;
  footerBadgeHref?: string;
} | null): FooterBadgePublic[] {
  return migrateLegacyFooterBadges(input)
    .filter((b) => b.enabled)
    .map((b) => ({
      id: b.id,
      imageUrl: b.image.trim() || b.defaultImage,
      alt: b.alt.trim() || b.label,
      href: b.href.trim(),
    }))
    .filter((b) => Boolean(b.imageUrl));
}

/** @deprecated use resolveFooterBadges */
export function resolveFooterBadge(input?: {
  footerBadgeEnabled?: boolean;
  footerBadgeImage?: string;
  footerBadgeAlt?: string;
  footerBadgeHref?: string;
  footerBadges?: unknown;
} | null): FooterBadgePublic | null {
  return resolveFooterBadges(input)[0] ?? null;
}
