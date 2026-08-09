import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

const ISSUER = "OrderWeb Admin";

export function createTotpSecret() {
  return new Secret({ size: 20 }).base32;
}

function makeTotp(secretBase32: string, email: string) {
  return new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function totpKeyUri(secretBase32: string, email: string) {
  return makeTotp(secretBase32, email).toString();
}

export function verifyTotpCode(secretBase32: string, email: string, code: string) {
  const token = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(token)) return false;
  const delta = makeTotp(secretBase32, email).validate({ token, window: 1 });
  return delta !== null;
}

export async function totpQrDataUrl(secretBase32: string, email: string) {
  const uri = totpKeyUri(secretBase32, email);
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: { dark: "#0a1a4a", light: "#ffffff" },
  });
}

/** One-time backup codes shown once at enroll. */
export function generateRecoveryCodes(count = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let raw = "";
    for (const b of bytes) raw += alphabet[b % alphabet.length];
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

export async function hashRecoveryCode(code: string) {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyRecoveryCode(code: string, hashes: string[]) {
  const hash = await hashRecoveryCode(code);
  const idx = hashes.findIndex((h) => h === hash);
  return idx >= 0 ? idx : -1;
}
