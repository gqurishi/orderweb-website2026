import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionCard, TextField } from "@/components/admin/Field";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import { getSettingsFn, saveSocialLinksFn } from "@/lib/cms/cms.functions";

export const Route = createFileRoute("/owadmin/social")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    if (session.role !== "admin") throw redirect({ to: "/owadmin" });
    const settings = await getSettingsFn();
    return { email: session.email, role: "admin" as const, settings };
  },
  component: SocialMediaPage,
});

function looksLikeUrl(value: string) {
  const v = value.trim();
  if (!v) return true; // blank = hide icon
  return /^https?:\/\/\S+$/i.test(v);
}

function SocialMediaPage() {
  const { email, role, settings: initial } = Route.useLoaderData();
  const save = useServerFn(saveSocialLinksFn);
  const [facebook, setFacebook] = useState(initial.socialFacebook ?? "");
  const [instagram, setInstagram] = useState(initial.socialInstagram ?? "");
  const [youtube, setYoutube] = useState(initial.socialYoutube ?? "");
  const [x, setX] = useState(initial.socialX ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Social media</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#243447]">
        These links power the circular icons in the website footer (Facebook, Instagram, YouTube,
        X). Paste full URLs starting with https://. Leave a field blank to hide that icon.
      </p>

      <div className="mt-6 max-w-xl space-y-4">
        <SectionCard title="Footer social links">
          <TextField
            label="Facebook"
            value={facebook}
            onChange={setFacebook}
            hint="Example: https://www.facebook.com/orderweb"
          />
          <TextField
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
            hint="Example: https://www.instagram.com/orderweb"
          />
          <TextField
            label="YouTube"
            value={youtube}
            onChange={setYoutube}
            hint="Example: https://www.youtube.com/@orderweb"
          />
          <TextField
            label="X (Twitter)"
            value={x}
            onChange={setX}
            hint="Example: https://x.com/orderweb"
          />

          <div className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c]">
            After saving, open the public site footer to confirm the icons open the right profiles.
          </div>

          <button
            type="button"
            disabled={busy}
            className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
            onClick={async () => {
              const fields = [
                ["Facebook", facebook],
                ["Instagram", instagram],
                ["YouTube", youtube],
                ["X", x],
              ] as const;
              for (const [name, value] of fields) {
                if (!looksLikeUrl(value)) {
                  toast.error(`${name} must be a full https:// link (or left blank).`);
                  return;
                }
              }
              setBusy(true);
              try {
                await save({
                  data: {
                    socialFacebook: facebook.trim(),
                    socialInstagram: instagram.trim(),
                    socialYoutube: youtube.trim(),
                    socialX: x.trim(),
                  },
                });
                toast.success("Social links saved — live on the footer");
              } catch {
                toast.error("Could not save social links");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "Save social links"}
          </button>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
