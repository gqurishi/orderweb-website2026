import { useEffect, useRef, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

const BRAND_GRADIENT =
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)";

type Step = {
  step?: string;
  title: string;
  body: string;
  icon: ComponentType<LucideProps>;
};

/**
 * Compact zigzag journey map — path draws in, stops light up, then cycles.
 */
export function WebsiteJourney({ steps }: { steps: Step[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let cycle: number | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = rootRef.current;
      const fill = root.querySelector<HTMLElement>(".journey-rail-fill");
      const traveler = root.querySelector<HTMLElement>(".journey-rail-dot");
      const cards = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".journey-card"));
      const stops = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".journey-stop"));

      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set([cards, stops], { opacity: 1, x: 0, scale: 1 });
          if (fill) gsap.set(fill, { scaleY: 1 });
          if (traveler) gsap.set(traveler, { top: "100%", opacity: 1 });
          setReady(true);
          setActive(steps.length - 1);
          return;
        }

        cards.forEach((card, i) => {
          const fromLeft = i % 2 === 0;
          gsap.set(card, { opacity: 0, x: fromLeft ? -28 : 28 });
        });
        gsap.set(stops, { scale: 0.5, opacity: 0.3 });
        if (fill) gsap.set(fill, { scaleY: 0, transformOrigin: "top center" });
        if (traveler) gsap.set(traveler, { top: "0%", opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 78%",
            once: true,
          },
          onComplete: () => {
            setReady(true);
            let i = 0;
            setActive(0);
            cycle = window.setInterval(() => {
              i = (i + 1) % steps.length;
              setActive(i);
            }, 1700);
          },
        });

        if (fill) {
          tl.to(fill, { scaleY: 1, duration: 1.2, ease: "power2.inOut" }, 0);
        }
        if (traveler) {
          tl.to(traveler, { opacity: 1, duration: 0.15 }, 0).to(
            traveler,
            { top: "100%", duration: 1.2, ease: "power2.inOut" },
            0,
          );
        }

        cards.forEach((card, i) => {
          const at = 0.1 + i * 0.2;
          tl.to(card, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, at).to(
            stops[i],
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" },
            at,
          );
        });
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
      if (cycle) window.clearInterval(cycle);
    };
  }, [steps.length]);

  return (
    <div ref={rootRef} className="relative mt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-5 left-4 top-5 w-[2px] md:left-1/2 md:-translate-x-1/2"
      >
        <div className="absolute inset-0 rounded-full bg-[#abeafd]/35" />
        <div
          className="journey-rail-fill absolute inset-0 origin-top rounded-full"
          style={{ backgroundImage: BRAND_GRADIENT }}
        />
        <span
          className="journey-rail-dot absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#61c3ec] opacity-0"
          style={{ boxShadow: "0 0 12px rgba(97,195,236,0.9)" }}
        />
      </div>

      <div className="relative space-y-4 md:space-y-5">
        {steps.map((s, i) => {
          const left = i % 2 === 0;
          const isActive = ready && active === i;

          return (
            <div
              key={s.title}
              className="relative flex items-center gap-3 md:grid md:grid-cols-[1fr_2.75rem_1fr] md:gap-4"
            >
              <span
                className={`journey-stop feature-icon-gradient z-[1] flex size-9 shrink-0 items-center justify-center rounded-full text-white md:col-start-2 md:row-start-1 md:justify-self-center ${
                  isActive ? "animate-process-ring" : ""
                }`}
                style={{
                  backgroundImage: BRAND_GRADIENT,
                  boxShadow: isActive
                    ? "0 0 0 6px rgba(97,195,236,0.2)"
                    : "0 8px 18px -8px rgba(10,26,74,0.4)",
                }}
              >
                <s.icon className="size-3.5" strokeWidth={2.25} />
              </span>

              <article
                className={`journey-card min-w-0 flex-1 rounded-xl border bg-white/90 px-3.5 py-3 shadow-[0_14px_32px_-24px_rgba(47,111,184,0.45)] backdrop-blur-sm transition-all duration-500 md:row-start-1 ${
                  left ? "md:col-start-1 md:text-right" : "md:col-start-3 md:text-left"
                } ${
                  isActive
                    ? "animate-process-breathe border-[#61c3ec]/55 shadow-[0_18px_36px_-20px_rgba(47,111,184,0.5)]"
                    : "border-white/90"
                }`}
              >
                {isActive ? (
                  <p
                    className={`mb-0.5 text-[9px] uppercase tracking-[0.18em] text-primary ${
                      left ? "md:text-right" : ""
                    }`}
                  >
                    You are here
                  </p>
                ) : null}
                <h3 className="text-[15px] leading-snug text-[#0a1a4a] md:text-base">{s.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#243447] md:text-[13px]">
                  {s.body}
                </p>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
