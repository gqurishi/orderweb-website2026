/** Cookie / PECR consent for the OrderWeb corporate website. */

export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_STORAGE_KEY = "ow_cookie_consent_v1";
export const COOKIE_SETTINGS_EVENT = "ow:open-cookie-settings";

export type CookieConsentChoice = {
  /** Bump COOKIE_CONSENT_VERSION when a material policy change needs fresh consent. */
  version: number;
  decidedAt: string;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentCategories = {
  analytics: boolean;
  marketing: boolean;
};

const listeners = new Set<() => void>();
let cachedSnapshot: CookieConsentChoice | null | undefined;
let cachedRaw: string | null | undefined;

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isValidChoice(value: unknown): value is CookieConsentChoice {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.decidedAt === "string" &&
    typeof v.analytics === "boolean" &&
    typeof v.marketing === "boolean"
  );
}

function loadConsent(): CookieConsentChoice | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === cachedRaw && cachedSnapshot !== undefined) {
      return cachedSnapshot;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = null;
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidChoice(parsed) || parsed.version !== COOKIE_CONSENT_VERSION) {
      cachedSnapshot = null;
      return null;
    }
    cachedSnapshot = parsed;
    return parsed;
  } catch {
    cachedRaw = undefined;
    cachedSnapshot = null;
    return null;
  }
}

export function readCookieConsent(): CookieConsentChoice | null {
  return loadConsent();
}

export function writeCookieConsent(categories: CookieConsentCategories): CookieConsentChoice {
  const choice: CookieConsentChoice = {
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    analytics: Boolean(categories.analytics),
    marketing: Boolean(categories.marketing),
  };
  if (isBrowser()) {
    const raw = JSON.stringify(choice);
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSnapshot = choice;
    // Strictly necessary preference cookie (short machine-readable flag).
    const maxAge = 60 * 60 * 24 * 365; // 12 months
    document.cookie = `ow_cookie_consent=${choice.version}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
  notifyCookieConsentListeners();
  return choice;
}

export function acceptAllCookieConsent() {
  return writeCookieConsent({ analytics: true, marketing: true });
}

export function rejectNonEssentialCookieConsent() {
  return writeCookieConsent({ analytics: false, marketing: false });
}

export function subscribeCookieConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyCookieConsentListeners() {
  for (const listener of listeners) listener();
  if (isBrowser()) {
    window.dispatchEvent(new Event("ow:cookie-consent-changed"));
  }
}

export function openCookieSettings() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

/** Snapshot for useSyncExternalStore. */
export function getCookieConsentSnapshot(): CookieConsentChoice | null {
  return loadConsent();
}

export function getCookieConsentServerSnapshot(): CookieConsentChoice | null {
  return null;
}
