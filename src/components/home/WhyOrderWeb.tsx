import { useEffect, useRef, type CSSProperties } from "react";
import { Boxes, Handshake, MapPin, ShieldCheck } from "lucide-react";
import whyVisual from "@/assets/why-orderweb-visual.jpg";
import type { HomeContent } from "@/lib/cms/types";

const WHY_ICONS = [ShieldCheck, Boxes, MapPin, Handshake];
const WHY_FALLBACK = [
  {
    title: "Commission-free",
    body: "Flat pricing. We never take a cut of your orders.",
  },
  {
    title: "You own it",
    body: "Your data, your customers, your brand — exportable any time.",
  },
  {
    title: "UK support",
    body: "Real humans, UK hours, on-site setup where you need it.",
  },
  {
    title: "End-to-end",
    body: "One team for the POS, the integrations and the custom builds.",
  },
];

const ORBIT_SPARKS = [
  { top: "8%", left: "22%", delay: "0s", size: "size-2.5" },
  { top: "14%", left: "78%", delay: "0.4s", size: "size-2" },
  { top: "48%", left: "6%", delay: "0.8s", size: "size-1.5" },
  { top: "52%", left: "92%", delay: "1.1s", size: "size-2" },
  { top: "82%", left: "28%", delay: "1.5s", size: "size-2.5" },
  { top: "78%", left: "72%", delay: "1.9s", size: "size-1.5" },
];

/** Stage 2 — expands out of the laptop after fade-to-clear. */
export function WhyOrderWeb({
  content,
}: {
  content?: HomeContent["why"] | undefined;
}) {
  const visualRef = useRef<HTMLDivElement>(null);
  const points = (content?.points?.length ? content.points : WHY_FALLBACK.map((w) => w.title)).map(
    (title, i) => ({
      icon: WHY_ICONS[i % WHY_ICONS.length]!,
      title,
      body: content?.pointBodies?.[i] || WHY_FALLBACK[i]?.body || "",
    }),
  );
  const visualSrc = content?.image || whyVisual;
  const eyebrow = content?.eyebrow || "Why OrderWeb";
  const headline = content?.headline || "Why operators move to OrderWeb";

  useEffect(() => {
    const el = visualRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--why-tilt-x", `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty("--why-tilt-y", `${(x * 8).toFixed(2)}deg`);
      el.style.setProperty("--why-shift-x", `${(x * 10).toFixed(2)}px`);
      el.style.setProperty("--why-shift-y", `${(y * 8).toFixed(2)}px`);
    };

    const onLeave = () => {
      el.style.setProperty("--why-tilt-x", "0deg");
      el.style.setProperty("--why-tilt-y", "0deg");
      el.style.setProperty("--why-shift-x", "0px");
      el.style.setProperty("--why-shift-y", "0px");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="flex min-h-full w-full items-start bg-background px-4 py-8 sm:items-center sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-7 sm:gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Visual first on mobile so Stage 2 reads quickly in the short viewport */}
        <div
          ref={visualRef}
          className="hero-stage2-item why-visual-stage relative order-first mx-auto aspect-[1024/585] w-full max-w-[20rem] sm:max-w-md lg:order-last lg:max-w-none"
          style={
            {
              "--why-tilt-x": "0deg",
              "--why-tilt-y": "0deg",
              "--why-shift-x": "0px",
              "--why-shift-y": "0px",
            } as CSSProperties
          }
        >
          <div
            aria-hidden
            className="why-visual-glow pointer-events-none absolute left-1/2 top-1/2 size-[82%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(97,195,236,0.34) 0%, rgba(47,111,184,0.14) 42%, transparent 72%)",
            }}
          />

          <div
            aria-hidden
            className="why-orbit-ring pointer-events-none absolute left-1/2 top-[52%] hidden h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-primary/25 sm:block"
          />
          <div
            aria-hidden
            className="why-orbit-ring-slow pointer-events-none absolute left-1/2 top-[52%] hidden h-[58%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dotted border-[#61c3ec]/30 sm:block"
          />

          {ORBIT_SPARKS.map((spark, i) => (
            <span
              key={i}
              aria-hidden
              className={`why-orbit-spark pointer-events-none absolute hidden rounded-full bg-[#61c3ec] shadow-[0_0_12px_rgba(97,195,236,0.75)] sm:block ${spark.size}`}
              style={{
                top: spark.top,
                left: spark.left,
                animationDelay: spark.delay,
              }}
            />
          ))}

          <div className="why-visual-parallax absolute inset-0">
            <img
              src={visualSrc}
              alt="OrderWeb platform on laptop and phone, surrounded by security, data, support and partnership icons"
              width={1024}
              height={585}
              className="animate-why-visual relative h-full w-full object-contain"
              decoding="async"
            />
            <span
              aria-hidden
              className="why-visual-shine pointer-events-none absolute inset-0 hidden sm:block"
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="hero-stage2-item text-[11px] uppercase tracking-[0.28em] text-primary sm:text-xs sm:tracking-[0.35em]">
            {eyebrow}
          </p>
          <h2 className="hero-stage2-item mt-2 max-w-lg text-[1.85rem] leading-[1.12] sm:mt-3 sm:text-5xl">
            {headline}
          </h2>

          <div className="mt-6 grid gap-x-8 gap-y-5 sm:mt-10 sm:grid-cols-2 sm:gap-y-8">
            {points.map((w, i) => (
              <div
                key={`${w.title}-${i}`}
                className="hero-stage2-item group flex gap-3 border-t border-border pt-4 sm:gap-3.5 sm:pt-5"
              >
                <span
                  className="feature-icon-gradient animate-icon-float mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 group-hover:[animation-play-state:paused] sm:size-9"
                  style={{
                    backgroundImage:
                      "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)",
                    animationDelay: `${i * 0.35}s`,
                  }}
                >
                  <w.icon className="size-3.5 sm:size-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                  <h3 className="text-base text-foreground transition-colors duration-300 group-hover:text-primary sm:text-xl">
                    {w.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
