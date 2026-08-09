import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminAuthShell,
  adminAuthInputClass,
} from "@/components/admin/AdminAuthShell";
import { resetPasswordFn } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/owadmin/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const reset = useServerFn(resetPasswordFn);
  const [nextPassword, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <AdminAuthShell
      title={done ? "Password updated" : "Reset password"}
      subtitle={
        done
          ? "You can sign in with your new password."
          : "Choose a new password (min 10 characters, letter + number)."
      }
      footer={
        <Link
          to="/owadmin"
          className="font-medium text-[#2f6fb8] transition hover:text-[#0a1a4a]"
        >
          Back to login
        </Link>
      }
    >
      {done ? (
        <Link
          to="/owadmin"
          className="btn-brand-gradient flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(47,111,184,0.85)]"
        >
          Sign in
        </Link>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!token) {
              toast.error("Missing reset token. Use the link from your email.");
              return;
            }
            if (nextPassword !== confirm) {
              toast.error("Passwords do not match");
              return;
            }
            setBusy(true);
            try {
              const res = await reset({ data: { token, nextPassword } });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setDone(true);
              toast.success("Password reset — you can sign in now");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm font-medium text-[#0a1a4a]">
            New password
            <input
              type="password"
              required
              minLength={10}
              value={nextPassword}
              onChange={(e) => setNext(e.target.value)}
              className={adminAuthInputClass}
            />
          </label>
          <label className="block text-sm font-medium text-[#0a1a4a]">
            Confirm password
            <input
              type="password"
              required
              minLength={10}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={adminAuthInputClass}
            />
          </label>
          <button
            type="submit"
            disabled={busy || !token}
            className="btn-brand-gradient mt-2 h-12 w-full rounded-full text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(47,111,184,0.85)] transition disabled:opacity-60"
          >
            {busy ? "Saving…" : "Set new password"}
          </button>
        </form>
      )}
    </AdminAuthShell>
  );
}
