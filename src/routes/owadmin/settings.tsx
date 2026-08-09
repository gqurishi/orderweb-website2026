import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { TextField, SectionCard } from "@/components/admin/Field";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import { getSettingsFn, saveSettingsFn, sendTestEmailFn } from "@/lib/cms/cms.functions";

export const Route = createFileRoute("/owadmin/settings")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    if (session.role !== "admin") throw redirect({ to: "/owadmin" });
    const settings = await getSettingsFn();
    return { email: session.email, role: "admin" as const, settings };
  },
  component: SettingsPage,
});

const SMTP_PRESETS: Record<
  string,
  { label: string; host: string; port: number; secure: boolean }
> = {
  custom: { label: "Custom SMTP", host: "", port: 587, secure: false },
  hostinger: {
    label: "Hostinger",
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
  },
  gmail: { label: "Gmail / Google Workspace", host: "smtp.gmail.com", port: 587, secure: false },
  outlook: {
    label: "Outlook / Microsoft 365",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
  },
  ssl465: { label: "SSL port 465", host: "", port: 465, secure: true },
};

function extractEmail(value: string) {
  const m = value.match(/<([^>]+)>/);
  return (m?.[1] || value).trim().toLowerCase();
}

function SettingsPage() {
  const { email, role, settings: initial } = Route.useLoaderData();
  const save = useServerFn(saveSettingsFn);
  const testEmail = useServerFn(sendTestEmailFn);

  const [contactToEmail, setTo] = useState(initial.contactToEmail);
  const [contactFromEmail, setFrom] = useState(initial.contactFromEmail);
  const [smtpHost, setSmtpHost] = useState(initial.smtpHost ?? "");
  const [smtpPort, setSmtpPort] = useState(String(initial.smtpPort || 587));
  const [smtpSecure, setSmtpSecure] = useState(Boolean(initial.smtpSecure));
  const [smtpUser, setSmtpUser] = useState(initial.smtpUser ?? "");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpPasswordSet, setSmtpPasswordSet] = useState(initial.smtpPasswordSet);
  const [smtpPasswordMasked, setSmtpPasswordMasked] = useState(
    initial.smtpPasswordMasked ?? null,
  );
  const [emailConfigured, setEmailConfigured] = useState(initial.emailConfigured);

  const [gaId, setGaId] = useState(initial.analyticsGaMeasurementId ?? "");
  const [gtmId, setGtmId] = useState(initial.analyticsGtmId ?? "");
  const [metaPixelId, setMetaPixelId] = useState(initial.analyticsMetaPixelId ?? "");
  const [clarityId, setClarityId] = useState(initial.analyticsClarityId ?? "");
  const [googleVerify, setGoogleVerify] = useState(initial.seoGoogleSiteVerification ?? "");
  const [bingVerify, setBingVerify] = useState(initial.seoBingSiteVerification ?? "");
  const [customHead, setCustomHead] = useState(initial.analyticsCustomHeadHtml ?? "");
  const [busy, setBusy] = useState(false);

  const fromMismatch = useMemo(() => {
    const user = smtpUser.trim().toLowerCase();
    if (!user.includes("@")) return false;
    const from = extractEmail(contactFromEmail);
    return Boolean(from) && from !== user;
  }, [contactFromEmail, smtpUser]);

  function applyPort(nextPort: string) {
    setSmtpPort(nextPort);
    const port = Number(nextPort);
    if (port === 465) setSmtpSecure(true);
    if (port === 587) setSmtpSecure(false);
  }

  function matchFromToSmtpUser() {
    const user = smtpUser.trim();
    if (!user.includes("@")) {
      toast.error("Set SMTP username to a full mailbox first (e.g. mail@orderweb.co.uk)");
      return;
    }
    const nameMatch = contactFromEmail.match(/^\s*(.*?)\s*<[^>]+>\s*$/);
    const name = (nameMatch?.[1] || "OrderWeb Website").trim() || "OrderWeb Website";
    setFrom(`${name} <${user}>`);
    toast.message("From address matched to SMTP username");
  }

  async function saveAll(): Promise<boolean> {
    const port = Number(smtpPort);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      toast.error("SMTP port must be between 1 and 65535");
      return false;
    }
    if (!contactToEmail.trim()) {
      toast.error("Inbox email is required");
      return false;
    }
    // Port 465 is implicit SSL — keep the flag in sync so Hostinger/cPanel setups work.
    const secure = port === 465 ? true : smtpSecure;
    if (secure !== smtpSecure) setSmtpSecure(secure);

    let fromValue = contactFromEmail.trim();
    const user = smtpUser.trim();
    if (user.includes("@")) {
      const fromAddr = extractEmail(fromValue);
      if (!fromAddr || fromAddr !== user.toLowerCase()) {
        const nameMatch = fromValue.match(/^\s*(.*?)\s*<[^>]+>\s*$/);
        const name = (nameMatch?.[1] || "OrderWeb Website").trim() || "OrderWeb Website";
        fromValue = `${name} <${user}>`;
        setFrom(fromValue);
      }
    }

    setBusy(true);
    try {
      const res = await save({
        data: {
          contactToEmail,
          contactFromEmail: fromValue,
          smtpHost,
          smtpPort: port,
          smtpSecure: secure,
          smtpUser,
          analyticsGaMeasurementId: gaId,
          analyticsGtmId: gtmId,
          analyticsMetaPixelId: metaPixelId,
          analyticsClarityId: clarityId,
          seoGoogleSiteVerification: googleVerify,
          seoBingSiteVerification: bingVerify,
          analyticsCustomHeadHtml: customHead,
          ...(smtpPassword.trim() ? { smtpPassword: smtpPassword.trim() } : {}),
        },
      });
      setSmtpPassword("");
      setSmtpPasswordSet(res.settings.smtpPasswordSet);
      setSmtpPasswordMasked(res.settings.smtpPasswordMasked ?? null);
      setEmailConfigured(res.settings.emailConfigured);
      setFrom(res.settings.contactFromEmail);
      setSmtpSecure(Boolean(res.settings.smtpSecure));
      setSmtpPort(String(res.settings.smtpPort || port));
      toast.success("Settings saved — contact form will use these SMTP details");
      return true;
    } catch {
      toast.error("Could not save settings");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#243447]">
        Configure SMTP for website email, and tracking / SEO verification for Google and Bing.
        Values you save here are what the live site uses. Passwords stay server-side and are never
        shown in full after saving.
      </p>

      <div className="mt-6 max-w-2xl space-y-4">
        <SectionCard title="Website inbox">
          <p className="text-sm text-[#5b6b7c]">
            Contact form messages and admin test emails go to this address. Outbound mail uses the
            From identity below — it must match your SMTP mailbox for Hostinger and most hosts.
          </p>
          <TextField
            label="Inbox email (where messages arrive)"
            value={contactToEmail}
            onChange={setTo}
            hint="Example: mail@orderweb.co.uk"
          />
          <TextField
            label="From name / address"
            value={contactFromEmail}
            onChange={setFrom}
            hint="Example: OrderWeb Website <mail@orderweb.co.uk> — same mailbox as SMTP username"
          />
          {fromMismatch ? (
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
              From address does not match SMTP username. Most hosts will reject mail.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={matchFromToSmtpUser}
              >
                Match From to SMTP username
              </button>
            </div>
          ) : null}
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              emailConfigured
                ? "bg-emerald-50 text-emerald-900"
                : "bg-amber-50 text-amber-950"
            }`}
          >
            Mail status:{" "}
            <strong>
              {emailConfigured
                ? "SMTP ready — contact form can send"
                : "Not ready — finish SMTP details below"}
            </strong>
          </div>
        </SectionCard>

        <SectionCard title="SMTP server">
          <p className="text-sm text-[#5b6b7c]">
            Use your mailbox hosting (Hostinger, cPanel, Google Workspace, Microsoft 365, or your
            own mail server). Contact form, test mail, and password reset all send through these
            saved settings. Change provider anytime → Save → Send test email.
          </p>

          <div className="space-y-3 rounded-xl bg-[#f3f9fc] p-3 ring-1 ring-[#61c3ec]/20">
            <label className="block text-xs font-medium text-[#0a1a4a]">
              Quick preset
              <select
                className="mt-1 h-10 w-full rounded-lg border border-[#61c3ec]/30 bg-white px-3 text-sm"
                defaultValue="custom"
                onChange={(e) => {
                  const preset = SMTP_PRESETS[e.target.value];
                  if (!preset) return;
                  if (preset.host) setSmtpHost(preset.host);
                  applyPort(String(preset.port));
                  setSmtpSecure(preset.secure);
                }}
              >
                {Object.entries(SMTP_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label="SMTP host"
              value={smtpHost}
              onChange={setSmtpHost}
              hint="e.g. smtp.hostinger.com, smtp.gmail.com, or mail.yourdomain.com"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Port"
                value={smtpPort}
                onChange={applyPort}
                hint="587 (STARTTLS) or 465 (SSL) — 465 auto-enables SSL"
              />
              <label className="flex items-center gap-2 pt-7 text-sm text-[#0a1a4a]">
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                />
                Use SSL (port 465)
              </label>
            </div>
            <TextField
              label="SMTP username"
              value={smtpUser}
              onChange={setSmtpUser}
              hint="Full mailbox address, e.g. mail@orderweb.co.uk"
            />
            <div className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-[#61c3ec]/20">
              SMTP password:{" "}
              <strong>
                {smtpPasswordSet
                  ? smtpPasswordMasked || "Saved (hidden)"
                  : "Not set — paste below"}
              </strong>
            </div>
            <TextField
              label="SMTP password"
              type="password"
              value={smtpPassword}
              onChange={setSmtpPassword}
              hint="Paste a new password/app password to update. Leave blank to keep the current one. Gmail needs an App Password."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
              onClick={() => void saveAll()}
            >
              {busy ? "Saving…" : "Save email settings"}
            </button>
            <button
              type="button"
              disabled={busy}
              className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-6 text-sm font-semibold text-[#0a1a4a] disabled:opacity-50"
              onClick={async () => {
                const saved = await saveAll();
                if (!saved) return;
                setBusy(true);
                try {
                  const res = await testEmail();
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success(`Test email sent to ${res.to}`);
                } catch {
                  toast.error("Test email failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save & send test email
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Analytics & SEO">
          <p className="text-sm text-[#5b6b7c]">
            These tags load on public pages only (not admin). Page titles and descriptions still
            edit per page under each page editor → Search listing.
          </p>
          <TextField
            label="Google Analytics 4 ID"
            value={gaId}
            onChange={setGaId}
            hint="Optional. Example: G-XXXXXXXXXX"
          />
          <TextField
            label="Google Tag Manager ID"
            value={gtmId}
            onChange={setGtmId}
            hint="Optional. Example: GTM-XXXXXXX — use this if you manage tags in GTM"
          />
          <TextField
            label="Google Search Console verification"
            value={googleVerify}
            onChange={setGoogleVerify}
            hint="Paste only the content value from Google’s HTML tag (not the full meta tag)"
          />
          <TextField
            label="Bing Webmaster verification"
            value={bingVerify}
            onChange={setBingVerify}
            hint="Paste the msvalidate.01 content value from Bing"
          />
          <TextField
            label="Meta (Facebook) Pixel ID"
            value={metaPixelId}
            onChange={setMetaPixelId}
            hint="Optional. Numbers only, e.g. 1234567890"
          />
          <TextField
            label="Microsoft Clarity ID"
            value={clarityId}
            onChange={setClarityId}
            hint="Optional. Project ID from clarity.microsoft.com"
          />
          <TextField
            label="Custom head HTML"
            value={customHead}
            onChange={setCustomHead}
            multiline
            hint="Optional escape hatch for Plausible, extra pixels, or other script/meta tags."
          />
          <button
            type="button"
            disabled={busy}
            className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-6 text-sm font-semibold text-[#0a1a4a] disabled:opacity-60"
            onClick={() => void saveAll()}
          >
            Save analytics & SEO
          </button>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
