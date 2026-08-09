import { Link } from "@tanstack/react-router";
import { Globe2, Smartphone, Store } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const SERVICES = [
  {
    icon: Store,
    title: "Restaurant POS",
    body: "Counter POS, online shop, bookings, loyalty and delivery — commission free.",
    to: "/restaurant-pos" as const,
    tag: "Flagship product",
  },
  {
    icon: Globe2,
    title: "Website",
    body: "Fast, search-ready marketing sites designed and built around your brand.",
    to: "/website" as const,
    tag: "Design + build",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    body: "Native iOS and Android apps in Swift and Kotlin, shipped and maintained.",
    to: "/software" as const,
    tag: "Software",
  },
];

/** The three services — shown after Why OrderWeb. */
export function ServicesSection({
  eyebrow,
  headline,
}: {
  eyebrow?: string;
  headline?: string;
}) {
  return (
    <section className="border-t border-border bg-background py-16 sm:py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary sm:text-sm sm:tracking-[0.35em]">
              {eyebrow || "What we build"}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-[1.85rem] leading-tight sm:mt-5 sm:text-5xl md:text-6xl">
              {headline || "One software company for all your custom apps and platform needs"}
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 110}>
              <Link
                to={s.to}
                className="surface-panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-500 ease-out active:scale-[0.99] hover:-translate-y-2.5 hover:border-primary/35 hover:bg-primary/[0.06] hover:shadow-[var(--shadow-glow)] sm:p-7"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[linear-gradient(90deg,#abeafd,#2f6fb8,#0a1a4a)] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-0 transition-all duration-500 ease-out group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in oklab, var(--primary-glow) 45%, transparent) 0%, transparent 70%)",
                  }}
                />

                <span
                  className="feature-icon-gradient animate-icon-float relative flex size-11 items-center justify-center rounded-full text-white transition-transform duration-500 ease-out group-hover:scale-[1.15] group-hover:rotate-6 group-hover:[animation-play-state:paused] sm:size-12"
                  style={{
                    backgroundImage:
                      "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)",
                    animationDelay: `${i * 0.28}s`,
                  }}
                >
                  <s.icon className="size-5 drop-shadow-sm" strokeWidth={2.25} />
                </span>
                <p className="relative mt-5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:mt-6">
                  {s.tag}
                </p>
                <h3 className="relative mt-2 text-xl transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80 sm:mt-3 sm:text-base">
                  {s.body}
                </p>
                <span className="relative mt-auto pt-5 text-sm font-medium text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#1d4f8c] sm:pt-6">
                  Learn more →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
