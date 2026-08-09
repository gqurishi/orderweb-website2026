import { PAGE_META, type PageKey } from "@/lib/cms/types";
import { SITE_ORIGIN } from "@/lib/site/organization";

type Changefreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: Changefreq;
};

/** Public indexable pages only — no /owadmin, no redirect aliases. */
const PRIORITY: Record<PageKey, number> = {
  home: 1,
  "restaurant-pos": 0.9,
  website: 0.9,
  software: 0.9,
  pricing: 0.9,
  about: 0.8,
  contact: 0.8,
  faq: 0.7,
  privacy: 0.3,
  terms: 0.3,
  cookies: 0.3,
  dpa: 0.3,
};

const CHANGEFREQ: Record<PageKey, Changefreq> = {
  home: "weekly",
  "restaurant-pos": "weekly",
  website: "weekly",
  software: "weekly",
  pricing: "weekly",
  about: "monthly",
  contact: "monthly",
  faq: "monthly",
  privacy: "yearly",
  terms: "yearly",
  cookies: "yearly",
  dpa: "yearly",
};

export function getSitemapEntries(): SitemapEntry[] {
  return (Object.keys(PAGE_META) as PageKey[])
    .map((key) => ({
      path: PAGE_META[key].path,
      priority: PRIORITY[key],
      changefreq: CHANGEFREQ[key],
    }))
    .sort((a, b) => b.priority - a.priority || a.path.localeCompare(b.path));
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(origin: string, path: string) {
  const base = origin.replace(/\/$/, "");
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build sitemap XML for crawlers (defaults to live SITE_ORIGIN). */
export function buildSitemapXml(opts?: {
  origin?: string;
  lastmod?: string;
  entries?: SitemapEntry[];
}) {
  const origin = opts?.origin ?? SITE_ORIGIN;
  const lastmod = opts?.lastmod ?? new Date().toISOString().slice(0, 10);
  const entries = opts?.entries ?? getSitemapEntries();

  const urls = entries
    .map((entry) => {
      const loc = escapeXml(absoluteUrl(origin, entry.path));
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function sitemapResponse(opts?: Parameters<typeof buildSitemapXml>[0]) {
  return new Response(buildSitemapXml(opts), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
