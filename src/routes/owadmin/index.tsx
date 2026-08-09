import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminAuthShell,
  adminAuthInputClass,
} from "@/components/admin/AdminAuthShell";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  cancelMfaLoginFn,
  getAdminSessionFn,
  loginAdminFn,
  requestPasswordResetFn,
  sendSmsMfaBackupFn,
  verifyMfaLoginFn,
} from "@/lib/admin/auth.functions";
import { getDashboardFn } from "@/lib/cms/cms.functions";

export const Route = createFileRoute("/owadmin/")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) {
      return {
        email: null as string | null,
        role: null,
        dash: null,
        mfaPending: Boolean(session.mfaPending),
      };
    }
    const dash = await getDashboardFn();
    return {
      email: session.email,
      role: session.role ?? "admin",
      dash,
      mfaPending: false,
    };
  },
  component: OwAdminIndex,
});

function OwAdminIndex() {
  const data = Route.useLoaderData();
  if (!data.email || !data.dash) {
    return <LoginForm initialMfaPending={data.mfaPending} />;
  }
  return (
    <AdminShell email={data.email} role="admin">
      <Dashboard dash={data.dash} />
    </AdminShell>
  );
}

function LoginForm({ initialMfaPending }: { initialMfaPending: boolean }) {
  const login = useServerFn(loginAdminFn);
  const verifyMfa = useServerFn(verifyMfaLoginFn);
  const cancelMfa = useServerFn(cancelMfaLoginFn);
  const sendSmsBackup = useServerFn(sendSmsMfaBackupFn);
  const requestReset = useServerFn(requestPasswordResetFn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [smsBackupAvailable, setSmsBackupAvailable] = useState(false);
  const [phoneHint, setPhoneHint] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "forgot" | "mfa">(
    initialMfaPending ? "mfa" : "login",
  );

  return (
    <AdminAuthShell
      title={
        mode === "forgot"
          ? "Forgot password"
          : mode === "mfa"
            ? "Two-step verification"
            : "Sign in"
      }
      subtitle={
        mode === "forgot"
          ? "We’ll email a reset link if that account exists."
          : mode === "mfa"
            ? "Use your authenticator app code first. If you don’t have the app, send an SMS backup code."
            : "Use your OrderWeb admin email and password."
      }
      footer={
        <>
          {mode === "login" ? (
            <button
              type="button"
              className="font-medium text-[#2f6fb8] transition hover:text-[#0a1a4a]"
              onClick={() => setMode("forgot")}
            >
              Forgot password?
            </button>
          ) : mode === "mfa" ? (
            <button
              type="button"
              className="font-medium text-[#2f6fb8] transition hover:text-[#0a1a4a]"
              onClick={async () => {
                await cancelMfa();
                setMfaCode("");
                setMode("login");
              }}
            >
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              className="font-medium text-[#2f6fb8] transition hover:text-[#0a1a4a]"
              onClick={() => setMode("login")}
            >
              Back to sign in
            </button>
          )}
          <span className="mx-2 text-[#9aabbc]">·</span>
          <Link
            to="/"
            className="font-medium text-[#2f6fb8] transition hover:text-[#0a1a4a]"
          >
            Back to website
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            if (mode === "forgot") {
              const res = await requestReset({ data: { email } });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success(res.message);
              setMode("login");
              return;
            }
            if (mode === "mfa") {
              const res = await verifyMfa({ data: { code: mfaCode } });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success("Logged in");
              window.location.href = "/owadmin";
              return;
            }
            const res = await login({ data: { email, password } });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            if (res.mfaRequired) {
              setPassword("");
              setSmsBackupAvailable(Boolean(res.smsBackupAvailable));
              setPhoneHint(res.phoneHint ?? null);
              setMode("mfa");
              toast.message("Enter your authenticator code");
              return;
            }
            toast.success("Logged in");
            window.location.href = "/owadmin";
          } finally {
            setBusy(false);
          }
        }}
      >
        {mode === "mfa" ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#0a1a4a]">
              Authenticator or SMS / recovery code
              <input
                type="text"
                inputMode="text"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={20}
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className={adminAuthInputClass}
              />
            </label>
            {smsBackupAvailable ? (
              <button
                type="button"
                disabled={busy}
                className="w-full rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#2f6fb8] transition hover:border-[#61c3ec]/70 disabled:opacity-60"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await sendSmsBackup();
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    if (res.phoneHint) setPhoneHint(res.phoneHint);
                    toast.success(res.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy
                  ? "Sending SMS…"
                  : phoneHint
                    ? `Send SMS backup code to ${phoneHint}`
                    : "Send SMS backup code"}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-[#0a1a4a]">
              Email
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={adminAuthInputClass}
              />
            </label>
            {mode === "login" ? (
              <label className="block text-sm font-medium text-[#0a1a4a]">
                Password
                <input
                  type="password"
                  required
                  minLength={5}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={adminAuthInputClass}
                />
              </label>
            ) : null}
          </>
        )}
        <button
          type="submit"
          disabled={busy}
          className="btn-brand-gradient mt-2 h-12 w-full rounded-full text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(47,111,184,0.85)] transition disabled:opacity-60"
        >
          {busy
            ? "Please wait…"
            : mode === "forgot"
              ? "Send reset link"
              : mode === "mfa"
                ? "Verify and sign in"
                : "Sign in"}
        </button>
      </form>
    </AdminAuthShell>
  );
}

function Dashboard({
  dash,
}: {
  dash: Awaited<ReturnType<typeof getDashboardFn>>;
}) {
  return (
    <div>
      <h1 className="text-3xl text-[#0a1a4a]">Dashboard</h1>
      <p className="mt-2 text-sm text-[#243447]">
        Edit as draft → preview → publish. Revert restores the last published version.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusCard
          label="Email"
          value={dash.settings.emailConfigured ? "SMTP ready" : "Not configured"}
          ok={Boolean(dash.settings.emailConfigured)}
        />
        <StatusCard label="Inbox" value={dash.settings.contactToEmail} ok />
        <StatusCard label="Workflow" value="Draft → Publish" ok />
      </div>

      <div className="mt-8 grid gap-3">
        {dash.pages.map((page) => (
          <Link
            key={page.key}
            to="/owadmin/pages/$pageKey"
            params={{ pageKey: page.key }}
            className="flex items-center justify-between rounded-2xl border border-[#61c3ec]/25 bg-white px-5 py-4 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)] transition hover:border-[#61c3ec]/50"
          >
            <div>
              <p className="font-semibold text-[#0a1a4a]">{page.title}</p>
              <p className="mt-0.5 text-xs text-[#5b6b7c]">
                {page.path}
                {page.updatedAt
                  ? ` · Draft ${new Date(page.updatedAt).toLocaleString()}`
                  : " · Defaults"}
                {page.publishedAt
                  ? ` · Published ${new Date(page.publishedAt).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <span className="text-sm font-semibold text-[#2f6fb8]">
              {page.status === "dirty"
                ? "Unpublished →"
                : page.status === "draft"
                  ? "Draft →"
                  : "Edit →"}
            </span>
          </Link>
        ))}
      </div>

      {dash.activity?.length ? (
        <div className="mt-8">
          <h2 className="text-lg text-[#0a1a4a]">Recent activity</h2>
          <ul className="mt-3 space-y-2">
            {dash.activity.map((row) => (
              <li
                key={row.id}
                className="rounded-xl bg-white px-4 py-2 text-sm ring-1 ring-[#61c3ec]/25"
              >
                <span className="font-medium text-[#0a1a4a]">{row.summary}</span>
                <span className="mt-0.5 block text-xs text-[#5b6b7c]">
                  {row.actorEmail} · {new Date(row.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/owadmin/media"
          className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold"
        >
          Media library
        </Link>
        <Link
          to="/owadmin/activity"
          className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold"
        >
          Activity
        </Link>
        <Link
          to="/owadmin/users"
          className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold"
        >
          Users
        </Link>
        <Link
          to="/owadmin/settings"
          className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6fb8]">{label}</p>
      <p className={`mt-1 text-sm font-medium ${ok ? "text-[#0a1a4a]" : "text-amber-700"}`}>
        {value}
      </p>
    </div>
  );
}
