import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { SectionCard, TextField } from "@/components/admin/Field";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import { getSettingsFn, saveFooterBadgeFn } from "@/lib/cms/cms.functions";
import {
  migrateLegacyFooterBadges,
  type FooterBadgeItem,
} from "@/lib/site/footerBadge";

export const Route = createFileRoute("/owadmin/badges")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    if (session.role !== "admin") throw redirect({ to: "/owadmin" });
    const settings = await getSettingsFn();
    return { email: session.email, role: "admin" as const, settings };
  },
  component: TrustBadgesPage,
});

function looksLikeHref(value: string) {
  const v = value.trim();
  if (!v) return true;
  return /^(https?:\/\/\S+|\/\S*)$/i.test(v);
}

function TrustBadgesPage() {
  const { email, role, settings: initial } = Route.useLoaderData();
  const save = useServerFn(saveFooterBadgeFn);
  const [badges, setBadges] = useState<FooterBadgeItem[]>(() =>
    migrateLegacyFooterBadges(initial),
  );
  const [busy, setBusy] = useState(false);

  function updateBadge(id: string, patch: Partial<FooterBadgeItem>) {
    setBadges((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Trust badges</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#243447]">
        These appear side by side under the Legal menu in the footer. Turn each on/off, replace
        the image, edit alt text, or add an optional link.
      </p>

      <div className="mt-6 max-w-xl space-y-4">
        {badges.map((badge) => (
          <SectionCard key={badge.id} title={badge.label || badge.id}>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-[#f3f9fc] px-4 py-3 ring-1 ring-[#61c3ec]/20">
              <div>
                <p className="text-sm font-medium text-[#0a1a4a]">Show on website</p>
                <p className="mt-0.5 text-xs text-[#5b6b7c]">
                  When off, this badge is hidden from the footer.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={badge.enabled}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  badge.enabled ? "bg-[#2f6fb8]" : "bg-[#c5d3e0]"
                }`}
                onClick={() => updateBadge(badge.id, { enabled: !badge.enabled })}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    badge.enabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            <ImageReplaceField
              label="Badge image"
              value={badge.image}
              onChange={(image) => updateBadge(badge.id, { image })}
              fallbackSrc={badge.defaultImage}
              hint="Transparent PNG works best · under 5MB."
              folder="badges"
              successMessage="Badge image uploaded — click Save badges to publish"
            />

            <TextField
              label="Alt text"
              value={badge.alt}
              onChange={(alt) => updateBadge(badge.id, { alt })}
              hint="Shown to screen readers"
            />
            <TextField
              label="Optional link"
              value={badge.href}
              onChange={(href) => updateBadge(badge.id, { href })}
              hint="Leave blank for no link. Or use https://… or a site path like /privacy"
            />
          </SectionCard>
        ))}

        <div className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c]">
          Preview path: footer Legal column, under Cookie settings. Badges display in a row (PCI
          then ICO by default).
        </div>

        <button
          type="button"
          disabled={busy}
          className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
          onClick={async () => {
            for (const badge of badges) {
              if (badge.enabled && !badge.alt.trim()) {
                toast.error(`${badge.label}: alt text is required`);
                return;
              }
              if (!looksLikeHref(badge.href)) {
                toast.error(`${badge.label}: link must be https://…, a /path, or blank`);
                return;
              }
            }
            setBusy(true);
            try {
              await save({
                data: {
                  footerBadges: badges.map((b) => ({
                    ...b,
                    image: b.image.trim(),
                    alt: b.alt.trim(),
                    href: b.href.trim(),
                  })),
                },
              });
              toast.success("Trust badges saved — live on the website");
            } catch {
              toast.error("Could not save trust badges");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save badges"}
        </button>
      </div>
    </AdminShell>
  );
}
