import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionCard, TextField } from "@/components/admin/Field";
import {
  cancelMfaEnrollFn,
  changePasswordFn,
  confirmMfaEnrollFn,
  disableMfaFn,
  disableSmsBackupFn,
  getAdminSessionFn,
  getMfaStatusFn,
  saveSmsBackupFn,
  startMfaEnrollFn,
} from "@/lib/admin/auth.functions";
import type { AdminRole } from "@/lib/cms/types";

export const Route = createFileRoute("/owadmin/account")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    const mfa = await getMfaStatusFn();
    return {
      email: session.email,
      role: (session.role ?? "admin") as AdminRole,
      mfa,
    };
  },
  component: AccountPage,
});

function AccountPage() {
  const { email, role, mfa: initialMfa } = Route.useLoaderData();
  const changePassword = useServerFn(changePasswordFn);
  const startMfa = useServerFn(startMfaEnrollFn);
  const confirmMfa = useServerFn(confirmMfaEnrollFn);
  const cancelMfa = useServerFn(cancelMfaEnrollFn);
  const disableMfa = useServerFn(disableMfaFn);
  const saveSmsBackup = useServerFn(saveSmsBackupFn);
  const disableSmsBackup = useServerFn(disableSmsBackupFn);

  const [currentPassword, setCurrent] = useState("");
  const [nextPassword, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(initialMfa.enabled);
  const [recoveryRemaining, setRecoveryRemaining] = useState(initialMfa.recoveryRemaining);
  const [smsBackupEnabled, setSmsBackupEnabled] = useState(initialMfa.smsBackupEnabled);
  const [phoneHint, setPhoneHint] = useState(initialMfa.phoneHint);
  const [smsPhone, setSmsPhone] = useState(initialMfa.phoneE164 ?? "");
  const [smsPassword, setSmsPassword] = useState("");
  const [telnyxConfigured, setTelnyxConfigured] = useState(initialMfa.telnyxConfigured);
  const [enrollPassword, setEnrollPassword] = useState("");
  const [enrollCode, setEnrollCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [enroll, setEnroll] = useState<null | {
    secret: string;
    qrDataUrl: string;
  }>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [showDisable, setShowDisable] = useState(false);

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Account</h1>
      <p className="mt-2 text-sm text-[#243447]">
        Signed in as <strong>{email}</strong>. Authenticator is primary MFA; SMS is optional backup.
      </p>

      <div className="mt-6 max-w-xl space-y-4">
        <SectionCard title="Authenticator (TOTP)">
          {mfaEnabled ? (
            <>
              <p className="text-sm text-[#243447]">
                Authenticator is <strong className="text-[#0a1a4a]">on</strong>. Sign-in needs your
                password plus a 6-digit code from your authenticator app.
              </p>
              <p className="text-xs text-[#5b6b7c]">
                Recovery codes remaining: {recoveryRemaining}. Keep a backup copy somewhere safe.
              </p>
              {!showDisable ? (
                <button
                  type="button"
                  className="h-11 rounded-full border border-[#d8e4ef] bg-white px-6 text-sm font-semibold text-[#0a1a4a]"
                  onClick={() => setShowDisable(true)}
                >
                  Turn off authenticator
                </button>
              ) : (
                <>
                  <TextField
                    label="Password"
                    type="password"
                    value={disablePassword}
                    onChange={setDisablePassword}
                  />
                  <TextField
                    label="Authenticator or recovery code"
                    value={disableCode}
                    onChange={setDisableCode}
                    hint="6-digit app code, or a backup recovery code."
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      className="h-11 rounded-full bg-[#0a1a4a] px-6 text-sm font-semibold text-white disabled:opacity-60"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const res = await disableMfa({
                            data: { password: disablePassword, code: disableCode },
                          });
                          if (!res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          setMfaEnabled(false);
                          setRecoveryRemaining(0);
                          setSmsBackupEnabled(false);
                          setShowDisable(false);
                          setDisablePassword("");
                          setDisableCode("");
                          toast.success("Authenticator turned off");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {busy ? "Turning off…" : "Confirm turn off"}
                    </button>
                    <button
                      type="button"
                      className="h-11 rounded-full px-4 text-sm font-medium text-[#5b6b7c]"
                      onClick={() => setShowDisable(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          ) : recoveryCodes ? (
            <>
              <p className="text-sm font-medium text-[#0a1a4a]">Save these recovery codes now</p>
              <p className="text-xs text-[#5b6b7c]">
                Each code works once if you lose your phone. We won’t show them again.
              </p>
              <ul className="grid grid-cols-2 gap-2 rounded-xl bg-[#f3f9fc] p-3 font-mono text-sm text-[#0a1a4a]">
                {recoveryCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white"
                onClick={() => {
                  setRecoveryCodes(null);
                  toast.success("Authenticator is active");
                }}
              >
                I’ve saved these codes
              </button>
            </>
          ) : enroll ? (
            <>
              <p className="text-sm text-[#243447]">
                Scan this QR with your authenticator app (Google Authenticator, Authy, TOTP
                Authenticator, etc.), then enter the 6-digit code.
              </p>
              <div className="flex justify-center rounded-2xl bg-white p-4 ring-1 ring-[#61c3ec]/25">
                <img src={enroll.qrDataUrl} alt="Authenticator QR code" className="h-[220px] w-[220px]" />
              </div>
              <p className="break-all text-xs text-[#5b6b7c]">
                Can’t scan? Enter this key manually:{" "}
                <span className="font-mono text-[#0a1a4a]">{enroll.secret}</span>
              </p>
              <TextField
                label="6-digit code"
                value={enrollCode}
                onChange={setEnrollCode}
                hint="From your authenticator app"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const res = await confirmMfa({ data: { code: enrollCode } });
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setEnroll(null);
                      setEnrollCode("");
                      setEnrollPassword("");
                      setMfaEnabled(true);
                      setRecoveryRemaining(res.recoveryCodes.length);
                      setRecoveryCodes(res.recoveryCodes);
                      toast.success("Authenticator enabled");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Verifying…" : "Confirm and enable"}
                </button>
                <button
                  type="button"
                  className="h-11 rounded-full px-4 text-sm font-medium text-[#5b6b7c]"
                  onClick={async () => {
                    await cancelMfa();
                    setEnroll(null);
                    setEnrollCode("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#243447]">
                Add a free authenticator app for a second step at sign-in. Recommended for admin
                access.
              </p>
              <TextField
                label="Confirm your password"
                type="password"
                value={enrollPassword}
                onChange={setEnrollPassword}
              />
              <button
                type="button"
                disabled={busy}
                className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await startMfa({ data: { password: enrollPassword } });
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    setEnroll({ secret: res.secret, qrDataUrl: res.qrDataUrl });
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Starting…" : "Set up authenticator"}
              </button>
            </>
          )}
        </SectionCard>

        <SectionCard title="SMS backup (Telnyx)">
          {!mfaEnabled ? (
            <p className="text-sm text-[#243447]">
              Turn on authenticator MFA first. SMS is only used if you don’t have the app available.
            </p>
          ) : (
            <>
              <p className="text-sm text-[#243447]">
                Primary sign-in still uses your authenticator. SMS is a backup code sent to your
                mobile via Telnyx.
              </p>
              {smsBackupEnabled && phoneHint ? (
                <p className="text-xs text-[#5b6b7c]">
                  SMS backup is <strong className="text-[#0a1a4a]">on</strong> for {phoneHint}.
                </p>
              ) : (
                <p className="text-xs text-[#5b6b7c]">SMS backup is currently off.</p>
              )}
              {!telnyxConfigured ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
                  Server Telnyx keys are not set yet (`TELNYX_API_KEY` + `TELNYX_FROM_NUMBER`). You can
                  save your number now; SMS send will work after those are added.
                </p>
              ) : null}
              <TextField
                label="Mobile number"
                value={smsPhone}
                onChange={setSmsPhone}
                hint="E.164 format preferred, e.g. +447700900123 (UK 07… also accepted)."
              />
              <TextField
                label="Confirm password"
                type="password"
                value={smsPassword}
                onChange={setSmsPassword}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const res = await saveSmsBackup({
                        data: {
                          password: smsPassword,
                          phone: smsPhone,
                          enabled: true,
                        },
                      });
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setSmsBackupEnabled(res.smsBackupEnabled);
                      setPhoneHint(res.phoneHint);
                      setSmsPhone(res.phoneE164 ?? smsPhone);
                      setTelnyxConfigured(res.telnyxConfigured);
                      setSmsPassword("");
                      toast.success("SMS backup enabled");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Saving…" : "Enable SMS backup"}
                </button>
                {smsBackupEnabled ? (
                  <button
                    type="button"
                    disabled={busy}
                    className="h-11 rounded-full border border-[#d8e4ef] bg-white px-6 text-sm font-semibold text-[#0a1a4a] disabled:opacity-60"
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const res = await disableSmsBackup({
                          data: { password: smsPassword },
                        });
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        setSmsBackupEnabled(false);
                        setPhoneHint(res.phoneHint);
                        setSmsPassword("");
                        toast.success("SMS backup turned off");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Turn off SMS backup
                  </button>
                ) : null}
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Change password">
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrent}
          />
          <TextField
            label="New password"
            type="password"
            value={nextPassword}
            onChange={setNext}
            hint="Min 10 characters, include a letter and a number."
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={setConfirm}
          />
          <button
            type="button"
            disabled={busy}
            className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
            onClick={async () => {
              if (nextPassword !== confirm) {
                toast.error("New passwords do not match");
                return;
              }
              setBusy(true);
              try {
                const res = await changePassword({
                  data: { currentPassword, nextPassword },
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                setCurrent("");
                setNext("");
                setConfirm("");
                toast.success("Password updated");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
