/** Short-lived SMS OTP codes for MFA backup (in-memory, hashed). */

type SmsOtpBucket = {
  hash: string;
  expiresAt: number;
  sentAt: number;
};

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const buckets = new Map<string, SmsOtpBucket>();

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashOtp(code: string) {
  const data = new TextEncoder().encode(code.trim());
  return bytesToHex(await crypto.subtle.digest("SHA-256", data));
}

export function normalizePhoneE164(raw: string): { ok: true; phone: string } | { ok: false; error: string } {
  let phone = raw.trim().replace(/[\s()-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  // UK local mobile → E.164
  if (/^07\d{9}$/.test(phone)) phone = `+44${phone.slice(1)}`;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return {
      ok: false,
      error: "Enter a valid mobile number with country code (e.g. +447700900123).",
    };
  }
  return { ok: true, phone };
}

export function maskPhoneE164(phone: string) {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}••••${phone.slice(-4)}`;
}

export function generateSmsOtpCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000;
  return String(n).padStart(6, "0");
}

export async function storeSmsOtp(email: string, code: string) {
  const key = email.trim().toLowerCase();
  const existing = buckets.get(key);
  const now = Date.now();
  if (existing && now - existing.sentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.sentAt)) / 1000);
    return { ok: false as const, error: `Wait ${wait}s before requesting another SMS code.` };
  }
  buckets.set(key, {
    hash: await hashOtp(code),
    expiresAt: now + OTP_TTL_MS,
    sentAt: now,
  });
  return { ok: true as const };
}

export async function verifySmsOtp(email: string, code: string) {
  const key = email.trim().toLowerCase();
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (Date.now() > bucket.expiresAt) {
    buckets.delete(key);
    return false;
  }
  const hash = await hashOtp(code);
  if (hash !== bucket.hash) return false;
  buckets.delete(key);
  return true;
}

export function clearSmsOtp(email: string) {
  buckets.delete(email.trim().toLowerCase());
}
