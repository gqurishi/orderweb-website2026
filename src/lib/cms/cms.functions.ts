import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminSession, requireAdminEmail, requireRole } from "@/lib/admin/session.server";
import {
  addMedia,
  appendActivity,
  deleteMedia,
  findMediaUsage,
  getDraftContent,
  getPageEditorState,
  getPageSeo,
  getPublicAnalytics,
  getPublishedContent,
  getSettings,
  getSmtpSecrets,
  getUploadDir,
  listActivity,
  listMedia,
  listPageSummaries,
  publishPage,
  replaceMediaFile,
  revertDraft,
  saveDraft,
  saveSettings,
  updateMedia,
} from "./store.server";
import { buildContactEnquiryEmail } from "./contactEmail.server";
import { inboxAddress, sendSiteEmail } from "./mail.server";
import { PAGE_META, type PageKey, type PageSeo } from "./types";
import { safeUploadBasename, validateImageUploadBase64 } from "./uploadImage.server";

const emptyBodySchema = z.object({}).optional();

const pageKeySchema = z.enum([
  "home",
  "about",
  "pricing",
  "contact",
  "restaurant-pos",
  "website",
  "software",
  "privacy",
  "terms",
  "cookies",
  "faq",
  "dpa",
]);

const seoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogImage: z.string(),
});

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminEmail();
  const [summaries, settings, activity] = await Promise.all([
    listPageSummaries(),
    getSettings(),
    listActivity(8),
  ]);
  return {
    pages: summaries.map((s) => ({
      ...s,
      title: PAGE_META[s.key].title,
      path: PAGE_META[s.key].path,
    })),
    settings,
    activity,
  };
});

export const getPageEditorFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    await requireAdminEmail();
    return getPageEditorState(data.key);
  });

export const saveDraftFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      key: pageKeySchema,
      content: z.record(z.any()),
      seo: seoSchema,
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const result = await saveDraft(
      data.key,
      data.content as never,
      data.seo as PageSeo,
      email,
    );
    return { ok: true as const, ...result };
  });

/** @deprecated Prefer saveDraftFn — kept so old clients don’t hard-fail mid-deploy. */
export const savePageEditorFn = saveDraftFn;

export const publishPageFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    return publishPage(data.key, email);
  });

export const revertPageFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const result = await revertDraft(data.key, email);
    return { ok: true as const, ...result };
  });

export const getPublicPageFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      key: pageKeySchema,
      preview: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    let useDraft = false;
    if (data.preview) {
      const session = await getAdminSession();
      useDraft = Boolean(session.data.email);
    }
    const content = useDraft
      ? await getDraftContent(data.key)
      : await getPublishedContent(data.key);
    const seo = await getPageSeo(data.key);
    return { content, seo, preview: useDraft };
  });

export const listMediaFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminEmail();
  const media = await listMedia();
  const withUsage = await Promise.all(
    media.map(async (item) => ({
      ...item,
      usedBy: await findMediaUsage(item.url),
    })),
  );
  return withUsage;
});

export const uploadMediaFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      mime: z.string().min(1),
      size: z.number().int().positive().max(5_000_000),
      dataBase64: z.string().min(1),
      alt: z.string().optional(),
      folder: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const validated = validateImageUploadBase64({
      dataBase64: data.dataBase64,
      claimedMime: data.mime,
      claimedSize: data.size,
    });
    if (!validated.ok) {
      return { ok: false as const, error: validated.error };
    }
    const filename = safeUploadBasename(data.name, validated.ext);
    const dir = getUploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), validated.buffer);
    const url = `/cms-uploads/${filename}`;
    const item = await addMedia({
      name: data.name,
      url,
      size: validated.size,
      mime: validated.mime,
      alt: data.alt ?? "",
      folder: data.folder ?? "",
      tags: data.tags ?? [],
    });
    await appendActivity({
      actorEmail: email,
      action: "media.upload",
      target: item.id,
      summary: `Uploaded ${item.name}`,
    });
    return { ok: true as const, item };
  });

export const updateMediaFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      alt: z.string().optional(),
      name: z.string().optional(),
      folder: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const item = await updateMedia(data.id, {
      ...(typeof data.alt === "string" ? { alt: data.alt } : {}),
      ...(typeof data.name === "string" ? { name: data.name } : {}),
      ...(typeof data.folder === "string" ? { folder: data.folder } : {}),
      ...(data.tags ? { tags: data.tags } : {}),
    });
    if (!item) return { ok: false as const, error: "Media not found." };
    await appendActivity({
      actorEmail: email,
      action: "media.update",
      target: item.id,
      summary: `Updated media ${item.name}`,
    });
    return { ok: true as const, item };
  });

export const replaceMediaFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      mime: z.string().min(1),
      size: z.number().int().positive().max(5_000_000),
      dataBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const validated = validateImageUploadBase64({
      dataBase64: data.dataBase64,
      claimedMime: data.mime,
      claimedSize: data.size,
    });
    if (!validated.ok) {
      return { ok: false as const, error: validated.error };
    }
    const existing = (await listMedia()).find((m) => m.id === data.id);
    if (!existing) return { ok: false as const, error: "Media not found." };

    // Prefer overwriting the same filename so page URLs stay valid without remap
    let filename = existing.url.replace(/^\/cms-uploads\//, "");
    if (!filename || filename.includes("..") || filename.includes("\0")) {
      filename = `${data.id}.${validated.ext}`;
    } else {
      // Force extension to match verified bytes (blocks .php.jpg style tricks on replace)
      filename = filename.replace(/\.[a-z0-9]+$/i, "") + `.${validated.ext}`;
    }
    const dir = getUploadDir();
    const filePath = path.resolve(dir, filename);
    const resolvedDir = path.resolve(dir);
    if (filePath !== resolvedDir && !filePath.startsWith(resolvedDir + path.sep)) {
      return { ok: false as const, error: "Invalid media path." };
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, validated.buffer);
    const url = `/cms-uploads/${filename}`;
    const item = await replaceMediaFile(data.id, {
      name: data.name,
      mime: validated.mime,
      size: validated.size,
      url,
    });
    if (!item) return { ok: false as const, error: "Media not found." };
    await appendActivity({
      actorEmail: email,
      action: "media.replace",
      target: item.id,
      summary: `Replaced image ${item.name}`,
    });
    return { ok: true as const, item };
  });

export const deleteMediaFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const removed = await deleteMedia(data.id);
    if (removed && "error" in removed) {
      return { ok: false as const, error: removed.error };
    }
    if (removed) {
      await appendActivity({
        actorEmail: email,
        action: "media.delete",
        target: data.id,
        summary: `Deleted media ${removed.name}`,
      });
    }
    return { ok: true as const };
  });

export const listActivityFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminEmail();
  return listActivity(200);
});

export const getSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole("admin");
  return getSettings();
});

export const saveSettingsFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      contactToEmail: z.string().email(),
      contactFromEmail: z.string().min(3),
      smtpHost: z.string().optional(),
      smtpPort: z.number().int().min(1).max(65535).optional(),
      smtpSecure: z.boolean().optional(),
      smtpUser: z.string().optional(),
      smtpPassword: z.string().optional(),
      analyticsGaMeasurementId: z.string().optional(),
      analyticsGtmId: z.string().optional(),
      analyticsMetaPixelId: z.string().optional(),
      analyticsClarityId: z.string().optional(),
      seoGoogleSiteVerification: z.string().optional(),
      seoBingSiteVerification: z.string().optional(),
      analyticsCustomHeadHtml: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const actor = await requireRole("admin");
    const settings = await saveSettings({
      contactToEmail: data.contactToEmail,
      contactFromEmail: data.contactFromEmail,
      ...(typeof data.smtpHost === "string" ? { smtpHost: data.smtpHost } : {}),
      ...(typeof data.smtpPort === "number" ? { smtpPort: data.smtpPort } : {}),
      ...(typeof data.smtpSecure === "boolean" ? { smtpSecure: data.smtpSecure } : {}),
      ...(typeof data.smtpUser === "string" ? { smtpUser: data.smtpUser } : {}),
      ...(data.smtpPassword?.trim() ? { smtpPassword: data.smtpPassword.trim() } : {}),
      ...(typeof data.analyticsGaMeasurementId === "string"
        ? { analyticsGaMeasurementId: data.analyticsGaMeasurementId }
        : {}),
      ...(typeof data.analyticsGtmId === "string" ? { analyticsGtmId: data.analyticsGtmId } : {}),
      ...(typeof data.analyticsMetaPixelId === "string"
        ? { analyticsMetaPixelId: data.analyticsMetaPixelId }
        : {}),
      ...(typeof data.analyticsClarityId === "string"
        ? { analyticsClarityId: data.analyticsClarityId }
        : {}),
      ...(typeof data.seoGoogleSiteVerification === "string"
        ? { seoGoogleSiteVerification: data.seoGoogleSiteVerification }
        : {}),
      ...(typeof data.seoBingSiteVerification === "string"
        ? { seoBingSiteVerification: data.seoBingSiteVerification }
        : {}),
      ...(typeof data.analyticsCustomHeadHtml === "string"
        ? { analyticsCustomHeadHtml: data.analyticsCustomHeadHtml }
        : {}),
    });
    await appendActivity({
      actorEmail: actor.email,
      action: "settings.save",
      target: "settings",
      summary: "Updated site settings",
    });
    return { ok: true as const, settings };
  });

export const getPublicAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getPublicAnalytics();
});

export const saveSocialLinksFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      socialFacebook: z.string(),
      socialInstagram: z.string(),
      socialYoutube: z.string(),
      socialX: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const actor = await requireRole("admin");
    const current = await getSettings();
    const settings = await saveSettings({
      contactToEmail: current.contactToEmail,
      contactFromEmail: current.contactFromEmail,
      socialFacebook: data.socialFacebook,
      socialInstagram: data.socialInstagram,
      socialYoutube: data.socialYoutube,
      socialX: data.socialX,
    });
    await appendActivity({
      actorEmail: actor.email,
      action: "settings.save",
      target: "social",
      summary: "Updated social media links",
    });
    return { ok: true as const, settings };
  });

const footerBadgeItemSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  enabled: z.boolean(),
  image: z.string(),
  alt: z.string(),
  href: z.string(),
  defaultImage: z.string(),
});

export const saveFooterBadgeFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      footerBadges: z.array(footerBadgeItemSchema).min(1).max(8),
    }),
  )
  .handler(async ({ data }) => {
    const actor = await requireRole("admin");
    const current = await getSettings();
    const settings = await saveSettings({
      contactToEmail: current.contactToEmail,
      contactFromEmail: current.contactFromEmail,
      footerBadges: data.footerBadges,
    });
    await appendActivity({
      actorEmail: actor.email,
      action: "settings.save",
      target: "footer-badges",
      summary: "Updated footer trust badges",
    });
    return { ok: true as const, settings };
  });

export const sendTestEmailFn = createServerFn({ method: "POST" })
  .inputValidator(emptyBodySchema)
  .handler(async () => {
    await requireRole("admin");
    const settings = await getSettings();
    const to = inboxAddress(settings);
    const smtp = await getSmtpSecrets();
    const result = await sendSiteEmail({
      to,
      subject: "OrderWeb admin — test email",
      text: [
        "This is a test from OrderWeb Admin.",
        "",
        "These are the saved Admin → Settings values currently used by the live site:",
        `SMTP host: ${smtp.host || "(missing)"}`,
        `SMTP port: ${smtp.port} (SSL/secure: ${smtp.secure ? "yes" : "no"})`,
        `SMTP user: ${smtp.user || "(missing)"}`,
        `Inbox: ${to}`,
        `From setting: ${settings.contactFromEmail}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n"),
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, to };
  });

function limitContactMessageWords(text: string, max = 200) {
  const matches = [...text.matchAll(/\S+/g)];
  if (matches.length <= max) return text;
  const last = matches[max - 1];
  if (!last) return text;
  return text.slice(0, last.index + last[0].length);
}

export const sendContactMessageFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      company: z.string().optional(),
      phone: z.string().optional(),
      message: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const settings = await getSettings();
    const to = inboxAddress(settings);
    const message = limitContactMessageWords(data.message, 200);
    const email = buildContactEnquiryEmail({
      name: data.name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      message,
    });
    const result = await sendSiteEmail({
      to,
      replyTo: data.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (!result.ok) {
      return {
        ok: false as const,
        error:
          result.error ||
          "Email is not configured yet. Add SMTP in Admin → Settings.",
      };
    }
    return { ok: true as const };
  });

export type PublicPagePayload<K extends PageKey = PageKey> = {
  content: import("./types").PageContentMap[K];
  seo: PageSeo;
  preview: boolean;
};
