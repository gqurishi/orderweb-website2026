/**
 * OrderWeb Admin CMS — Phase 0 locked decisions.
 * Change only when the product owner explicitly revises the plan.
 */

export const ADMIN_DECISIONS = {
  phase: "5-supabase-rls",
  adminUrl: "/owadmin",
  hideFromPublicNav: true,
  saveBehaviour: "draft-publish" as const,
  scope: {
    canEdit: [
      "words",
      "images",
      "links",
      "prices",
      "contactEmailSettings",
      "seo",
      "analytics",
    ] as const,
    cannotEdit: ["layout", "fonts", "animations", "code"] as const,
    skippedPhase4: [
      "multi-language",
      "blog",
      "schedule-publish",
      "duplicate-section",
    ] as const,
  },
  stack: {
    website: "TanStack Start (current repo)",
    /** Live driver today remains local JSON until Supabase keys + schema cutover. */
    database: "Supabase schema/RLS ready; runtime driver: .data/cms-db.json",
    images: "Local /cms-uploads (+ Cloudinary optional)",
    email: "SMTP",
  },
  contactInbox: "mail@orderweb.co.uk",
  /** Active admin-panel seats (all full admin). Disabled users do not count. */
  maxAdminUsers: 2,
  phase1Pages: ["home", "about", "pricing", "contact"] as const,
  phase2Pages: ["restaurant-pos", "website", "software"] as const,
  laterPages: [] as const,
} as const;

export type AdminEnvStatus = {
  key: string;
  label: string;
  ready: boolean;
  help: string;
};

/** Client-safe readiness: only public/prefixed flags. Secrets stay server-side. */
export function getClientSetupStatus(): AdminEnvStatus[] {
  const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const supabaseAnon = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  const cloudName = import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] as string | undefined;
  const adminEmail = import.meta.env["VITE_ADMIN_EMAIL"] as string | undefined;

  return [
    {
      key: "adminEmail",
      label: "Admin login email",
      ready: Boolean(adminEmail?.includes("@")),
      help: "Set VITE_ADMIN_EMAIL in .env (your login email).",
    },
    {
      key: "supabase",
      label: "Supabase public keys",
      ready: Boolean(supabaseUrl && supabaseAnon),
      help:
        "Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY. Put SUPABASE_SERVICE_ROLE_KEY on the server only (never VITE_). Run supabase/schema.sql + rls_policy_tests.sql before cutover.",
    },
    {
      key: "cloudinary",
      label: "Cloudinary images",
      ready: Boolean(cloudName),
      help: "Create a Cloudinary account, then set VITE_CLOUDINARY_CLOUD_NAME (API secrets stay server-only).",
    },
    {
      key: "smtp",
      label: "SMTP email (admin Settings)",
      ready: false,
      help: "Configure SMTP host, user, and password in Admin → Settings (or SMTP_* in .env).",
    },
  ];
}
