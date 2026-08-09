import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { MediaItem, PageKey } from "./types";

export const SITE_DEFAULT_TAG = "site-default";

export type SiteMediaEntry = {
  file: string;
  name: string;
  folder: string;
  /** Pages that use this image as a built-in default (even when CMS field is blank). */
  usedByDefault: PageKey[];
  alt?: string;
};

/** Built-in site pictures — copied into public/cms-uploads/site/ and listed in Media. */
export const SITE_MEDIA_CATALOG: SiteMediaEntry[] = [
  {
    file: "orderweb-logo.png",
    name: "Brand — OrderWeb logo",
    folder: "brand",
    usedByDefault: [],
    alt: "OrderWeb logo",
  },
  {
    file: "favicon.png",
    name: "Brand — favicon",
    folder: "brand",
    usedByDefault: [],
    alt: "OrderWeb favicon",
  },
  {
    file: "home-hero-desktop.jpg",
    name: "Home — laptop hero (desktop)",
    folder: "home",
    usedByDefault: ["home"],
    alt: "OrderWeb restaurant POS on a laptop overlooking a city terrace",
  },
  {
    file: "home-hero-mobile.jpg",
    name: "Home — iPad hero (mobile)",
    folder: "home",
    usedByDefault: ["home"],
    alt: "OrderWeb on an iPad at an outdoor balcony table",
  },
  {
    file: "why-orderweb-visual.jpg",
    name: "Home — why OrderWeb visual",
    folder: "home",
    usedByDefault: ["home"],
    alt: "Why operators choose OrderWeb",
  },
  {
    file: "about-floor-story.png",
    name: "About — hospitality floor story",
    folder: "about",
    usedByDefault: ["about"],
    alt: "Restaurant floor — OrderWeb built by hospitality",
  },
  {
    file: "pricing-commission-scale.png",
    name: "Pricing — commission-free scale",
    folder: "pricing",
    usedByDefault: ["pricing"],
    alt: "OrderWeb flat pricing with zero order commission",
  },
  {
    file: "contact-london-hero.png",
    name: "Contact — London hero",
    folder: "contact",
    usedByDefault: ["contact"],
    alt: "Contact OrderWeb in London",
  },
  {
    file: "pos-hardware-hero.png",
    name: "Restaurant POS — hardware hero",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb restaurant POS hardware",
  },
  {
    file: "pos-screen-dashboard.png",
    name: "Restaurant POS — dashboard screen",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb POS dashboard screen",
  },
  {
    file: "pos-screen-store-ops.png",
    name: "Restaurant POS — store operations screen",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb POS store operations screen",
  },
  {
    file: "pos-screen-business-admin.png",
    name: "Restaurant POS — business admin screen",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb POS business admin screen",
  },
  {
    file: "pos-screen-staff-customers.png",
    name: "Restaurant POS — staff and customers screen",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb POS staff and customers screen",
  },
  {
    file: "pos-macbook-platform.png",
    name: "Restaurant POS — MacBook platform",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb restaurant platform on a MacBook",
  },
  {
    file: "pos-management-overview.png",
    name: "Restaurant POS — management overview",
    folder: "restaurant-pos",
    usedByDefault: ["restaurant-pos"],
    alt: "OrderWeb restaurant management overview",
  },
  {
    file: "website-devices-hero.png",
    name: "Website — devices hero",
    folder: "website",
    usedByDefault: ["website"],
    alt: "OrderWeb custom website on phone, tablet and laptop",
  },
  {
    file: "demo-restaurant-1.png",
    name: "Website demo — restaurant site 1",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example restaurant website design 1",
  },
  {
    file: "demo-restaurant-2.png",
    name: "Website demo — restaurant site 2",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example restaurant website design 2",
  },
  {
    file: "demo-restaurant-3.png",
    name: "Website demo — restaurant site 3",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example restaurant website design 3",
  },
  {
    file: "demo-retail-1.png",
    name: "Website demo — retail site 1",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example retail website design 1",
  },
  {
    file: "demo-retail-2.png",
    name: "Website demo — retail site 2",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example retail website design 2",
  },
  {
    file: "demo-retail-3.png",
    name: "Website demo — retail site 3",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example retail website design 3",
  },
  {
    file: "demo-services-1.png",
    name: "Website demo — services site 1",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example services website design 1",
  },
  {
    file: "demo-services-2.png",
    name: "Website demo — services site 2",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example services website design 2",
  },
  {
    file: "demo-services-3.png",
    name: "Website demo — services site 3",
    folder: "website",
    usedByDefault: ["website"],
    alt: "Example services website design 3",
  },
  {
    file: "software-phone-hero.png",
    name: "Software — phone hero",
    folder: "software",
    usedByDefault: ["software"],
    alt: "OrderWeb custom software on a phone",
  },
];

export function siteMediaUrl(file: string) {
  return `/cms-uploads/site/${file}`;
}

export function isSiteDefaultMedia(item: Pick<MediaItem, "tags" | "url">) {
  return (
    item.tags.includes(SITE_DEFAULT_TAG) || item.url.startsWith("/cms-uploads/site/")
  );
}

export function defaultPagesForMediaUrl(url: string): PageKey[] {
  const entry = SITE_MEDIA_CATALOG.find((e) => siteMediaUrl(e.file) === url);
  return entry?.usedByDefault ?? [];
}

function mimeForFile(file: string) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

async function pathExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkFiles(full)));
    } else if (/\.(jpe?g|png|webp|gif|svg)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Ensures every built-in site picture exists under public/cms-uploads/site/
 * and has a Media library row. Also registers any orphan uploads on disk.
 */
export async function syncMediaLibrary(opts: {
  uploadDir: string;
  media: MediaItem[];
  add: (item: Omit<MediaItem, "id" | "createdAt"> & { id?: string; createdAt?: string }) => void;
  /** Patch existing site-default rows when catalog name/alt/folder change. */
  update?: (id: string, patch: Partial<Pick<MediaItem, "name" | "alt" | "folder" | "tags">>) => void;
}): Promise<{ added: number; updated: number }> {
  const { uploadDir, media, add, update } = opts;
  const siteDir = path.join(uploadDir, "site");
  await mkdir(siteDir, { recursive: true });
  const assetsDir = path.join(process.cwd(), "src", "assets");
  const byUrl = new Map(media.map((m) => [m.url, m]));
  let added = 0;
  let updated = 0;

  for (const entry of SITE_MEDIA_CATALOG) {
    const dest = path.join(siteDir, entry.file);
    const src = path.join(assetsDir, entry.file);
    // Favicon source lives in public/, not src/assets
    const faviconSrc =
      entry.file === "favicon.png"
        ? path.join(process.cwd(), "public", "favicon.png")
        : null;
    const copyFrom = faviconSrc && (await pathExists(faviconSrc)) ? faviconSrc : src;

    if (!(await pathExists(dest)) && (await pathExists(copyFrom))) {
      await copyFile(copyFrom, dest);
    }
    if (!(await pathExists(dest))) continue;

    const url = siteMediaUrl(entry.file);
    const existing = byUrl.get(url);
    const tags = [SITE_DEFAULT_TAG, entry.folder];
    const alt = entry.alt ?? "";

    if (existing) {
      if (
        update &&
        (existing.name !== entry.name ||
          existing.alt !== alt ||
          existing.folder !== entry.folder)
      ) {
        update(existing.id, {
          name: entry.name,
          alt,
          folder: entry.folder,
          tags,
        });
        updated += 1;
      }
      continue;
    }

    const info = await stat(dest);
    const id = `site-${entry.file.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    add({
      id,
      name: entry.name,
      url,
      size: info.size,
      mime: mimeForFile(entry.file),
      alt,
      folder: entry.folder,
      tags,
      createdAt: new Date(0).toISOString(),
    });
    byUrl.set(url, {
      id,
      name: entry.name,
      url,
      size: info.size,
      mime: mimeForFile(entry.file),
      alt,
      folder: entry.folder,
      tags,
      createdAt: new Date(0).toISOString(),
    });
    added += 1;
  }

  // Register any other files already under cms-uploads (user uploads, etc.)
  const files = await walkFiles(uploadDir);
  for (const filePath of files) {
    const rel = path.relative(uploadDir, filePath).split(path.sep).join("/");
    const url = `/cms-uploads/${rel}`;
    if (byUrl.has(url)) continue;
    const info = await stat(filePath);
    const folder = rel.includes("/") ? rel.split("/")[0]! : "uploads";
    add({
      name: path.basename(filePath),
      url,
      size: info.size,
      mime: mimeForFile(filePath),
      alt: "",
      folder: folder === "site" ? "site" : folder,
      tags: folder === "site" ? [SITE_DEFAULT_TAG, "site"] : ["upload", folder],
    });
    byUrl.set(url, {
      id: "",
      name: path.basename(filePath),
      url,
      size: info.size,
      mime: mimeForFile(filePath),
      alt: "",
      folder: folder === "site" ? "site" : folder,
      tags: folder === "site" ? [SITE_DEFAULT_TAG, "site"] : ["upload", folder],
      createdAt: new Date().toISOString(),
    });
    added += 1;
  }

  return { added, updated };
}
