import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/orderweb-logo.png";
import { logoutAdminFn } from "@/lib/admin/auth.functions";
import { PAGE_META, type AdminRole, type PageKey } from "@/lib/cms/types";

const pageKeys = Object.keys(PAGE_META) as PageKey[];

export function AdminShell({
  email,
  role = "admin",
  children,
}: {
  email: string;
  role?: AdminRole | null;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useServerFn(logoutAdminFn);

  return (
    <div className="min-h-screen bg-[#eef4f9] text-[#0a1a4a]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <aside className="border-b border-[#61c3ec]/25 bg-white lg:w-64 lg:border-b-0 lg:border-r">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="OrderWeb"
                className="h-10 w-10 object-contain"
              />
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-xl leading-none text-[#0a1a4a]">
                  OrderWeb
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
                  Admin
                </p>
              </div>
            </div>
            <p className="mt-3 truncate text-xs text-[#5b6b7c]">{email}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#2f6fb8]">
              {role ?? "admin"}
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
            <AdminNavLink to="/owadmin" active={pathname === "/owadmin"}>
              Dashboard
            </AdminNavLink>
            {pageKeys.map((key) => (
              <AdminNavLink
                key={key}
                to={`/owadmin/pages/${key}`}
                active={pathname === `/owadmin/pages/${key}`}
              >
                {PAGE_META[key].title}
              </AdminNavLink>
            ))}
            <AdminNavLink to="/owadmin/media" active={pathname.startsWith("/owadmin/media")}>
              Media
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/social"
              active={pathname.startsWith("/owadmin/social")}
            >
              Social Media
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/badges"
              active={pathname.startsWith("/owadmin/badges")}
            >
              Trust Badges
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/activity"
              active={pathname.startsWith("/owadmin/activity")}
            >
              Activity
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/backups"
              active={pathname.startsWith("/owadmin/backups")}
            >
              Backups
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/account"
              active={pathname.startsWith("/owadmin/account")}
            >
              Account
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/users"
              active={pathname.startsWith("/owadmin/users")}
            >
              Users
            </AdminNavLink>
            <AdminNavLink
              to="/owadmin/settings"
              active={pathname.startsWith("/owadmin/settings")}
            >
              Settings
            </AdminNavLink>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-[#243447] hover:bg-[#f3f9fc]"
            >
              View website ↗
            </a>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-left text-sm text-[#243447] hover:bg-[#f3f9fc]"
              onClick={async () => {
                await logout();
                window.location.href = "/owadmin";
              }}
            >
              Logout
            </button>
          </nav>
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={to}
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
        active ? "bg-[#2f6fb8] text-white" : "text-[#243447] hover:bg-[#f3f9fc]"
      }`}
    >
      {children}
    </a>
  );
}
