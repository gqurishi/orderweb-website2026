import { useSession } from "@tanstack/react-start/server";
import type { AdminRole } from "@/lib/cms/types";

export type AdminSessionData = {
  email?: string;
  role?: AdminRole;
  /** Password OK; waiting for authenticator code (10 min). */
  mfaPendingEmail?: string;
  mfaPendingUntil?: number;
};

function sessionPassword() {
  const fromEnv = process.env["ADMIN_SESSION_SECRET"];
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("ADMIN_SESSION_SECRET (32+ chars) is required in production.");
  }
  // Dev fallback (32+ chars). Set ADMIN_SESSION_SECRET in production.
  return "orderweb-dev-session-secret-change-me-32";
}

export async function getAdminSession() {
  return useSession<AdminSessionData>({
    name: "owadmin",
    password: sessionPassword(),
    maxAge: 60 * 60 * 24 * 14,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    },
  });
}

export async function requireAdminEmail() {
  const session = await getAdminSession();
  const email = (session.data.email ?? "").trim();
  if (!email) {
    throw new Error("UNAUTHORIZED");
  }
  return email;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  const email = (session.data.email ?? "").trim();
  if (!email) {
    throw new Error("UNAUTHORIZED");
  }
  return { email, role: "admin" as AdminRole };
}

export async function requireRole(...roles: AdminRole[]) {
  const session = await requireAdminSession();
  if (!roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
