import logo from "@/assets/orderweb-logo.png";

/** Shared branded shell for /owadmin login + password reset. */
export function AdminAuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[#e8f2f9]" />
      <div className="pointer-events-none absolute -left-28 -top-20 h-[28rem] w-[28rem] rounded-full bg-[#61c3ec]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[26rem] w-[26rem] rounded-full bg-[#0a1a4a]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.85),transparent_55%)]" />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="OrderWeb"
            className="h-[4.5rem] w-auto object-contain drop-shadow-[0_16px_28px_rgba(47,111,184,0.28)] sm:h-[5.25rem]"
          />
          <p className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-tight text-[#0a1a4a] sm:text-[2.35rem]">
            OrderWeb
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2f6fb8]">
            Admin console
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-white/80 bg-white/90 p-6 shadow-[0_28px_60px_-36px_rgba(10,26,74,0.55)] backdrop-blur-sm sm:p-8">
          <h1 className="font-[family-name:var(--font-display)] text-[1.85rem] leading-tight text-[#0a1a4a]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5b6b7c]">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-5 text-center text-xs text-[#5b6b7c]">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export const adminAuthInputClass =
  "mt-1.5 w-full rounded-xl border border-[#61c3ec]/35 bg-[#f8fbfe] px-3.5 py-2.5 text-sm text-[#0a1a4a] outline-none transition placeholder:text-[#9aabbc] focus:border-[#2f6fb8] focus:bg-white focus:ring-4 focus:ring-[#61c3ec]/20";
