import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword, validateStrongPassword, verifyPassword } from "./password.server";
import { assertLoginAllowed, clearLoginFailures, recordLoginFailure } from "./rateLimit.server";
import { getAdminSession, requireAdminEmail, requireRole } from "./session.server";
import {
  clearSmsOtp,
  generateSmsOtpCode,
  maskPhoneE164,
  normalizePhoneE164,
  storeSmsOtp,
  verifySmsOtp,
} from "./smsOtp.server";
import { sendTelnyxSms, telnyxConfigured } from "./telnyx.server";
import {
  createTotpSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  totpKeyUri,
  totpQrDataUrl,
  verifyRecoveryCode,
  verifyTotpCode,
} from "./totp.server";
import {
  appendActivity,
  beginAdminTotpEnroll,
  cancelAdminTotpEnroll,
  changeAdminPassword,
  confirmAdminTotpEnroll,
  consumeAdminRecoveryCode,
  createAdminUser,
  createPasswordResetToken,
  disableAdminTotp,
  disableAdminUser,
  getAdminMfaStatus,
  getAdmins,
  getSettings,
  listAdminPublic,
  resetPasswordWithToken,
  updateAdminSmsBackup,
  upsertAdmin,
} from "@/lib/cms/store.server";
import { sendSiteEmail } from "@/lib/cms/mail.server";

const MFA_PENDING_MS = 10 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

const emptyBodySchema = z.object({}).optional();

async function setFullAdminSession(email: string) {
  const session = await getAdminSession();
  await session.update({
    email,
    role: "admin",
    mfaPendingEmail: "",
    mfaPendingUntil: 0,
  });
}

async function setMfaPendingSession(email: string) {
  const session = await getAdminSession();
  await session.update({
    email: "",
    role: "admin",
    mfaPendingEmail: email,
    mfaPendingUntil: Date.now() + MFA_PENDING_MS,
  });
}

function readMfaPending(sessionData: {
  email?: string;
  mfaPendingEmail?: string;
  mfaPendingUntil?: number;
}) {
  if (sessionData.email) return null;
  const pendingEmail = (sessionData.mfaPendingEmail ?? "").trim().toLowerCase();
  const until = Number(sessionData.mfaPendingUntil ?? 0);
  if (!pendingEmail || !until || Date.now() > until) return null;
  return pendingEmail;
}

export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAdminSession();
  const email = (session.data.email ?? "").trim() || null;
  const mfaPendingEmail = readMfaPending(session.data);
  return {
    email,
    role: email ? ("admin" as const) : null,
    mfaPending: Boolean(mfaPendingEmail),
  };
});

export const loginAdminFn = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const limited = assertLoginAllowed(email);
    if (limited) return { ok: false as const, error: limited };

    const admins = await getAdmins();
    let admin = admins.find((a) => a.email.toLowerCase() === email);

    // Bootstrap first admin from env if none exist yet
    if (!admin && admins.length === 0) {
      const bootEmail = (process.env["VITE_ADMIN_EMAIL"] ?? process.env["ADMIN_EMAIL"] ?? "")
        .trim()
        .toLowerCase();
      const bootPass = process.env["ADMIN_BOOTSTRAP_PASSWORD"] ?? "";
      if (bootEmail && bootPass && email === bootEmail && data.password === bootPass) {
        const { hash, salt } = await hashPassword(data.password);
        admin = {
          email: bootEmail,
          passwordHash: hash,
          salt,
          role: "admin",
          createdAt: new Date().toISOString(),
          createdBy: null,
          disabledAt: null,
          totpEnabled: false,
          totpSecret: null,
          totpPendingSecret: null,
          totpRecoveryHashes: [],
        };
        await upsertAdmin(admin);
      }
    }

    if (!admin || admin.disabledAt) {
      recordLoginFailure(email);
      return { ok: false as const, error: "Invalid email or password." };
    }

    const valid = await verifyPassword(data.password, admin.passwordHash, admin.salt);
    if (!valid) {
      recordLoginFailure(email);
      return { ok: false as const, error: "Invalid email or password." };
    }

    clearLoginFailures(email);

    if (admin.totpEnabled && admin.totpSecret) {
      await setMfaPendingSession(admin.email);
      const smsBackupAvailable = Boolean(
        admin.smsBackupEnabled && admin.phoneE164 && telnyxConfigured(),
      );
      return {
        ok: true as const,
        mfaRequired: true as const,
        smsBackupAvailable,
        phoneHint: smsBackupAvailable && admin.phoneE164 ? maskPhoneE164(admin.phoneE164) : null,
      };
    }

    await setFullAdminSession(admin.email);
    await appendActivity({
      actorEmail: admin.email,
      action: "login",
      summary: "Signed in",
    });
    return {
      ok: true as const,
      mfaRequired: false as const,
      email: admin.email,
      role: "admin" as const,
    };
  });

export const verifyMfaLoginFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string().min(6).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    const pendingEmail = readMfaPending(session.data);
    if (!pendingEmail) {
      return { ok: false as const, error: "Authenticator step expired. Sign in again." };
    }

    const mfaKey = `mfa:${pendingEmail}`;
    const limited = assertLoginAllowed(mfaKey);
    if (limited) return { ok: false as const, error: limited };

    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === pendingEmail);
    if (!admin || admin.disabledAt || !admin.totpEnabled || !admin.totpSecret) {
      await session.clear();
      return { ok: false as const, error: "Authenticator step expired. Sign in again." };
    }

    const code = data.code.trim();
    const totpOk = verifyTotpCode(admin.totpSecret, admin.email, code);
    let usedRecovery = false;
    let usedSms = false;

    if (!totpOk) {
      const idx = await verifyRecoveryCode(code, admin.totpRecoveryHashes ?? []);
      if (idx >= 0) {
        const consumed = await consumeAdminRecoveryCode(admin.email, idx);
        if (!consumed.ok) {
          recordLoginFailure(mfaKey);
          return { ok: false as const, error: "Invalid authenticator, SMS, or recovery code." };
        }
        usedRecovery = true;
        await appendActivity({
          actorEmail: admin.email,
          action: "mfa.recovery_used",
          summary: `Used a recovery code (${consumed.remaining} left)`,
        });
      } else {
        const smsOk = await verifySmsOtp(admin.email, code);
        if (!smsOk) {
          recordLoginFailure(mfaKey);
          return { ok: false as const, error: "Invalid authenticator, SMS, or recovery code." };
        }
        usedSms = true;
        await appendActivity({
          actorEmail: admin.email,
          action: "mfa.sms_used",
          summary: "Signed in with SMS backup code",
        });
      }
    }

    clearLoginFailures(mfaKey);
    clearSmsOtp(admin.email);
    await setFullAdminSession(admin.email);
    await appendActivity({
      actorEmail: admin.email,
      action: "login",
      summary: usedSms
        ? "Signed in with SMS backup code"
        : usedRecovery
          ? "Signed in with recovery code"
          : "Signed in with authenticator",
    });
    return { ok: true as const, email: admin.email, role: "admin" as const };
  });

export const sendSmsMfaBackupFn = createServerFn({ method: "POST" })
  .inputValidator(emptyBodySchema)
  .handler(async () => {
  const session = await getAdminSession();
  const pendingEmail = readMfaPending(session.data);
  if (!pendingEmail) {
    return { ok: false as const, error: "Authenticator step expired. Sign in again." };
  }

  const mfaKey = `mfa-sms:${pendingEmail}`;
  const limited = assertLoginAllowed(mfaKey);
  if (limited) return { ok: false as const, error: limited };

  const admins = await getAdmins();
  const admin = admins.find((a) => a.email.toLowerCase() === pendingEmail);
  if (
    !admin ||
    admin.disabledAt ||
    !admin.totpEnabled ||
    !admin.totpSecret ||
    !admin.smsBackupEnabled ||
    !admin.phoneE164
  ) {
    return { ok: false as const, error: "SMS backup is not enabled for this account." };
  }
  if (!telnyxConfigured()) {
    return {
      ok: false as const,
      error: "SMS is not configured on the server (Telnyx).",
    };
  }

  const code = generateSmsOtpCode();
  const stored = await storeSmsOtp(admin.email, code);
  if (!stored.ok) return stored;

  const sent = await sendTelnyxSms({
    to: admin.phoneE164,
    text: `OrderWeb admin code: ${code}. Valid for 10 minutes. If you did not request this, ignore it.`,
  });
  if (!sent.ok) {
    clearSmsOtp(admin.email);
    return sent;
  }

  await appendActivity({
    actorEmail: admin.email,
    action: "mfa.sms_sent",
    summary: `SMS backup code sent to ${maskPhoneE164(admin.phoneE164)}`,
  });
  return {
    ok: true as const,
    phoneHint: maskPhoneE164(admin.phoneE164),
    message: `SMS code sent to ${maskPhoneE164(admin.phoneE164)}`,
  };
});

export const cancelMfaLoginFn = createServerFn({ method: "POST" })
  .inputValidator(emptyBodySchema)
  .handler(async () => {
  const session = await getAdminSession();
  const pendingEmail = readMfaPending(session.data);
  if (pendingEmail) clearSmsOtp(pendingEmail);
  await session.clear();
  return { ok: true as const };
});

export const getMfaStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const email = await requireAdminEmail();
  const status = await getAdminMfaStatus(email);
  if (!status) throw new Error("UNAUTHORIZED");
  return {
    ...status,
    phoneHint: status.phoneE164 ? maskPhoneE164(status.phoneE164) : null,
    telnyxConfigured: telnyxConfigured(),
  };
});

export const saveSmsBackupFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string().min(5),
      phone: z.string().min(8).max(20),
      enabled: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.disabledAt) {
      return { ok: false as const, error: "Account not found." };
    }
    const valid = await verifyPassword(data.password, admin.passwordHash, admin.salt);
    if (!valid) return { ok: false as const, error: "Password is incorrect." };

    const normalized = normalizePhoneE164(data.phone);
    if (!normalized.ok) return normalized;

    const updated = await updateAdminSmsBackup(admin.email, {
      phoneE164: normalized.phone,
      smsBackupEnabled: data.enabled,
    });
    if (!updated.ok) return updated;

    await appendActivity({
      actorEmail: admin.email,
      action: "mfa.sms_backup_update",
      summary: data.enabled
        ? `Enabled SMS backup for ${maskPhoneE164(normalized.phone)}`
        : `Updated SMS backup number ${maskPhoneE164(normalized.phone)} (disabled)`,
    });

    return {
      ok: true as const,
      phoneE164: updated.phoneE164,
      phoneHint: updated.phoneE164 ? maskPhoneE164(updated.phoneE164) : null,
      smsBackupEnabled: updated.smsBackupEnabled,
      telnyxConfigured: telnyxConfigured(),
    };
  });

export const disableSmsBackupFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(5) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.disabledAt) {
      return { ok: false as const, error: "Account not found." };
    }
    const valid = await verifyPassword(data.password, admin.passwordHash, admin.salt);
    if (!valid) return { ok: false as const, error: "Password is incorrect." };

    const updated = await updateAdminSmsBackup(admin.email, {
      phoneE164: admin.phoneE164 ?? null,
      smsBackupEnabled: false,
    });
    if (!updated.ok) return updated;

    await appendActivity({
      actorEmail: admin.email,
      action: "mfa.sms_backup_update",
      summary: "Disabled SMS backup MFA",
    });
    return {
      ok: true as const,
      phoneE164: updated.phoneE164,
      phoneHint: updated.phoneE164 ? maskPhoneE164(updated.phoneE164) : null,
      smsBackupEnabled: false,
    };
  });

export const startMfaEnrollFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(5) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.disabledAt) {
      return { ok: false as const, error: "Account not found." };
    }
    const valid = await verifyPassword(data.password, admin.passwordHash, admin.salt);
    if (!valid) return { ok: false as const, error: "Password is incorrect." };

    if (admin.totpEnabled && admin.totpSecret) {
      return { ok: false as const, error: "Authenticator is already enabled." };
    }

    const secret = createTotpSecret();
    const started = await beginAdminTotpEnroll(admin.email, secret);
    if (!started.ok) return started;

    const otpauthUrl = totpKeyUri(secret, admin.email);
    const qrDataUrl = await totpQrDataUrl(secret, admin.email);
    return {
      ok: true as const,
      secret,
      otpauthUrl,
      qrDataUrl,
    };
  });

export const confirmMfaEnrollFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: z.string().min(6).max(8) }))
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.disabledAt) {
      return { ok: false as const, error: "Account not found." };
    }
    const secret = admin.totpPendingSecret;
    if (!secret) {
      return { ok: false as const, error: "No enrollment in progress. Start again." };
    }
    if (!verifyTotpCode(secret, admin.email, data.code)) {
      return { ok: false as const, error: "Code is incorrect. Check the time on your phone." };
    }

    const recoveryCodes = generateRecoveryCodes(8);
    const recoveryHashes = await Promise.all(recoveryCodes.map((c) => hashRecoveryCode(c)));
    const confirmed = await confirmAdminTotpEnroll(admin.email, secret, recoveryHashes);
    if (!confirmed.ok) return confirmed;

    await appendActivity({
      actorEmail: admin.email,
      action: "mfa.enroll",
      summary: "Enabled authenticator (TOTP)",
    });
    return { ok: true as const, recoveryCodes };
  });

export const cancelMfaEnrollFn = createServerFn({ method: "POST" })
  .inputValidator(emptyBodySchema)
  .handler(async () => {
  const email = await requireAdminEmail();
  await cancelAdminTotpEnroll(email);
  return { ok: true as const };
});

export const disableMfaFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string().min(5),
      code: z.string().min(6).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || admin.disabledAt) {
      return { ok: false as const, error: "Account not found." };
    }
    const valid = await verifyPassword(data.password, admin.passwordHash, admin.salt);
    if (!valid) return { ok: false as const, error: "Password is incorrect." };

    if (!admin.totpEnabled || !admin.totpSecret) {
      return { ok: false as const, error: "Authenticator is not enabled." };
    }

    const code = data.code.trim();
    const totpOk = verifyTotpCode(admin.totpSecret, admin.email, code);
    if (!totpOk) {
      const idx = await verifyRecoveryCode(code, admin.totpRecoveryHashes ?? []);
      if (idx < 0) {
        return { ok: false as const, error: "Invalid authenticator or recovery code." };
      }
    }

    const disabled = await disableAdminTotp(admin.email);
    if (!disabled.ok) return disabled;

    await appendActivity({
      actorEmail: admin.email,
      action: "mfa.disable",
      summary: "Disabled authenticator (TOTP)",
    });
    return { ok: true as const };
  });

export const logoutAdminFn = createServerFn({ method: "POST" })
  .inputValidator(emptyBodySchema)
  .handler(async () => {
  const session = await getAdminSession();
  const email = session.data.email;
  if (email) {
    await appendActivity({
      actorEmail: email,
      action: "logout",
      summary: "Signed out",
    });
  }
  await session.clear();
  return { ok: true as const };
});

export const listUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole("admin");
  return listAdminPublic();
});

export const createUserFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => {
    const actor = await requireRole("admin");
    const strength = validateStrongPassword(data.password);
    if (strength) return { ok: false as const, error: strength };
    const { hash, salt } = await hashPassword(data.password);
    const result = await createAdminUser({
      email: data.email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      createdBy: actor.email,
    });
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: actor.email,
      action: "user.create",
      target: result.email,
      summary: `Created admin user ${result.email}`,
    });
    return result;
  });

export const disableUserFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const actor = await requireRole("admin");
    const result = await disableAdminUser(data.email.trim().toLowerCase(), actor.email);
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: actor.email,
      action: "user.disable",
      target: data.email,
      summary: `Disabled user ${data.email}`,
    });
    return result;
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      currentPassword: z.string().min(8),
      nextPassword: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => {
    const email = await requireAdminEmail();
    const result = await changeAdminPassword(
      email,
      data.currentPassword,
      data.nextPassword,
    );
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: email,
      action: "password.change",
      summary: "Changed admin password",
    });
    return { ok: true as const };
  });

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const limited = assertLoginAllowed(`reset:${email}`);
    if (limited) return { ok: false as const, error: limited };

    const { token } = await createPasswordResetToken(email);
    recordLoginFailure(`reset:${email}`); // soft rate-limit reset requests

    if (token) {
      const settings = await getSettings();
      if (!settings.emailConfigured) {
        return {
          ok: false as const,
          error: "Email is not configured. Ask an admin to set SMTP in Settings.",
        };
      }
      const siteUrl = (
        process.env["SITE_URL"] ||
        process.env["VITE_SITE_URL"] ||
        "http://localhost:8080"
      ).replace(/\/$/, "");
      const resetUrl = `${siteUrl}/owadmin/reset-password?token=${encodeURIComponent(token)}`;
      const sent = await sendSiteEmail({
        to: email,
        subject: "OrderWeb admin — reset your password",
        text: [
          "Reset your OrderWeb admin password using this link (valid for 1 hour):",
          "",
          resetUrl,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
      });
      if (!sent.ok) {
        return { ok: false as const, error: sent.error || "Could not send reset email." };
      }
      await appendActivity({
        actorEmail: email,
        action: "password.reset_request",
        summary: "Requested password reset email",
      });
    }

    return {
      ok: true as const,
      message: "If that account exists, a reset link has been sent.",
    };
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(20),
      nextPassword: z.string().min(10),
    }),
  )
  .handler(async ({ data }) => {
    const result = await resetPasswordWithToken(data.token, data.nextPassword);
    if (!result.ok) return result;
    await appendActivity({
      actorEmail: result.email,
      action: "password.reset",
      summary: "Reset password via email link",
    });
    return { ok: true as const };
  });
