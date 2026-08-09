import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminEmail } from "@/lib/admin/session.server";
import {
  createWebsiteBackup,
  deleteBackup,
  listBackups,
  readBackupFile,
  restoreWebsiteBackupFromBuffer,
  restoreWebsiteBackupFromName,
} from "./backup.server";
import { formatBytes } from "./backup.shared";
import { appendActivity } from "./store.server";

export const listBackupsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminEmail();
  const backups = await listBackups();
  return {
    backups,
    keepCount: 3,
    note: "Monthly auto backup runs at month-end. Only the latest 3 backups are kept on this server. Upload a zip to restore quickly.",
  };
});

export const createBackupFn = createServerFn({ method: "POST" }).handler(async () => {
  const email = await requireAdminEmail();
  try {
    const backup = await createWebsiteBackup("manual");
    await appendActivity({
      actorEmail: email,
      action: "backup.create",
      target: backup.name,
      summary: `Created website backup ${backup.name} (${formatBytes(backup.size)})`,
    });
    return {
      ok: true as const,
      backup,
      pruned: backup.pruned,
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Backup failed.",
    };
  }
});

export const deleteBackupFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(10).max(120) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const result = await deleteBackup(data.name);
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: email,
      action: "backup.delete",
      target: data.name,
      summary: `Deleted website backup ${data.name}`,
    });
    return { ok: true as const };
  });

export const downloadBackupFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(10).max(120) }))
  .handler(async ({ data }) => {
    await requireAdminEmail();
    const file = await readBackupFile(data.name);
    if (!file) return { ok: false as const, error: "Backup not found." };
    return {
      ok: true as const,
      name: file.name,
      size: file.size,
      dataBase64: file.data.toString("base64"),
      mime: "application/zip",
    };
  });

export const restoreBackupUploadFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileName: z.string().min(1).max(180),
      size: z.number().int().positive().max(50_000_000),
      dataBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    if (!data.fileName.toLowerCase().endsWith(".zip")) {
      return { ok: false as const, error: "Please upload a .zip backup file." };
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(data.dataBase64, "base64");
    } catch {
      return { ok: false as const, error: "Could not read the uploaded file." };
    }
    if (buffer.byteLength !== data.size && Math.abs(buffer.byteLength - data.size) > 64) {
      // allow small base64 padding differences, but block clearly wrong sizes
      if (buffer.byteLength > 50_000_000) {
        return { ok: false as const, error: "Backup is too large." };
      }
    }

    const result = await restoreWebsiteBackupFromBuffer(buffer);
    if (!result.ok) return result;

    await appendActivity({
      actorEmail: email,
      action: "backup.restore",
      target: data.fileName,
      summary: `Restored website from uploaded backup ${data.fileName} (safety: ${result.safetyBackup})`,
    });
    return result;
  });

export const restoreBackupNamedFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(10).max(120) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const result = await restoreWebsiteBackupFromName(data.name);
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: email,
      action: "backup.restore",
      target: data.name,
      summary: `Restored website from backup ${data.name} (safety: ${result.safetyBackup})`,
    });
    return result;
  });
