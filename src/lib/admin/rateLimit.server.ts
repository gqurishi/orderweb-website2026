type Bucket = { count: number; resetAt: number };

const loginFailures = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

export function assertLoginAllowed(key: string): string | null {
  const now = Date.now();
  const bucket = loginFailures.get(key.toLowerCase());
  if (!bucket) return null;
  if (now > bucket.resetAt) {
    loginFailures.delete(key.toLowerCase());
    return null;
  }
  if (bucket.count >= MAX_FAILURES) {
    const mins = Math.ceil((bucket.resetAt - now) / 60000);
    return `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`;
  }
  return null;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const id = key.toLowerCase();
  const bucket = loginFailures.get(id);
  if (!bucket || now > bucket.resetAt) {
    loginFailures.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearLoginFailures(key: string) {
  loginFailures.delete(key.toLowerCase());
}
