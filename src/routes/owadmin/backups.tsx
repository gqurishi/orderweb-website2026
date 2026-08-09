import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import {
  createBackupFn,
  deleteBackupFn,
  downloadBackupFn,
  listBackupsFn,
  restoreBackupNamedFn,
  restoreBackupUploadFn,
} from "@/lib/cms/backup.functions";
import { formatBytes } from "@/lib/cms/backup.shared";
import type { AdminRole } from "@/lib/cms/types";

export const Route = createFileRoute("/owadmin/backups")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    const data = await listBackupsFn();
    return {
      email: session.email,
      role: (session.role ?? "admin") as AdminRole,
      ...data,
    };
  },
  component: BackupsPage,
});

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function BackupsPage() {
  const { email, role, backups: initial, keepCount, note } = Route.useLoaderData();
  const createBackup = useServerFn(createBackupFn);
  const deleteBackup = useServerFn(deleteBackupFn);
  const downloadBackup = useServerFn(downloadBackupFn);
  const restoreUpload = useServerFn(restoreBackupUploadFn);
  const restoreNamed = useServerFn(restoreBackupNamedFn);
  const listBackups = useServerFn(listBackupsFn);
  const [backups, setBackups] = useState(initial);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const data = await listBackups();
    setBackups(data.backups);
  }

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Backups</h1>
      <p className="mt-2 text-sm text-[#243447]">
        Website CMS + uploads. Download a zip to your computer, or upload a zip to restore.
      </p>
      <p className="mt-1 text-xs text-[#5b6b7c]">{note}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
          onClick={async () => {
            setBusy(true);
            try {
              const res = await createBackup();
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              await refresh();
              toast.success(`Backup created (${formatBytes(res.backup.size)})`);
              if (res.pruned?.length) {
                toast.message(`Removed old backup(s): kept latest ${keepCount}`);
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Working…" : "Create backup now"}
        </button>

        <button
          type="button"
          disabled={busy}
          className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-6 text-sm font-semibold text-[#2f6fb8] disabled:opacity-60"
          onClick={() => fileRef.current?.click()}
        >
          Upload zip & restore
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (!file.name.toLowerCase().endsWith(".zip")) {
              toast.error("Please choose a .zip backup file");
              return;
            }
            if (
              !confirm(
                `Restore website from "${file.name}"?\n\nThis replaces current content and media. A safety backup will be created first.`,
              )
            ) {
              return;
            }
            setBusy(true);
            try {
              const dataBase64 = await fileToBase64(file);
              const res = await restoreUpload({
                data: {
                  fileName: file.name,
                  size: file.size,
                  dataBase64,
                },
              });
              if (!res.ok) {
                toast.error(res.error);
                if ("safetyBackup" in res && res.safetyBackup) {
                  toast.message(`Safety backup kept: ${res.safetyBackup}`);
                }
                await refresh();
                return;
              }
              await refresh();
              toast.success("Website restored from zip");
              toast.message(`Safety backup: ${res.safetyBackup}`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Restore failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[#61c3ec]/25 bg-white px-4 py-3 text-xs text-[#5b6b7c]">
        Restore tip: upload an OrderWeb backup zip (contains <code>cms-db.json</code> +{" "}
        <code>cms-uploads</code>). Current site is snapshotted automatically before restore.
      </div>

      <ul className="mt-6 space-y-2">
        {backups.length === 0 ? (
          <li className="rounded-xl bg-white px-4 py-3 text-sm text-[#5b6b7c] ring-1 ring-[#61c3ec]/25">
            No backups yet. Create one, or wait for the month-end auto backup.
          </li>
        ) : (
          backups.map((row) => (
            <li
              key={row.name}
              className="flex flex-col gap-3 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-[#61c3ec]/25 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#0a1a4a]">{row.name}</p>
                <p className="mt-1 text-xs text-[#5b6b7c]">
                  {row.kind === "auto" ? "Auto" : "Manual"} · {formatBytes(row.size)} ·{" "}
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="h-10 rounded-full border border-[#61c3ec]/40 bg-white px-4 text-sm font-semibold text-[#2f6fb8] disabled:opacity-60"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const res = await downloadBackup({ data: { name: row.name } });
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      const bin = Uint8Array.from(atob(res.dataBase64), (c) => c.charCodeAt(0));
                      const blob = new Blob([bin], { type: res.mime });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = res.name;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Download started");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Download zip
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="h-10 rounded-full border border-[#61c3ec]/40 bg-white px-4 text-sm font-semibold text-[#0a1a4a] disabled:opacity-60"
                  onClick={async () => {
                    if (
                      !confirm(
                        `Restore website from "${row.name}"?\n\nThis replaces current content and media. A safety backup will be created first.`,
                      )
                    ) {
                      return;
                    }
                    setBusy(true);
                    try {
                      const res = await restoreNamed({ data: { name: row.name } });
                      if (!res.ok) {
                        toast.error(res.error);
                        if ("safetyBackup" in res && res.safetyBackup) {
                          toast.message(`Safety backup kept: ${res.safetyBackup}`);
                        }
                        await refresh();
                        return;
                      }
                      await refresh();
                      toast.success("Website restored");
                      toast.message(`Safety backup: ${res.safetyBackup}`);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Restore
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="h-10 rounded-full border border-[#d8e4ef] px-4 text-sm font-semibold text-[#0a1a4a] disabled:opacity-60"
                  onClick={async () => {
                    if (!confirm(`Delete backup ${row.name}?`)) return;
                    setBusy(true);
                    try {
                      const res = await deleteBackup({ data: { name: row.name } });
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      await refresh();
                      toast.success("Backup deleted");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </AdminShell>
  );
}
