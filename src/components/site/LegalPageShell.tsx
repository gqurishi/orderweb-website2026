import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-hidden pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.3em]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[2.15rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#243447] sm:text-lg">{intro}</p>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>

        <div className="legal-prose mt-10 space-y-8 text-[15px] leading-relaxed text-[#243447] sm:mt-12 sm:text-base">
          {children}
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          Questions?{" "}
          <Link
            to="/contact"
            search={{}}
            className="font-medium text-primary transition-colors hover:text-[#1d4f8c]"
          >
            Contact us
          </Link>{" "}
          or email{" "}
          <a
            href="mailto:mail@orderweb.co.uk"
            className="font-medium text-primary transition-colors hover:text-[#1d4f8c]"
          >
            mail@orderweb.co.uk
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl text-[#0a1a4a] sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
