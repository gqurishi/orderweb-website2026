import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role).
 * - Uses SUPABASE_SERVICE_ROLE_KEY (never VITE_)
 * - Bypasses RLS for trusted CMS server functions
 */

function readServerEnv(name: string): string | undefined {
  // Prefer process.env (Node server / Docker). Avoid import.meta.env for secrets.
  const fromProcess =
    typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  return fromProcess || undefined;
}

export function supabaseServerConfigured(): boolean {
  const url = readServerEnv("SUPABASE_URL") || readServerEnv("VITE_SUPABASE_URL");
  const serviceKey = readServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  return Boolean(url && serviceKey);
}

export function assertNoServiceRoleLeak() {
  const leaked =
    readServerEnv("VITE_SUPABASE_SERVICE_ROLE_KEY") ||
    (typeof import.meta !== "undefined"
      ? (import.meta.env?.["VITE_SUPABASE_SERVICE_ROLE_KEY"] as string | undefined)
      : undefined);
  if (leaked?.trim()) {
    throw new Error(
      "Refusing to start: SUPABASE service role must not be set under VITE_. " +
        "Use SUPABASE_SERVICE_ROLE_KEY on the server only.",
    );
  }
}

let cached: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  assertNoServiceRoleLeak();

  if (cached) return cached;

  const url = readServerEnv("SUPABASE_URL") || readServerEnv("VITE_SUPABASE_URL");
  const serviceKey = readServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase service client not configured. Set SUPABASE_URL (or VITE_SUPABASE_URL) " +
        "and SUPABASE_SERVICE_ROLE_KEY on the server.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
