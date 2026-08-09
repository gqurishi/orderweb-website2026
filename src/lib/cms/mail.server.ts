import nodemailer from "nodemailer";
import { getSettings, getSmtpSecrets } from "./store.server";

export type SiteMailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Override from; defaults to settings / env. */
  from?: string;
};

function parseFrom(from: string): { name?: string; address: string } | string {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) {
    const name = m[1]?.trim();
    const address = m[2]?.trim() ?? "";
    return name ? { name, address } : address;
  }
  return from.trim();
}

function extractEmailAddress(from: string): string {
  const parsed = parseFrom(from);
  if (typeof parsed === "string") return parsed.trim().toLowerCase();
  return parsed.address.trim().toLowerCase();
}

function extractDisplayName(from: string): string | undefined {
  const parsed = parseFrom(from);
  if (typeof parsed === "string") return undefined;
  return parsed.name;
}

/**
 * Hostinger / most mailbox SMTP providers require From to match the authenticated mailbox.
 * If a stale Resend/onboarding address is still configured, fall back to the SMTP username.
 */
function resolveSmtpFrom(from: string, smtpUser: string): string {
  const fromAddress = extractEmailAddress(from);
  const authUser = smtpUser.trim().toLowerCase();
  if (!fromAddress) {
    return smtpUser.includes("@")
      ? `OrderWeb Website <${smtpUser.trim()}>`
      : "OrderWeb Website <mail@orderweb.co.uk>";
  }
  if (authUser.includes("@") && fromAddress !== authUser) {
    const name = extractDisplayName(from) || "OrderWeb Website";
    return `${name} <${smtpUser.trim()}>`;
  }
  return from.trim();
}

/** Sends site email via SMTP (contact form, test email, password reset). */
export async function sendSiteEmail(
  payload: SiteMailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const settings = await getSettings();
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];
  // Prefer Admin settings over env so the panel is the source of truth.
  const configuredFrom =
    payload.from ||
    settings.contactFromEmail ||
    process.env["CONTACT_FROM_EMAIL"] ||
    "OrderWeb Website <mail@orderweb.co.uk>";

  const secrets = await getSmtpSecrets();
  const host = secrets.host;
  const user = secrets.user;
  const pass = secrets.password;
  const port = secrets.port;
  const secure = secrets.secure || port === 465;
  const from = resolveSmtpFrom(configuredFrom, user);

  if (!host || !user || !pass) {
    return {
      ok: false,
      error:
        "SMTP is not fully configured. Add host, username, and password in Admin → Settings.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: parseFrom(from),
      to,
      subject: payload.subject,
      text: payload.text,
      ...(payload.html ? { html: payload.html } : {}),
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMTP send failed.";
    return { ok: false, error: message };
  }
}

export function inboxAddress(settings: { contactToEmail: string }) {
  // Admin Settings inbox wins; env is bootstrap fallback only.
  const fromSettings = (settings.contactToEmail || "").trim();
  if (fromSettings) return fromSettings;
  return (process.env["CONTACT_TO_EMAIL"] || "").trim();
}
