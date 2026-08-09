import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import {
  deleteMediaFn,
  listMediaFn,
  replaceMediaFn,
  updateMediaFn,
  uploadMediaFn,
} from "@/lib/cms/cms.functions";
import { PAGE_META, type AdminRole } from "@/lib/cms/types";

export const Route = createFileRoute("/owadmin/media")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    const media = await listMediaFn();
    return {
      email: session.email,
      role: (session.role ?? "admin") as AdminRole,
      media,
    };
  },
  component: MediaPage,
});

type FilterKey = "all" | "site" | "uploads" | string;

function isSiteItem(item: { tags: string[]; url: string }) {
  return item.tags.includes("site-default") || item.url.startsWith("/cms-uploads/site/");
}

function MediaPage() {
  const { email, role, media: initial } = Route.useLoaderData();
  const upload = useServerFn(uploadMediaFn);
  const update = useServerFn(updateMediaFn);
  const replace = useServerFn(replaceMediaFn);
  const remove = useServerFn(deleteMediaFn);
  const [media, setMedia] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [altDraft, setAltDraft] = useState<Record<string, string>>({});
  const [folderDraft, setFolderDraft] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const item of media) {
      if (item.folder.trim()) set.add(item.folder.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [media]);

  const siteCount = media.filter(isSiteItem).length;
  const uploadCount = media.length - siteCount;

  const filtered = media.filter((item) => {
    if (filter === "site" && !isSiteItem(item)) return false;
    if (filter === "uploads" && isSiteItem(item)) return false;
    if (filter !== "all" && filter !== "site" && filter !== "uploads") {
      if (item.folder !== filter) return false;
    }
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      item.folder.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.name.toLowerCase().includes(q) ||
      item.alt.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q)
    );
  });

  const chips: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All (${media.length})` },
    { key: "site", label: `Site pictures (${siteCount})` },
    { key: "uploads", label: `Uploads (${uploadCount})` },
    ...folders.map((f) => ({
      key: f,
      label: `${f} (${media.filter((m) => m.folder === f).length})`,
    })),
  ];

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Media</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#243447]">
        Every site picture lives here — built-in page images plus anything you upload. JPG, PNG, or
        WebP · max 5MB. Replace keeps the same URL so pages stay linked.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-full bg-[#2f6fb8] px-5 py-2.5 text-sm font-semibold text-white">
          {busy ? "Working…" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 5_000_000) {
                toast.error("File must be under 5MB");
                return;
              }
              setBusy(true);
              try {
                const dataBase64 = await fileToBase64(file);
                const res = await upload({
                  data: {
                    name: file.name,
                    mime: file.type,
                    size: file.size,
                    dataBase64,
                    alt: "",
                    folder: "uploads",
                    tags: ["upload"],
                  },
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                setMedia((m) => [{ ...res.item, usedBy: [] }, ...m]);
                toast.success("Uploaded");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, folder, alt…"
          className="h-10 min-w-[220px] flex-1 rounded-full border border-[#61c3ec]/35 bg-white px-4 text-sm sm:max-w-xs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setFilter(chip.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === chip.key
                ? "bg-[#0a1a4a] text-white"
                : "border border-[#61c3ec]/35 bg-white text-[#0a1a4a]"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-[#5b6b7c]">No pictures match this filter.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const site = isSiteItem(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#61c3ec]/25 bg-white"
              >
                <div className="relative bg-[#f3f9fc]">
                  <img
                    src={item.url}
                    alt={item.alt || item.name}
                    className="aspect-video w-full object-contain object-center p-2"
                  />
                  {site ? (
                    <span className="absolute left-2 top-2 rounded-full bg-[#0a1a4a]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Site default
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium text-[#0a1a4a]">{item.name}</p>
                  <p className="truncate text-xs text-[#5b6b7c]">{item.url}</p>
                  <p className="text-[11px] text-[#5b6b7c]">
                    {item.folder ? (
                      <>
                        Folder: <span className="font-medium text-[#243447]">{item.folder}</span>
                        {" · "}
                      </>
                    ) : null}
                    Used on:{" "}
                    {item.usedBy.length
                      ? item.usedBy.map((k) => PAGE_META[k].title).join(", ")
                      : "Not linked in page content"}
                  </p>
                  <label className="block text-xs font-medium text-[#0a1a4a]">
                    Alt text
                    <input
                      value={altDraft[item.id] ?? item.alt}
                      onChange={(e) =>
                        setAltDraft((d) => ({ ...d, [item.id]: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-[#61c3ec]/30 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-medium text-[#0a1a4a]">
                    Folder
                    <input
                      value={folderDraft[item.id] ?? item.folder}
                      onChange={(e) =>
                        setFolderDraft((d) => ({ ...d, [item.id]: e.target.value }))
                      }
                      placeholder="e.g. heroes"
                      disabled={site}
                      className="mt-1 w-full rounded-lg border border-[#61c3ec]/30 px-2 py-1.5 text-sm disabled:bg-[#f3f9fc] disabled:text-[#5b6b7c]"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.url);
                        toast.success("URL copied");
                      }}
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold"
                      onClick={async () => {
                        const res = await update({
                          data: {
                            id: item.id,
                            alt: altDraft[item.id] ?? item.alt,
                            folder: site
                              ? item.folder
                              : (folderDraft[item.id] ?? item.folder),
                            tags: site
                              ? item.tags
                              : (folderDraft[item.id] ?? item.folder)
                                ? ["upload", folderDraft[item.id] ?? item.folder]
                                : ["upload"],
                          },
                        });
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        setMedia((list) =>
                          list.map((m) =>
                            m.id === item.id ? { ...m, ...res.item, usedBy: m.usedBy } : m,
                          ),
                        );
                        toast.success("Saved");
                      }}
                    >
                      Save meta
                    </button>
                    <label className="cursor-pointer rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold">
                      Replace
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          if (file.size > 5_000_000) {
                            toast.error("File must be under 5MB");
                            return;
                          }
                          setBusy(true);
                          try {
                            const dataBase64 = await fileToBase64(file);
                            const res = await replace({
                              data: {
                                id: item.id,
                                name: file.name,
                                mime: file.type,
                                size: file.size,
                                dataBase64,
                              },
                            });
                            if (!res.ok) {
                              toast.error(res.error);
                              return;
                            }
                            setMedia((list) =>
                              list.map((m) =>
                                m.id === item.id
                                  ? { ...m, ...res.item, usedBy: m.usedBy }
                                  : m,
                              ),
                            );
                            toast.success(
                              site
                                ? "Site picture replaced (same URL)"
                                : "Image replaced in place",
                            );
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </label>
                    {site ? (
                      <span className="rounded-full bg-[#f3f9fc] px-3 py-1 text-xs text-[#5b6b7c]">
                        Built-in — can’t delete
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                        onClick={async () => {
                          if (!confirm("Delete this image from the library?")) return;
                          const res = await remove({ data: { id: item.id } });
                          if (res && "ok" in res && !res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          setMedia((m) => m.filter((x) => x.id !== item.id));
                          toast.success("Deleted");
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}
