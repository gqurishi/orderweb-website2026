import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import { listActivityFn } from "@/lib/cms/cms.functions";
import type { AdminRole } from "@/lib/cms/types";

export const Route = createFileRoute("/owadmin/activity")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    const activity = await listActivityFn();
    return {
      email: session.email,
      role: (session.role ?? "admin") as AdminRole,
      activity,
    };
  },
  component: ActivityPage,
});

function ActivityPage() {
  const { email, role, activity } = Route.useLoaderData();

  return (
    <AdminShell email={email} role={role}>
      <h1 className="text-3xl text-[#0a1a4a]">Activity</h1>
      <p className="mt-2 text-sm text-[#243447]">Who changed what, and when.</p>

      <ul className="mt-6 space-y-2">
        {activity.length === 0 ? (
          <li className="rounded-xl bg-white px-4 py-3 text-sm text-[#5b6b7c] ring-1 ring-[#61c3ec]/25">
            No activity yet.
          </li>
        ) : (
          activity.map((row) => (
            <li
              key={row.id}
              className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-[#61c3ec]/25"
            >
              <p className="font-medium text-[#0a1a4a]">{row.summary}</p>
              <p className="mt-1 text-xs text-[#5b6b7c]">
                {row.actorEmail} · {row.action}
                {row.target ? ` · ${row.target}` : ""} ·{" "}
                {new Date(row.at).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </AdminShell>
  );
}
