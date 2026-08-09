import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client.
 * Only VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (public).
 * Never import supabase.server.ts from client components.
 */

let cached: SupabaseClient | null = null;

export function supabaseBrowserConfigured(): boolean {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const anon = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  return Boolean(url?.trim() && anon?.trim());
}

export function getSupabaseAnonClient(): SupabaseClient {
  if (cached) return cached;

  const url = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)?.trim();
  const anon = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined)?.trim();

  if (!url || !anon) {
    throw new Error("Supabase anon client not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  // Hard guard: refuse if a service-role-shaped key was mistakenly put in anon slot
  if (anon.includes("service_role")) {
    throw new Error("VITE_SUPABASE_ANON_KEY looks like a service role key. Use the anon public key only.");
  }

  cached = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
