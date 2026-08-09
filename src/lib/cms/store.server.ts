import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ADMIN_DECISIONS } from "@/lib/admin/decisions";
import {
  hashPassword,
  validateStrongPassword,
  verifyPassword,
} from "@/lib/admin/password.server";
import { createEmptyDb, createPageRecord } from "./defaults";
import { maskApiKey, mergePageContent } from "./merge";
import { mergeSeo } from "./seoDefaults";
import type {
  ActivityAction,
  ActivityEntry,
  AdminRecord,
  AdminRole,
  CmsDatabase,
  MediaItem,
  PageContentMap,
  PageKey,
  PageRecord,
  PageSeo,
  PageStatus,
  SiteSettings,
} from "./types";
import { ALL_PAGE_KEYS, PAGE_META } from "./types";
import { migrateLegacyFooterBadges } from "@/lib/site/footerBadge";
import { validatePublish } from "./validatePublish";
import {
  defaultPagesForMediaUrl,
  isSiteDefaultMedia,
  syncMediaLibrary,
} from "./siteMedia.server";

const DB_PATH = path.join(process.cwd(), ".data", "cms-db.json");
/** Uploads live under .data (not next to app/source). Served via volume/symlink at /cms-uploads. */
const UPLOAD_DIR = path.join(process.cwd(), ".data", "cms-uploads");
const ACTIVITY_CAP = 500;

type LegacyPage = Partial<PageRecord> & {
  content?: PageContentMap[PageKey];
};

function pageStatus(record: PageRecord): PageStatus {
  if (!record.publishedAt) return "draft";
  return JSON.stringify(record.draft) === JSON.stringify(record.published)
    ? "published"
    : "dirty";
}

function normalizePageRecord<K extends PageKey>(key: K, raw: LegacyPage | undefined): PageRecord<K> {
  const base = createPageRecord(key);
  if (!raw) return base;

  // Phase 3 shape
  if (raw.draft || raw.published) {
    const published = mergePageContent(
      key,
      (raw.published ?? raw.draft) as unknown as Partial<PageContentMap[K]>,
    );
    const draft = mergePageContent(
      key,
      (raw.draft ?? raw.published) as unknown as Partial<PageContentMap[K]>,
    );
    return {
      draft,
      published,
      seo: mergeSeo(key, raw.seo),
      draftUpdatedAt: raw.draftUpdatedAt ?? raw.updatedAt ?? null,
      publishedAt: raw.publishedAt ?? null,
      publishedBy: raw.publishedBy ?? null,
      updatedAt: raw.updatedAt ?? raw.draftUpdatedAt ?? null,
    };
  }

  // Phase 1/2 legacy: { content, updatedAt }
  const content = mergePageContent(
    key,
    raw.content as unknown as Partial<PageContentMap[K]> | undefined,
  );
  return {
    draft: structuredClone(content),
    published: structuredClone(content),
    seo: mergeSeo(key, raw.seo),
    draftUpdatedAt: raw.updatedAt ?? null,
    publishedAt: raw.updatedAt ?? new Date().toISOString(),
    publishedBy: null,
    updatedAt: raw.updatedAt ?? null,
  };
}

function normalizeMedia(item: Partial<MediaItem> & Pick<MediaItem, "id" | "name" | "url">): MediaItem {
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    size: item.size ?? 0,
    mime: item.mime ?? "image/jpeg",
    createdAt: item.createdAt ?? new Date().toISOString(),
    alt: item.alt ?? "",
    folder: item.folder ?? "",
    tags: item.tags ?? [],
  };
}

function normalizeAdmin(admin: Partial<AdminRecord> & Pick<AdminRecord, "email" | "passwordHash" | "salt">): AdminRecord {
  return {
    email: admin.email,
    passwordHash: admin.passwordHash,
    salt: admin.salt,
    role: "admin",
    createdAt: admin.createdAt ?? new Date().toISOString(),
    createdBy: admin.createdBy ?? null,
    disabledAt: admin.disabledAt ?? null,
    totpEnabled: Boolean(admin.totpEnabled && admin.totpSecret),
    totpSecret: typeof admin.totpSecret === "string" ? admin.totpSecret : null,
    totpPendingSecret:
      typeof admin.totpPendingSecret === "string" ? admin.totpPendingSecret : null,
    totpRecoveryHashes: Array.isArray(admin.totpRecoveryHashes)
      ? admin.totpRecoveryHashes.filter((h) => typeof h === "string")
      : [],
    phoneE164: typeof admin.phoneE164 === "string" && admin.phoneE164.trim() ? admin.phoneE164.trim() : null,
    smsBackupEnabled: Boolean(admin.smsBackupEnabled && admin.phoneE164),
  };
}

async function ensureDb(): Promise<CmsDatabase> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as CmsDatabase & {
      pages?: Record<string, LegacyPage>;
    };
    const merged = mergeWithDefaults(parsed);
    // Persist Phase 3 migration (draft/published/seo) when upgrading old files.
    const needsWrite =
      ALL_PAGE_KEYS.some((key) => {
        const rawPage = parsed.pages?.[key] as LegacyPage | undefined;
        return Boolean(
          !rawPage ||
            (rawPage && !rawPage.draft && !rawPage.published && rawPage.content),
        );
      }) ||
      !Array.isArray(parsed.activity) ||
      (parsed.admins ?? []).some((a) => (a as { role?: string }).role !== "admin");
    if (needsWrite) await saveDb(merged);
    return merged;
  } catch {
    const fresh = createEmptyDb();
    await writeFile(DB_PATH, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }
}

function mergeWithDefaults(db: CmsDatabase & { pages?: Record<string, LegacyPage> }): CmsDatabase {
  const base = createEmptyDb();
  const pages = { ...base.pages } as CmsDatabase["pages"];
  const pageBag = pages as Record<PageKey, PageRecord>;
  for (const key of ALL_PAGE_KEYS) {
    pageBag[key] = normalizePageRecord(key, db.pages?.[key]);
  }

  const settings = normalizeSettings(db.settings);

  return {
    admins: (db.admins ?? []).map((a) => normalizeAdmin(a)),
    media: (db.media ?? []).map((m) => normalizeMedia(m)),
    pages,
    settings,
    activity: db.activity ?? [],
    passwordResets: db.passwordResets ?? [],
  };
}

function normalizeSettings(raw: Partial<SiteSettings> | undefined): SiteSettings {
  const base = createEmptyDb().settings;
  const smtpPassword = raw?.smtpPassword || process.env["SMTP_PASSWORD"] || "";
  const smtpHost = (raw?.smtpHost || process.env["SMTP_HOST"] || "").trim();
  const smtpUser = (raw?.smtpUser || process.env["SMTP_USER"] || "").trim();
  const smtpPort = Number(raw?.smtpPort || process.env["SMTP_PORT"] || 587) || 587;
  const smtpSecure =
    typeof raw?.smtpSecure === "boolean"
      ? raw.smtpSecure
      : process.env["SMTP_SECURE"] === "true" || smtpPort === 465;
  const emailConfigured = Boolean(smtpHost && smtpUser && smtpPassword);

  const settings: SiteSettings = {
    ...base,
    ...raw,
    contactToEmail: raw?.contactToEmail || base.contactToEmail,
    contactFromEmail: raw?.contactFromEmail || base.contactFromEmail,
    smtpHost: (raw?.smtpHost ?? "").trim(),
    smtpPort,
    smtpSecure,
    smtpUser: (raw?.smtpUser ?? "").trim(),
    smtpPasswordSet: Boolean(smtpPassword),
    smtpPasswordMasked: maskApiKey(smtpPassword || null),
    emailConfigured,
    analyticsGaMeasurementId: raw?.analyticsGaMeasurementId ?? "",
    analyticsGtmId: raw?.analyticsGtmId ?? "",
    analyticsMetaPixelId: raw?.analyticsMetaPixelId ?? "",
    analyticsClarityId: raw?.analyticsClarityId ?? "",
    seoGoogleSiteVerification: raw?.seoGoogleSiteVerification ?? "",
    seoBingSiteVerification: raw?.seoBingSiteVerification ?? "",
    analyticsCustomHeadHtml: raw?.analyticsCustomHeadHtml ?? "",
    socialFacebook:
      typeof raw?.socialFacebook === "string"
        ? raw.socialFacebook.trim()
        : base.socialFacebook,
    socialInstagram:
      typeof raw?.socialInstagram === "string"
        ? raw.socialInstagram.trim()
        : base.socialInstagram,
    socialYoutube:
      typeof raw?.socialYoutube === "string"
        ? raw.socialYoutube.trim()
        : base.socialYoutube,
    socialX: typeof raw?.socialX === "string" ? raw.socialX.trim() : base.socialX,
    footerBadges: migrateLegacyFooterBadges(raw),
  };
  if (raw?.smtpPassword) settings.smtpPassword = raw.smtpPassword;
  else delete settings.smtpPassword;
  return settings;
}

async function saveDb(db: CmsDatabase) {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  // Never persist masked key fields
  const toWrite: CmsDatabase = {
    ...db,
    settings: {
      contactToEmail: db.settings.contactToEmail,
      contactFromEmail: db.settings.contactFromEmail,
      smtpHost: db.settings.smtpHost ?? "",
      smtpPort: Number(db.settings.smtpPort) || 587,
      smtpSecure: Boolean(db.settings.smtpSecure),
      smtpUser: db.settings.smtpUser ?? "",
      smtpPasswordSet: Boolean(db.settings.smtpPassword || process.env["SMTP_PASSWORD"]),
      ...(db.settings.smtpPassword ? { smtpPassword: db.settings.smtpPassword } : {}),
      analyticsGaMeasurementId: db.settings.analyticsGaMeasurementId ?? "",
      analyticsGtmId: db.settings.analyticsGtmId ?? "",
      analyticsMetaPixelId: db.settings.analyticsMetaPixelId ?? "",
      analyticsClarityId: db.settings.analyticsClarityId ?? "",
      seoGoogleSiteVerification: db.settings.seoGoogleSiteVerification ?? "",
      seoBingSiteVerification: db.settings.seoBingSiteVerification ?? "",
      analyticsCustomHeadHtml: db.settings.analyticsCustomHeadHtml ?? "",
      socialFacebook: db.settings.socialFacebook ?? "",
      socialInstagram: db.settings.socialInstagram ?? "",
      socialYoutube: db.settings.socialYoutube ?? "",
      socialX: db.settings.socialX ?? "",
      footerBadges: migrateLegacyFooterBadges(db.settings),
      emailConfigured: Boolean(db.settings.emailConfigured),
    },
    passwordResets: db.passwordResets ?? [],
  };
  await writeFile(DB_PATH, JSON.stringify(toWrite, null, 2), "utf8");
}

export async function getDb() {
  return ensureDb();
}

export async function appendActivity(entry: {
  actorEmail: string;
  action: ActivityAction;
  summary: string;
  target?: string;
}) {
  const db = await ensureDb();
  const row: ActivityEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actorEmail: entry.actorEmail,
    action: entry.action,
    summary: entry.summary,
    ...(entry.target ? { target: entry.target } : {}),
  };
  db.activity.unshift(row);
  db.activity = db.activity.slice(0, ACTIVITY_CAP);
  await saveDb(db);
  return row;
}

export async function listActivity(limit = 100) {
  const db = await ensureDb();
  return db.activity.slice(0, limit);
}

export async function getPublishedContent<K extends PageKey>(key: K): Promise<PageContentMap[K]> {
  const db = await ensureDb();
  return mergePageContent(key, db.pages[key].published);
}

export async function getDraftContent<K extends PageKey>(key: K): Promise<PageContentMap[K]> {
  const db = await ensureDb();
  return mergePageContent(key, db.pages[key].draft);
}

export async function getPageSeo(key: PageKey): Promise<PageSeo> {
  const db = await ensureDb();
  return mergeSeo(key, db.pages[key].seo);
}

/** @deprecated Use getPublishedContent — kept for call-site migration. */
export async function getPageContent<K extends PageKey>(key: K): Promise<PageContentMap[K]> {
  return getPublishedContent(key);
}

export async function getPageEditorState<K extends PageKey>(key: K) {
  const db = await ensureDb();
  const record = db.pages[key];
  return {
    key,
    content: mergePageContent(key, record.draft),
    seo: mergeSeo(key, record.seo),
    status: pageStatus(record),
    draftUpdatedAt: record.draftUpdatedAt,
    publishedAt: record.publishedAt,
    publishedBy: record.publishedBy,
    meta: PAGE_META[key],
  };
}

export async function saveDraft<K extends PageKey>(
  key: K,
  content: PageContentMap[K],
  seo: PageSeo,
  actorEmail: string,
) {
  const db = await ensureDb();
  const updatedAt = new Date().toISOString();
  const record = db.pages[key];
  record.draft = content;
  record.seo = mergeSeo(key, seo);
  record.draftUpdatedAt = updatedAt;
  record.updatedAt = updatedAt;
  await saveDb(db);
  await appendActivity({
    actorEmail,
    action: "page.draft_save",
    target: key,
    summary: `Saved draft for ${PAGE_META[key].title}`,
  });
  return { updatedAt, status: pageStatus(record) };
}

export async function publishPage(key: PageKey, actorEmail: string) {
  const db = await ensureDb();
  const record = db.pages[key];
  const content = mergePageContent(key, record.draft);
  const seo = mergeSeo(key, record.seo);
  const errors = validatePublish(key, content, seo);
  if (errors.length) {
    return { ok: false as const, errors };
  }
  const publishedAt = new Date().toISOString();
  record.published = structuredClone(content);
  record.draft = structuredClone(content);
  record.seo = seo;
  record.publishedAt = publishedAt;
  record.publishedBy = actorEmail;
  record.draftUpdatedAt = publishedAt;
  record.updatedAt = publishedAt;
  await saveDb(db);
  await appendActivity({
    actorEmail,
    action: "page.publish",
    target: key,
    summary: `Published ${PAGE_META[key].title}`,
  });
  return { ok: true as const, publishedAt, status: "published" as const };
}

export async function revertDraft(key: PageKey, actorEmail: string) {
  const db = await ensureDb();
  const record = db.pages[key];
  const updatedAt = new Date().toISOString();
  record.draft = structuredClone(record.published);
  record.draftUpdatedAt = updatedAt;
  record.updatedAt = updatedAt;
  await saveDb(db);
  await appendActivity({
    actorEmail,
    action: "page.revert",
    target: key,
    summary: `Reverted draft for ${PAGE_META[key].title} to last published`,
  });
  return {
    content: mergePageContent(key, record.draft),
    seo: mergeSeo(key, record.seo),
    status: pageStatus(record),
    updatedAt,
  };
}

export async function listPageSummaries() {
  const db = await ensureDb();
  return ALL_PAGE_KEYS.map((key) => {
    const record = db.pages[key];
    return {
      key,
      updatedAt: record.draftUpdatedAt ?? record.updatedAt,
      publishedAt: record.publishedAt,
      status: pageStatus(record),
    };
  });
}

/** Copy site assets into the media library and register orphan uploads on disk. */
export async function ensureMediaLibrarySynced() {
  const db = await ensureDb();
  // Drop retired site filenames so renamed catalog entries can re-register cleanly.
  const before = db.media.length;
  db.media = db.media.filter(
    (item) =>
      item.url !== "/cms-uploads/site/hero-valley.jpg" &&
      item.url !== "/cms-uploads/site/hero-valley-mobile.jpg",
  );
  const removed = before - db.media.length;

  const { added, updated } = await syncMediaLibrary({
    uploadDir: UPLOAD_DIR,
    media: db.media,
    add: (item) => {
      db.media.push({
        id: item.id ?? crypto.randomUUID(),
        name: item.name,
        url: item.url,
        size: item.size,
        mime: item.mime,
        createdAt: item.createdAt ?? new Date().toISOString(),
        alt: item.alt ?? "",
        folder: item.folder ?? "",
        tags: item.tags ?? [],
      });
    },
    update: (id, patch) => {
      const row = db.media.find((m) => m.id === id);
      if (!row) return;
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.alt !== undefined) row.alt = patch.alt;
      if (patch.folder !== undefined) row.folder = patch.folder;
      if (patch.tags !== undefined) row.tags = patch.tags;
    },
  });
  if (added > 0 || updated > 0 || removed > 0) await saveDb(db);
  return added;
}

export async function listMedia() {
  await ensureMediaLibrarySynced();
  const db = await ensureDb();
  return [...db.media].sort((a, b) => {
    const aSite = isSiteDefaultMedia(a) ? 1 : 0;
    const bSite = isSiteDefaultMedia(b) ? 1 : 0;
    if (aSite !== bSite) return aSite - bSite; // uploads first, then site defaults
    if (!aSite) return b.createdAt.localeCompare(a.createdAt);
    return a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name);
  });
}

export async function findMediaUsage(url: string): Promise<PageKey[]> {
  const db = await ensureDb();
  const used = new Set<PageKey>();
  for (const key of ALL_PAGE_KEYS) {
    const record = db.pages[key];
    const hay = JSON.stringify(record.draft) + JSON.stringify(record.published) + JSON.stringify(record.seo);
    if (hay.includes(url)) used.add(key);
  }
  for (const key of defaultPagesForMediaUrl(url)) used.add(key);
  return ALL_PAGE_KEYS.filter((k) => used.has(k));
}

export async function addMedia(
  item: Omit<MediaItem, "id" | "createdAt" | "alt" | "folder" | "tags"> & {
    id?: string;
    alt?: string;
    folder?: string;
    tags?: string[];
    createdAt?: string;
  },
) {
  const db = await ensureDb();
  const row: MediaItem = {
    id: item.id ?? crypto.randomUUID(),
    name: item.name,
    url: item.url,
    size: item.size,
    mime: item.mime,
    createdAt: item.createdAt ?? new Date().toISOString(),
    alt: item.alt ?? "",
    folder: item.folder ?? "",
    tags: item.tags ?? [],
  };
  db.media.unshift(row);
  await saveDb(db);
  return row;
}

export async function updateMedia(
  id: string,
  patch: Partial<Pick<MediaItem, "alt" | "name" | "folder" | "tags">>,
) {
  const db = await ensureDb();
  const row = db.media.find((m) => m.id === id);
  if (!row) return null;
  if (typeof patch.alt === "string") row.alt = patch.alt;
  if (typeof patch.name === "string") row.name = patch.name;
  if (typeof patch.folder === "string") row.folder = patch.folder;
  if (patch.tags) row.tags = patch.tags;
  await saveDb(db);
  return row;
}

export async function replaceMediaFile(
  id: string,
  file: { name: string; mime: string; size: number; url: string },
) {
  const db = await ensureDb();
  const row = db.media.find((m) => m.id === id);
  if (!row) return null;
  const oldUrl = row.url;
  row.name = file.name;
  row.mime = file.mime;
  row.size = file.size;
  row.url = file.url;
  // Keep URL stable for layout: rewrite pages that used old URL? For true in-place,
  // we overwrite the same filename when possible. Here we remap content URLs.
  if (oldUrl !== file.url) {
    const remap = (value: unknown): unknown => {
      if (typeof value === "string") return value === oldUrl ? file.url : value;
      if (Array.isArray(value)) return value.map(remap);
      if (value && typeof value === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) out[k] = remap(v);
        return out;
      }
      return value;
    };
    for (const key of ALL_PAGE_KEYS) {
      const record = db.pages[key];
      record.draft = remap(record.draft) as PageContentMap[typeof key];
      record.published = remap(record.published) as PageContentMap[typeof key];
      record.seo = remap(record.seo) as PageSeo;
    }
  }
  await saveDb(db);
  return row;
}

export async function deleteMedia(
  id: string,
): Promise<MediaItem | null | { error: string }> {
  const db = await ensureDb();
  const row = db.media.find((m) => m.id === id);
  if (!row) return null;
  if (isSiteDefaultMedia(row)) {
    return { error: "Site default pictures cannot be deleted. Use Replace instead." };
  }
  db.media = db.media.filter((m) => m.id !== id);
  await saveDb(db);
  if (row.url.startsWith("/cms-uploads/")) {
    const filePath = path.join(process.cwd(), "public", row.url.replace(/^\//, ""));
    try {
      await unlink(filePath);
    } catch {
      // ignore missing file
    }
  }
  return row;
}

export async function getSettings(): Promise<SiteSettings> {
  const db = await ensureDb();
  const settings = normalizeSettings(db.settings);
  // Never expose raw secrets to the admin client.
  delete settings.smtpPassword;
  return settings;
}

function pickSmtpValue(cmsValue: string | undefined, envValue: string | undefined) {
  const cms = (cmsValue || "").trim();
  if (cms) return cms;
  return (envValue || "").trim();
}

/**
 * Server-only SMTP secrets for the mailer.
 * Admin → Settings (CMS) wins when set; env vars are fallback for first-time bootstrap only.
 */
export async function getSmtpSecrets() {
  const db = await ensureDb();
  const s = normalizeSettings(db.settings);
  const host = pickSmtpValue(s.smtpHost, process.env["SMTP_HOST"]);
  const user = pickSmtpValue(s.smtpUser, process.env["SMTP_USER"]);
  const password = pickSmtpValue(db.settings.smtpPassword, process.env["SMTP_PASSWORD"]);
  const port =
    Number(s.smtpPort) ||
    Number(process.env["SMTP_PORT"] || 0) ||
    587;
  const secure =
    port === 465
      ? true
      : typeof s.smtpSecure === "boolean"
        ? s.smtpSecure
        : process.env["SMTP_SECURE"] === "true" || process.env["SMTP_SECURE"] === "1";
  return { host, port, secure, user, password };
}

/** Public-safe analytics / SEO config (no email secrets). */
export async function getPublicAnalytics() {
  const db = await ensureDb();
  const s = normalizeSettings(db.settings);
  return {
    analyticsGaMeasurementId: s.analyticsGaMeasurementId.trim(),
    analyticsGtmId: s.analyticsGtmId.trim(),
    analyticsMetaPixelId: s.analyticsMetaPixelId.trim(),
    analyticsClarityId: s.analyticsClarityId.trim(),
    seoGoogleSiteVerification: s.seoGoogleSiteVerification.trim(),
    seoBingSiteVerification: s.seoBingSiteVerification.trim(),
    analyticsCustomHeadHtml: s.analyticsCustomHeadHtml.trim(),
    socialFacebook: s.socialFacebook.trim(),
    socialInstagram: s.socialInstagram.trim(),
    socialYoutube: s.socialYoutube.trim(),
    socialX: s.socialX.trim(),
    footerBadges: migrateLegacyFooterBadges(s),
  };
}

export async function saveSettings(patch: {
  contactToEmail?: string;
  contactFromEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  analyticsGaMeasurementId?: string;
  analyticsGtmId?: string;
  analyticsMetaPixelId?: string;
  analyticsClarityId?: string;
  seoGoogleSiteVerification?: string;
  seoBingSiteVerification?: string;
  analyticsCustomHeadHtml?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialX?: string;
  footerBadges?: {
    id: string;
    label: string;
    enabled: boolean;
    image: string;
    alt: string;
    href: string;
    defaultImage: string;
  }[];
  /** @deprecated */
  footerBadgeEnabled?: boolean;
  /** @deprecated */
  footerBadgeImage?: string;
  /** @deprecated */
  footerBadgeAlt?: string;
  /** @deprecated */
  footerBadgeHref?: string;
}) {
  const db = await ensureDb();
  if (patch.contactToEmail) db.settings.contactToEmail = patch.contactToEmail.trim();
  if (patch.contactFromEmail) db.settings.contactFromEmail = patch.contactFromEmail.trim();
  if (typeof patch.smtpHost === "string") db.settings.smtpHost = patch.smtpHost.trim();
  if (typeof patch.smtpPort === "number" && Number.isFinite(patch.smtpPort)) {
    db.settings.smtpPort = Math.max(1, Math.min(65535, Math.round(patch.smtpPort)));
  }
  if (typeof patch.smtpSecure === "boolean") db.settings.smtpSecure = patch.smtpSecure;
  if (typeof patch.smtpUser === "string") db.settings.smtpUser = patch.smtpUser.trim();
  if (typeof patch.smtpPassword === "string" && patch.smtpPassword.trim()) {
    db.settings.smtpPassword = patch.smtpPassword.trim();
  }
  // Port 465 is always implicit SSL for common mailbox hosts (Hostinger, cPanel, etc.).
  if (db.settings.smtpPort === 465) db.settings.smtpSecure = true;
  // Keep From address aligned with SMTP mailbox so providers don't reject later SMTP changes.
  const smtpUser = (db.settings.smtpUser || "").trim();
  if (smtpUser.includes("@")) {
    const from = (db.settings.contactFromEmail || "").trim();
    const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    const fromAddress = (match?.[2] || from).trim().toLowerCase();
    if (!fromAddress || fromAddress !== smtpUser.toLowerCase()) {
      const name = (match?.[1] || "OrderWeb Website").trim() || "OrderWeb Website";
      db.settings.contactFromEmail = `${name} <${smtpUser}>`;
    }
  }
  if (typeof patch.analyticsGaMeasurementId === "string") {
    db.settings.analyticsGaMeasurementId = patch.analyticsGaMeasurementId.trim();
  }
  if (typeof patch.analyticsGtmId === "string") {
    db.settings.analyticsGtmId = patch.analyticsGtmId.trim();
  }
  if (typeof patch.analyticsMetaPixelId === "string") {
    db.settings.analyticsMetaPixelId = patch.analyticsMetaPixelId.trim();
  }
  if (typeof patch.analyticsClarityId === "string") {
    db.settings.analyticsClarityId = patch.analyticsClarityId.trim();
  }
  if (typeof patch.seoGoogleSiteVerification === "string") {
    db.settings.seoGoogleSiteVerification = patch.seoGoogleSiteVerification.trim();
  }
  if (typeof patch.seoBingSiteVerification === "string") {
    db.settings.seoBingSiteVerification = patch.seoBingSiteVerification.trim();
  }
  if (typeof patch.analyticsCustomHeadHtml === "string") {
    db.settings.analyticsCustomHeadHtml = patch.analyticsCustomHeadHtml;
  }
  if (typeof patch.socialFacebook === "string") {
    db.settings.socialFacebook = patch.socialFacebook.trim();
  }
  if (typeof patch.socialInstagram === "string") {
    db.settings.socialInstagram = patch.socialInstagram.trim();
  }
  if (typeof patch.socialYoutube === "string") {
    db.settings.socialYoutube = patch.socialYoutube.trim();
  }
  if (typeof patch.socialX === "string") {
    db.settings.socialX = patch.socialX.trim();
  }
  if (Array.isArray(patch.footerBadges)) {
    db.settings.footerBadges = migrateLegacyFooterBadges({
      footerBadges: patch.footerBadges,
    });
    delete db.settings.footerBadgeEnabled;
    delete db.settings.footerBadgeImage;
    delete db.settings.footerBadgeAlt;
    delete db.settings.footerBadgeHref;
  } else if (
    typeof patch.footerBadgeEnabled === "boolean" ||
    typeof patch.footerBadgeImage === "string" ||
    typeof patch.footerBadgeAlt === "string" ||
    typeof patch.footerBadgeHref === "string"
  ) {
    const current = migrateLegacyFooterBadges(db.settings);
    const pci = current.find((b) => b.id === "pci");
    if (pci) {
      if (typeof patch.footerBadgeEnabled === "boolean") {
        pci.enabled = patch.footerBadgeEnabled;
      }
      if (typeof patch.footerBadgeImage === "string") {
        pci.image = patch.footerBadgeImage.trim();
      }
      if (typeof patch.footerBadgeAlt === "string") {
        pci.alt = patch.footerBadgeAlt.trim();
      }
      if (typeof patch.footerBadgeHref === "string") {
        pci.href = patch.footerBadgeHref.trim();
      }
    }
    db.settings.footerBadges = current;
  }

  const normalized = normalizeSettings(db.settings);
  db.settings = {
    ...db.settings,
    ...normalized,
    ...(db.settings.smtpPassword ? { smtpPassword: db.settings.smtpPassword } : {}),
  };
  await saveDb(db);
  return getSettings();
}

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function changeAdminPassword(
  email: string,
  currentPassword: string,
  nextPassword: string,
) {
  const strength = validateStrongPassword(nextPassword);
  if (strength) return { ok: false as const, error: strength };

  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) {
    return { ok: false as const, error: "Account not found." };
  }
  const valid = await verifyPassword(currentPassword, admin.passwordHash, admin.salt);
  if (!valid) return { ok: false as const, error: "Current password is incorrect." };

  const { hash, salt } = await hashPassword(nextPassword);
  admin.passwordHash = hash;
  admin.salt = salt;
  await saveDb(db);
  return { ok: true as const };
}

export async function createPasswordResetToken(email: string) {
  const db = await ensureDb();
  const admin = db.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && !a.disabledAt,
  );
  // Always succeed outwardly; only create token if user exists.
  if (!admin) return { ok: true as const, token: null as string | null };

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const tokenHash = await hashToken(token);
  const now = Date.now();
  db.passwordResets = (db.passwordResets ?? []).filter(
    (r) => r.email.toLowerCase() !== email.toLowerCase() && new Date(r.expiresAt).getTime() > now,
  );
  db.passwordResets.push({
    email: admin.email,
    tokenHash,
    expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });
  await saveDb(db);
  return { ok: true as const, token };
}

export async function resetPasswordWithToken(token: string, nextPassword: string) {
  const strength = validateStrongPassword(nextPassword);
  if (strength) return { ok: false as const, error: strength };

  const db = await ensureDb();
  const tokenHash = await hashToken(token);
  const now = Date.now();
  const row = (db.passwordResets ?? []).find(
    (r) => r.tokenHash === tokenHash && new Date(r.expiresAt).getTime() > now,
  );
  if (!row) return { ok: false as const, error: "Reset link is invalid or expired." };

  const admin = db.admins.find((a) => a.email.toLowerCase() === row.email.toLowerCase());
  if (!admin || admin.disabledAt) {
    return { ok: false as const, error: "Account not found." };
  }

  const { hash, salt } = await hashPassword(nextPassword);
  admin.passwordHash = hash;
  admin.salt = salt;
  db.passwordResets = (db.passwordResets ?? []).filter((r) => r.tokenHash !== tokenHash);
  await saveDb(db);
  return { ok: true as const, email: admin.email };
}

export async function getAdmins() {
  const db = await ensureDb();
  return db.admins;
}

export async function listAdminPublic() {
  const db = await ensureDb();
  return db.admins.map((a) => ({
    email: a.email,
    role: "admin" as const,
    createdAt: a.createdAt,
    disabledAt: a.disabledAt ?? null,
    totpEnabled: Boolean(a.totpEnabled && a.totpSecret),
  }));
}

export async function getAdminMfaStatus(email: string) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) return null;
  const phoneE164 =
    typeof admin.phoneE164 === "string" && admin.phoneE164.trim() ? admin.phoneE164.trim() : null;
  const smsBackupEnabled = Boolean(admin.smsBackupEnabled && phoneE164);
  return {
    enabled: Boolean(admin.totpEnabled && admin.totpSecret),
    pending: Boolean(admin.totpPendingSecret),
    recoveryRemaining: (admin.totpRecoveryHashes ?? []).length,
    phoneE164,
    smsBackupEnabled,
  };
}

export async function updateAdminSmsBackup(
  email: string,
  input: { phoneE164: string | null; smsBackupEnabled: boolean },
) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) return { ok: false as const, error: "Account not found." };
  if (input.smsBackupEnabled && !input.phoneE164) {
    return { ok: false as const, error: "Add a mobile number before enabling SMS backup." };
  }
  if (input.smsBackupEnabled && !(admin.totpEnabled && admin.totpSecret)) {
    return {
      ok: false as const,
      error: "Turn on authenticator MFA first. SMS is only a backup.",
    };
  }
  admin.phoneE164 = input.phoneE164;
  admin.smsBackupEnabled = Boolean(input.smsBackupEnabled && input.phoneE164);
  await saveDb(db);
  return {
    ok: true as const,
    phoneE164: admin.phoneE164,
    smsBackupEnabled: Boolean(admin.smsBackupEnabled),
  };
}

export async function beginAdminTotpEnroll(email: string, pendingSecret: string) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) return { ok: false as const, error: "Account not found." };
  if (admin.totpEnabled && admin.totpSecret) {
    return { ok: false as const, error: "Authenticator is already enabled. Disable it first." };
  }
  admin.totpPendingSecret = pendingSecret;
  await saveDb(db);
  return { ok: true as const };
}

export async function confirmAdminTotpEnroll(
  email: string,
  secret: string,
  recoveryHashes: string[],
) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) return { ok: false as const, error: "Account not found." };
  if (!admin.totpPendingSecret || admin.totpPendingSecret !== secret) {
    return { ok: false as const, error: "Enrollment expired. Start again." };
  }
  admin.totpSecret = secret;
  admin.totpEnabled = true;
  admin.totpPendingSecret = null;
  admin.totpRecoveryHashes = recoveryHashes;
  await saveDb(db);
  return { ok: true as const };
}

export async function cancelAdminTotpEnroll(email: string) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return;
  admin.totpPendingSecret = null;
  await saveDb(db);
}

export async function disableAdminTotp(email: string) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.disabledAt) return { ok: false as const, error: "Account not found." };
  admin.totpEnabled = false;
  admin.totpSecret = null;
  admin.totpPendingSecret = null;
  admin.totpRecoveryHashes = [];
  // SMS is only a backup for authenticator — turn it off with TOTP.
  admin.smsBackupEnabled = false;
  await saveDb(db);
  return { ok: true as const };
}

export async function consumeAdminRecoveryCode(email: string, hashIndex: number) {
  const db = await ensureDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return { ok: false as const };
  const hashes = [...(admin.totpRecoveryHashes ?? [])];
  if (hashIndex < 0 || hashIndex >= hashes.length) return { ok: false as const };
  hashes.splice(hashIndex, 1);
  admin.totpRecoveryHashes = hashes;
  await saveDb(db);
  return { ok: true as const, remaining: hashes.length };
}

export async function upsertAdmin(admin: AdminRecord) {
  const db = await ensureDb();
  const normalized = normalizeAdmin(admin);
  const idx = db.admins.findIndex((a) => a.email.toLowerCase() === normalized.email.toLowerCase());
  if (idx >= 0) db.admins[idx] = normalized;
  else db.admins.push(normalized);
  await saveDb(db);
}

export async function createAdminUser(input: {
  email: string;
  passwordHash: string;
  salt: string;
  createdBy: string;
}) {
  const db = await ensureDb();
  if (db.admins.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
    return { ok: false as const, error: "An account with that email already exists." };
  }
  const activeCount = db.admins.filter((a) => !a.disabledAt).length;
  const maxUsers = ADMIN_DECISIONS.maxAdminUsers;
  if (activeCount >= maxUsers) {
    return {
      ok: false as const,
      error: `This admin panel allows a maximum of ${maxUsers} users. Disable someone first to free a seat.`,
    };
  }
  const admin: AdminRecord = {
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    salt: input.salt,
    role: "admin",
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    disabledAt: null,
    totpEnabled: false,
    totpSecret: null,
    totpPendingSecret: null,
    totpRecoveryHashes: [],
    phoneE164: null,
    smsBackupEnabled: false,
  };
  db.admins.push(admin);
  await saveDb(db);
  return { ok: true as const, email: admin.email, role: admin.role };
}

export async function disableAdminUser(email: string, actorEmail: string) {
  const db = await ensureDb();
  if (email.toLowerCase() === actorEmail.toLowerCase()) {
    return { ok: false as const, error: "You can’t disable your own account." };
  }
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return { ok: false as const, error: "User not found." };
  const activeAdmins = db.admins.filter((a) => a.role === "admin" && !a.disabledAt);
  if (admin.role === "admin" && activeAdmins.length <= 1) {
    return { ok: false as const, error: "Keep at least one active admin." };
  }
  admin.disabledAt = new Date().toISOString();
  await saveDb(db);
  return { ok: true as const };
}

export function getUploadDir() {
  return UPLOAD_DIR;
}
