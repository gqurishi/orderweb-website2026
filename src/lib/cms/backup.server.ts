import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { formatBytes } from "./backup.shared";

export { formatBytes };

const execFileAsync = promisify(execFile);

const DATA_DIR = path.join(process.cwd(), ".data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const UPLOAD_DIR = path.join(DATA_DIR, "cms-uploads");
const DB_PATH = path.join(DATA_DIR, "cms-db.json");
const KEEP_COUNT = 3;
const MAX_RESTORE_BYTES = 50 * 1024 * 1024;
const BACKUP_NAME_RE = /^orderweb-backup-\d{4}-\d{2}-\d{2}T\d{6}Z-(manual|auto)\.zip$/;

export type BackupInfo = {
  name: string;
  size: number;
  createdAt: string;
  kind: "manual" | "auto";
};

function stamp() {
  // e.g. 2026-08-09T204200Z
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/:/g, "");
}

export function backupsDir() {
  return BACKUP_DIR;
}

export function isSafeBackupName(name: string) {
  return BACKUP_NAME_RE.test(name);
}

async function ensureBackupDir() {
  await mkdir(BACKUP_DIR, { recursive: true });
}

export async function pruneBackups(keep = KEEP_COUNT) {
  await ensureBackupDir();
  const files = (await readdir(BACKUP_DIR))
    .filter((name) => isSafeBackupName(name))
    .map(async (name) => {
      const full = path.join(BACKUP_DIR, name);
      const s = await stat(full);
      return { name, full, mtime: s.mtimeMs };
    });
  const listed = (await Promise.all(files)).sort((a, b) => b.mtime - a.mtime);
  const removed: string[] = [];
  for (const old of listed.slice(keep)) {
    await unlink(old.full);
    removed.push(old.name);
  }
  return { kept: listed.slice(0, keep).map((f) => f.name), removed };
}

export async function listBackups(): Promise<BackupInfo[]> {
  await ensureBackupDir();
  const names = (await readdir(BACKUP_DIR)).filter((name) => isSafeBackupName(name));
  const rows = await Promise.all(
    names.map(async (name) => {
      const s = await stat(path.join(BACKUP_DIR, name));
      return {
        name,
        size: s.size,
        createdAt: s.mtime.toISOString(),
        kind: name.includes("-auto.zip") ? ("auto" as const) : ("manual" as const),
      };
    }),
  );
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createWebsiteBackup(kind: "manual" | "auto" = "manual") {
  await ensureBackupDir();
  const name = `orderweb-backup-${stamp()}-${kind}.zip`;
  const outPath = path.join(BACKUP_DIR, name);

  // Prefer zip when available; fall back to tar.gz renamed is not ideal — require zip.
  try {
    await execFileAsync(
      "zip",
      ["-rq", outPath, "cms-db.json", "cms-uploads", "-x", "*.gitkeep", "-x", "backups/*"],
      { cwd: DATA_DIR },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "zip failed";
    throw new Error(
      `Could not create backup zip (${message}). Ensure the "zip" package is installed in the container.`,
    );
  }

  const pruned = await pruneBackups(KEEP_COUNT);
  const s = await stat(outPath);
  return {
    name,
    size: s.size,
    createdAt: s.mtime.toISOString(),
    kind,
    pruned: pruned.removed,
  };
}

export async function deleteBackup(name: string) {
  if (!isSafeBackupName(name)) {
    return { ok: false as const, error: "Invalid backup name." };
  }
  const full = path.join(BACKUP_DIR, name);
  try {
    await unlink(full);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Backup not found." };
  }
}

export async function readBackupFile(name: string) {
  if (!isSafeBackupName(name)) return null;
  const full = path.join(BACKUP_DIR, name);
  try {
    const s = await stat(full);
    if (!s.isFile()) return null;
    const data = await readFile(full);
    return { name, data, size: s.size };
  } catch {
    return null;
  }
}

function looksLikeCmsDb(raw: unknown): raw is { admins: unknown[]; pages: Record<string, unknown> } {
  if (!raw || typeof raw !== "object") return false;
  const db = raw as { admins?: unknown; pages?: unknown };
  return Array.isArray(db.admins) && !!db.pages && typeof db.pages === "object";
}

async function assertSafeExtractTree(root: string) {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop()!;
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const rel = path.relative(root, full);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        throw new Error("Backup zip contains unsafe paths.");
      }
      if (entry.isDirectory()) stack.push(full);
    }
  }
}

async function resolveExtractedBackup(extractDir: string) {
  const directDb = path.join(extractDir, "cms-db.json");
  const directUploads = path.join(extractDir, "cms-uploads");
  try {
    await stat(directDb);
    return { dbPath: directDb, uploadsPath: directUploads };
  } catch {
    // support a single top-level folder wrapper
  }

  const entries = await readdir(extractDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length === 1) {
    const nested = path.join(extractDir, dirs[0]!.name);
    const nestedDb = path.join(nested, "cms-db.json");
    const nestedUploads = path.join(nested, "cms-uploads");
    await stat(nestedDb);
    return { dbPath: nestedDb, uploadsPath: nestedUploads };
  }
  throw new Error("Invalid backup: cms-db.json not found.");
}

export async function restoreWebsiteBackupFromBuffer(buffer: Buffer) {
  if (buffer.byteLength <= 0) {
    return { ok: false as const, error: "Backup file is empty." };
  }
  if (buffer.byteLength > MAX_RESTORE_BYTES) {
    return {
      ok: false as const,
      error: `Backup is too large (max ${formatBytes(MAX_RESTORE_BYTES)}).`,
    };
  }
  // ZIP local header magic
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    return { ok: false as const, error: "File must be a .zip backup." };
  }

  // Safety snapshot of current site before replace.
  let safetyName = "";
  try {
    const safety = await createWebsiteBackup("manual");
    safetyName = safety.name;
  } catch (err) {
    return {
      ok: false as const,
      error: `Could not create safety backup before restore: ${
        err instanceof Error ? err.message : "unknown error"
      }`,
    };
  }

  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "ow-restore-"));
  const zipPath = path.join(tmpRoot, "upload.zip");
  const extractDir = path.join(tmpRoot, "extract");
  const stagingUploads = path.join(tmpRoot, "cms-uploads-new");
  const previousUploads = path.join(tmpRoot, "cms-uploads-previous");

  try {
    await mkdir(extractDir, { recursive: true });
    await writeFile(zipPath, buffer);
    await execFileAsync("unzip", ["-q", zipPath, "-d", extractDir]);
    await assertSafeExtractTree(extractDir);

    const resolved = await resolveExtractedBackup(extractDir);
    const raw = JSON.parse(await readFile(resolved.dbPath, "utf8")) as unknown;
    if (!looksLikeCmsDb(raw)) {
      return {
        ok: false as const,
        error: "Invalid backup: cms-db.json is not a valid OrderWeb CMS database.",
        safetyBackup: safetyName,
      };
    }

    try {
      await stat(resolved.uploadsPath);
    } catch {
      return {
        ok: false as const,
        error: "Invalid backup: cms-uploads folder is missing.",
        safetyBackup: safetyName,
      };
    }

    // Stage uploads, then swap.
    await rm(stagingUploads, { recursive: true, force: true });
    await execFileAsync("cp", ["-a", resolved.uploadsPath, stagingUploads]);

    await rm(previousUploads, { recursive: true, force: true });
    try {
      await stat(UPLOAD_DIR);
      await rename(UPLOAD_DIR, previousUploads);
    } catch {
      await mkdir(previousUploads, { recursive: true });
    }

    try {
      await rename(stagingUploads, UPLOAD_DIR);
      await writeFile(DB_PATH, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
    } catch (err) {
      // Rollback uploads if DB write / swap failed.
      await rm(UPLOAD_DIR, { recursive: true, force: true });
      try {
        await rename(previousUploads, UPLOAD_DIR);
      } catch {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }
      throw err;
    }

    await rm(previousUploads, { recursive: true, force: true });
    await pruneBackups(KEEP_COUNT);

    return {
      ok: true as const,
      safetyBackup: safetyName,
      admins: raw.admins.length,
      pages: Object.keys(raw.pages).length,
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Restore failed.",
      safetyBackup: safetyName,
    };
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
}

export async function restoreWebsiteBackupFromName(name: string) {
  const file = await readBackupFile(name);
  if (!file) return { ok: false as const, error: "Backup not found." };
  return restoreWebsiteBackupFromBuffer(file.data);
}
