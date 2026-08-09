import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionCard, TextField } from "@/components/admin/Field";
import { ADMIN_DECISIONS } from "@/lib/admin/decisions";
import {
  createUserFn,
  disableUserFn,
  getAdminSessionFn,
  listUsersFn,
} from "@/lib/admin/auth.functions";
import type { AdminRole } from "@/lib/cms/types";

const MAX_USERS = ADMIN_DECISIONS.maxAdminUsers;

export const Route = createFileRoute("/owadmin/users")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    if (session.role !== "admin") throw redirect({ to: "/owadmin" });
    const users = await listUsersFn();
    return {
      email: session.email,
      role: "admin" as AdminRole,
      users,
    };
  },
  component: UsersPage,
});

function UsersPage() {
  const { email, role, users: initial } = Route.useLoaderData();
  const createUser = useServerFn(createUserFn);
  const disableUser = useServerFn(disableUserFn);
  const [users, setUsers] = useState(initial);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const activeCount = users.filter((u) => !u.disabledAt).length;
  const atLimit = activeCount >= MAX_USERS;
  const seatsLeft = Math.max(0, MAX_USERS - activeCount);

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Users</h1>
      <p className="mt-2 text-sm text-[#243447]">
        Both seats are full Admin — same access to pages, media, users, and settings. Maximum{" "}
        {MAX_USERS} active users.
      </p>

      <div className="mt-4 inline-flex rounded-full bg-[#f3f9fc] px-3 py-1.5 text-xs font-semibold text-[#0a1a4a] ring-1 ring-[#61c3ec]/25">
        {activeCount} of {MAX_USERS} seats used
        {seatsLeft > 0 ? ` · ${seatsLeft} left` : " · full"}
      </div>

      <div className="mt-6 max-w-xl space-y-4">
        <SectionCard title="Add admin">
          {atLimit ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Seat limit reached ({MAX_USERS}). Disable an existing user first if you need to add
              someone else.
            </p>
          ) : (
            <>
              <TextField label="Email" value={newEmail} onChange={setNewEmail} />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                hint="Min 10 characters, include a letter and a number."
              />
              <p className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c]">
                New accounts are created as <strong className="text-[#0a1a4a]">Admin</strong> with
                full access.
              </p>
              <button
                type="button"
                disabled={busy}
                className="btn-brand-gradient h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-60"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await createUser({
                      data: { email: newEmail, password },
                    });
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    setUsers((u) => [
                      {
                        email: res.email!,
                        role: "admin",
                        createdAt: new Date().toISOString(),
                        disabledAt: null,
                        totpEnabled: false,
                      },
                      ...u,
                    ]);
                    setNewEmail("");
                    setPassword("");
                    toast.success("Admin created");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Creating…" : "Create admin"}
              </button>
            </>
          )}
        </SectionCard>

        <SectionCard title="Team">
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.email}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#61c3ec]/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#0a1a4a]">{user.email}</p>
                  <p className="text-xs text-[#5b6b7c]">
                    admin
                    {user.totpEnabled ? " · authenticator on" : ""}
                    {user.disabledAt ? " · disabled" : ""}
                  </p>
                </div>
                {!user.disabledAt && user.email !== email ? (
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                    onClick={async () => {
                      if (!confirm(`Disable ${user.email}?`)) return;
                      const res = await disableUser({ data: { email: user.email } });
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setUsers((list) =>
                        list.map((u) =>
                          u.email === user.email
                            ? { ...u, disabledAt: new Date().toISOString() }
                            : u,
                        ),
                      );
                      toast.success("User disabled");
                    }}
                  >
                    Disable
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
