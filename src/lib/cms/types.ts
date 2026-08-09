export type PageKey =
  | "home"
  | "about"
  | "pricing"
  | "contact"
  | "restaurant-pos"
  | "website"
  | "software"
  | "privacy"
  | "terms"
  | "cookies"
  | "faq"
  | "dpa";

/** Shared shape for Privacy / Terms — sections with simple text body. */
export type LegalSectionBlock = {
  title: string;
  /** Paragraphs separated by blank lines. Bullet lines start with "- ". Links: [label](url). Headings: ### Title. Bold: **text** */
  body: string;
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSectionBlock[];
};

export type DpaSubProcessor = {
  entity: string;
  activity: string;
  region: string;
};

export type DpaContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  /** Highlight box under the intro */
  callout: string;
  sections: LegalSectionBlock[];
  scheduleTitle: string;
  scheduleIntro: string;
  subProcessors: DpaSubProcessor[];
  executionTitle: string;
  executionIntro: string;
  processorLabel: string;
  processorName: string;
  controllerLabel: string;
  controllerName: string;
  relatedNote: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  items: FaqItem[];
  ctaHeadline: string;
  ctaBody: string;
  ctaButtonLabel: string;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    imageDesktop: string;
    imageMobile: string;
  };
  why: {
    eyebrow: string;
    headline: string;
    image: string;
    points: string[];
    pointBodies: string[];
  };
  services: { eyebrow: string; headline: string };
  reviews: { eyebrow: string; headline: string };
  cta: { headline: string; body: string; buttonLabel: string };
};

export type AboutCard = { hit?: string; title: string; body: string };

export type AboutContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body1: string;
    body2: string;
    image: string;
  };
  problem: {
    eyebrow: string;
    headline: string;
    subhead: string;
    cards: AboutCard[];
  };
  difference: {
    eyebrow: string;
    headline: string;
    subhead: string;
    cards: AboutCard[];
  };
  studio: {
    eyebrow: string;
    headline: string;
    subhead: string;
    cards: AboutCard[];
  };
  mission: {
    eyebrow: string;
    statement: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export type PricingHighlightCard = { title: string; body: string };

export type PricingContent = {
  hero: { eyebrow: string; headline: string; body: string; image: string };
  highlights: { cards: PricingHighlightCard[] };
  compare: {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    appsLabel: string;
    appsValue: string;
    orderwebLabel: string;
    orderwebValue: string;
  };
  plan: {
    label: string;
    price: string;
    priceSuffix: string;
    summary: string;
    features: string[];
    primaryCta: string;
    secondaryCta: string;
  };
  sideStats: { setupFee: string; commission: string; billing: string };
  calculator: { headline: string; body: string };
  addOns: {
    sectionTitle: string;
    sectionBody: string;
    whiteLabelTitle: string;
    whiteLabelPrice: string;
    whiteLabelBody: string;
    whiteLabelImage: string;
    smsTitle: string;
    smsSubtitle: string;
    smsPrice: string;
    smsPriceSuffix: string;
    smsBody: string;
    smsFooter: string;
    guideNote: string;
  };
  notes: string;
};

export type ContactContent = {
  hero: { eyebrow: string; headline: string; body: string; image: string };
  display: {
    companyName: string;
    companyBlurb: string;
    email: string;
    phone: string;
    address: string;
    demoNote: string;
  };
  form: {
    submitLabel: string;
    messagePlaceholder: string;
    successMessage: string;
  };
};

export type TextPoint = { title: string; body: string };

export type RestaurantPosContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    image: string;
    /** Primary hero / product-tour CTA — usually “Book a demo”. */
    primaryCta: string;
  };
  productTour: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  whyChoose: {
    eyebrow: string;
    headline: string;
    body: string;
    points: TextPoint[];
  };
  payments: {
    eyebrow: string;
    headline: string;
    body: string;
    points: TextPoint[];
    ctaLabel: string;
  };
  featureMap: {
    eyebrow: string;
    headline: string;
    body: string;
    groups: { title: string; items: string[] }[];
  };
  cta: {
    eyebrow: string;
    headline: string;
    buttonLabel: string;
  };
};

export type WebsiteDemo = {
  id: string;
  label: string;
  domain: string;
  brand: string;
  headline: string;
  support: string;
  cta: string;
  secondary: string;
  heroImage: string;
  tiles: { label: string; image: string }[];
};

export type WebsiteContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    primaryCta: string;
    image: string;
    audiences: string[];
  };
  promiseStrip: { left: string; right: string };
  demoShowcase: {
    eyebrow: string;
    headline: string;
    body: string;
    bullets: string[];
    primaryCta: string;
    nextExampleLabel: string;
    demos: WebsiteDemo[];
  };
  roadmap: {
    eyebrow: string;
    headline: string;
    body: string;
    steps: { step: string; title: string; body: string }[];
  };
  cta: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
};

export type SoftwareProductBlock = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  stack: string[];
};

export type SoftwareContent = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    primaryCta: string;
    image: string;
    chips: string[];
  };
  products: {
    web: SoftwareProductBlock;
    mobile: SoftwareProductBlock;
  };
  process: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    steps: { step: string; title: string; body: string }[];
  };
  cta: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
};

export type PageContentMap = {
  home: HomeContent;
  about: AboutContent;
  pricing: PricingContent;
  contact: ContactContent;
  "restaurant-pos": RestaurantPosContent;
  website: WebsiteContent;
  software: SoftwareContent;
  privacy: LegalPageContent;
  terms: LegalPageContent;
  cookies: LegalPageContent;
  faq: FaqContent;
  dpa: DpaContent;
};

export type PageSeo = {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

export type PageStatus = "published" | "draft" | "dirty";

export type PageRecord<K extends PageKey = PageKey> = {
  draft: PageContentMap[K];
  published: PageContentMap[K];
  seo: PageSeo;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  /** Legacy field kept during migration; prefer draftUpdatedAt. */
  updatedAt: string | null;
};

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  size: number;
  mime: string;
  createdAt: string;
  alt: string;
  folder: string;
  tags: string[];
};

export type SiteSettings = {
  /** Inbox that receives contact-form and site emails. */
  contactToEmail: string;
  /** From header, e.g. OrderWeb Website <noreply@orderweb.co.uk> */
  contactFromEmail: string;
  /** SMTP host (smtp.gmail.com, mail.yourdomain.com, …). */
  smtpHost: string;
  smtpPort: number;
  /** true = SSL on connect (usually port 465); false = STARTTLS (usually 587). */
  smtpSecure: boolean;
  smtpUser: string;
  /** Stored server-side only; never sent to the client in full. */
  smtpPassword?: string;
  smtpPasswordSet: boolean;
  smtpPasswordMasked?: string | null;
  /** True when SMTP has enough config to send. */
  emailConfigured: boolean;
  /** Google Analytics 4 measurement ID, e.g. G-XXXXXXX */
  analyticsGaMeasurementId: string;
  /** Google Tag Manager container ID, e.g. GTM-XXXXXXX */
  analyticsGtmId: string;
  /** Meta / Facebook Pixel ID */
  analyticsMetaPixelId: string;
  /** Microsoft Clarity project ID */
  analyticsClarityId: string;
  /** Google Search Console HTML-tag content value */
  seoGoogleSiteVerification: string;
  /** Bing Webmaster Tools meta content value */
  seoBingSiteVerification: string;
  /** Optional custom head HTML (script / meta tags). Admin-only. */
  analyticsCustomHeadHtml: string;
  /** Footer / schema social profile URLs (leave blank to hide that icon). */
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialX: string;
  /**
   * Footer trust badges under Legal (PCI, ICO, …).
   * Legacy single-badge fields below are migrated on read if this is empty.
   */
  footerBadges: {
    id: string;
    label: string;
    enabled: boolean;
    image: string;
    alt: string;
    href: string;
    defaultImage: string;
  }[];
  /** @deprecated migrated into footerBadges */
  footerBadgeEnabled?: boolean;
  /** @deprecated */
  footerBadgeImage?: string;
  /** @deprecated */
  footerBadgeAlt?: string;
  /** @deprecated */
  footerBadgeHref?: string;
};

export type PasswordResetToken = {
  email: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

/** All admin-panel seats are full admins (no separate editor role). */
export type AdminRole = "admin";

export type AdminRecord = {
  email: string;
  passwordHash: string;
  salt: string;
  role: AdminRole;
  createdAt: string;
  createdBy?: string | null;
  disabledAt?: string | null;
  /** Authenticator (TOTP) MFA enabled after successful enroll. */
  totpEnabled?: boolean;
  /** Base32 TOTP secret (set when enabled). */
  totpSecret?: string | null;
  /** Temporary secret while scanning QR / confirming first code. */
  totpPendingSecret?: string | null;
  /** SHA-256 hashes of one-time recovery codes. */
  totpRecoveryHashes?: string[];
  /** Backup MFA phone in E.164 (e.g. +447700900123). */
  phoneE164?: string | null;
  /** When true (and TOTP is on), login can request an SMS backup code. */
  smsBackupEnabled?: boolean;
};

export type ActivityAction =
  | "login"
  | "logout"
  | "page.draft_save"
  | "page.publish"
  | "page.revert"
  | "media.upload"
  | "media.delete"
  | "media.replace"
  | "media.update"
  | "settings.save"
  | "user.create"
  | "user.disable"
  | "password.change"
  | "password.reset_request"
  | "password.reset"
  | "mfa.enroll"
  | "mfa.disable"
  | "mfa.recovery_used"
  | "mfa.sms_backup_update"
  | "mfa.sms_sent"
  | "mfa.sms_used"
  | "backup.create"
  | "backup.delete"
  | "backup.restore";

export type ActivityEntry = {
  id: string;
  at: string;
  actorEmail: string;
  action: ActivityAction;
  target?: string;
  summary: string;
};

export type CmsDatabase = {
  admins: AdminRecord[];
  pages: { [K in PageKey]: PageRecord<K> };
  media: MediaItem[];
  settings: SiteSettings;
  activity: ActivityEntry[];
  passwordResets: PasswordResetToken[];
};

export const PAGE_META: Record<PageKey, { title: string; path: string }> = {
  home: { title: "Home", path: "/" },
  about: { title: "About", path: "/about" },
  pricing: { title: "Pricing", path: "/pricing" },
  contact: { title: "Contact", path: "/contact" },
  "restaurant-pos": { title: "Restaurant POS", path: "/restaurant-pos" },
  website: { title: "Website", path: "/website" },
  software: { title: "Software", path: "/software" },
  privacy: { title: "Privacy", path: "/privacy" },
  terms: { title: "Terms", path: "/terms" },
  cookies: { title: "Cookie Policy", path: "/cookies" },
  faq: { title: "FAQ", path: "/faq" },
  dpa: { title: "DPA", path: "/dpa" },
};

export const ALL_PAGE_KEYS = Object.keys(PAGE_META) as PageKey[];
