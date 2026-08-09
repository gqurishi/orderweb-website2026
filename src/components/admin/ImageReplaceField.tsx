import { useServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";
import { toast } from "sonner";
import { uploadMediaFn } from "@/lib/cms/cms.functions";

async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

/**
 * Easy picture replace for page editors — upload new image, preview, or restore default.
 */
export function ImageReplaceField({
  label,
  value,
  onChange,
  fallbackSrc,
  hint = "JPG, PNG, or WebP · under 5MB. Recommended ~1200×900.",
  folder = "pages",
  successMessage = "Picture updated — Save draft, then Publish",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Built-in site image shown when value is blank */
  fallbackSrc?: string;
  hint?: string;
  folder?: string;
  successMessage?: string;
}) {
  const upload = useServerFn(uploadMediaFn);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const preview = value.trim() || fallbackSrc || "";
  const usingDefault = !value.trim() && Boolean(fallbackSrc);

  return (
    <div className="rounded-xl bg-[#f3f9fc] p-4 ring-1 ring-[#61c3ec]/20">
      <p className="text-sm font-medium text-[#0a1a4a]">{label}</p>
      <p className="mt-0.5 text-xs text-[#5b6b7c]">{hint}</p>

      <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-[#61c3ec]/25">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="mx-auto max-h-56 w-full object-contain object-center p-3"
          />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-[#5b6b7c]">
            No picture yet — upload one below
          </div>
        )}
      </div>

      <p className="mt-2 text-xs font-medium text-[#2f6fb8]">
        {usingDefault
          ? "Showing the built-in default picture"
          : value.trim()
            ? "Custom picture (will show on the site after Publish)"
            : "No picture selected"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-semibold text-white ${
            busy ? "bg-[#2f6fb8]/60" : "btn-brand-gradient"
          }`}
        >
          {busy ? "Uploading…" : "Replace picture"}
          <input
            id={inputId}
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
                    mime: file.type || "image/jpeg",
                    size: file.size,
                    dataBase64,
                    alt: label,
                    folder,
                    tags: ["page-image"],
                  },
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                onChange(res.item.url);
                toast.success(successMessage);
              } catch {
                toast.error("Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>

        {fallbackSrc ? (
          <button
            type="button"
            disabled={busy || usingDefault}
            className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold text-[#0a1a4a] disabled:opacity-40"
            onClick={() => {
              onChange("");
              toast.message("Using the built-in default picture");
            }}
          >
            Use default picture
          </button>
        ) : value.trim() ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
            onClick={() => onChange("")}
          >
            Remove picture
          </button>
        ) : null}

        <button
          type="button"
          className="rounded-full border border-transparent px-3 py-2 text-xs font-medium text-[#5b6b7c] underline-offset-2 hover:underline"
          onClick={() => setShowUrl((v) => !v)}
        >
          {showUrl ? "Hide URL" : "Paste URL instead"}
        </button>
      </div>

      {showUrl ? (
        <label className="mt-3 block text-sm font-medium text-[#0a1a4a]">
          Image URL
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/cms-uploads/… or https://…"
            className="mt-1.5 w-full rounded-xl border border-[#61c3ec]/30 bg-white px-3 py-2 text-sm outline-none focus:border-[#2f6fb8]"
          />
        </label>
      ) : null}
    </div>
  );
}
