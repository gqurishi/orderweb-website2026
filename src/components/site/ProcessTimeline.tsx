import { useEffect, useRef, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

type ProcessStep = {
  step: string;
  title: string;
  body: string;
  icon: ComponentType<LucideProps>;
};

const BRAND_GRADIENT =
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)";

const FLOW_GRADIENT =
  "linear-gradient(90deg, #abeafd 0%, #61c3ec 35%, #2f6fb8 65%, #abeafd 100%)";

export function ProcessTimeline({
  eyebrow = "Delivery",
  title = "How a project runs",
  subtitle = "A clear path from first conversation to live software — with visibility at every stage.",
  steps,
  playMode = "scroll",
  active = true,
  compact = false,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  playMode?: "scroll" | "signal";
  active?: boolean;
  compact?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const [live, setLive] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let st: { kill: () => void } | undefined;
    let cycleTimer: number | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = rootRef.current;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const stepEls = () =>
        gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".process-step"));
      const iconEls = () =>
        gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".process-icon"));
      const progress = () => root.querySelector<HTMLElement>(".process-progress");

      const showFinal = () => {
        gsap.set(stepEls(), { opacity: 1, y: 0 });
        gsap.set(iconEls(), { scale: 1, opacity: 1 });
        const p = progress();
        if (p) gsap.set(p, { scaleX: 1 });
        setLive(true);
      };

      const startCycle = () => {
        if (reduced) return;
        setLive(true);
        let i = 0;
        setActiveStep(0);
        cycleTimer = window.setInterval(() => {
          i = (i + 1) % steps.length;
          setActiveStep(i);
        }, 1600);
      };

      const play = () => {
        if (played.current) return;
        played.current = true;
        if (reduced) {
          showFinal();
          return;
        }
        const stepsList = stepEls();
        const icons = iconEls();
        const bar = progress();
        const tl = gsap.timeline({
          onComplete: startCycle,
        });
        stepsList.forEach((step, i) => {
          const at = i * 0.32;
          tl.to(step, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, at)
            .to(
              icons[i],
              { scale: 1.1, opacity: 1, duration: 0.3, ease: "back.out(2)" },
              at,
            )
            .to(icons[i], { scale: 1, duration: 0.18, ease: "power2.out" }, at + 0.22);
          if (bar) {
            tl.to(
              bar,
              {
                scaleX: (i + 1) / stepsList.length,
                duration: 0.32,
                ease: "power2.inOut",
              },
              at,
            );
          }
        });
      };

      ctx = gsap.context(() => {
        if (!reduced && !played.current) {
          gsap.set(stepEls(), { opacity: 0.3, y: 18 });
          gsap.set(iconEls(), { scale: 0.72, opacity: 0.4 });
          const bar = progress();
          if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
        }

        if (playMode === "scroll") {
          st = ScrollTrigger.create({
            trigger: root,
            start: "top 78%",
            once: true,
            onEnter: play,
          });
        } else if (active) {
          play();
        }
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      st?.kill();
      ctx?.revert();
      if (cycleTimer) window.clearInterval(cycleTimer);
    };
  }, [steps.length, playMode, active]);

  useEffect(() => {
    if (playMode === "signal" && !active) played.current = false;
  }, [active, playMode]);

  return (
    <section className={`relative overflow-hidden ${compact ? "mt-10" : "mt-24"}`} ref={rootRef}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 12% 20%, rgba(171,234,253,0.55) 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 88% 70%, rgba(47,111,184,0.16) 0%, transparent 55%), linear-gradient(180deg, #f7fbfd 0%, #eef6fb 45%, #f8fafc 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(10,26,74,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(10,26,74,0.045) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 15%, transparent 75%)",
          }}
        />
      </div>

      <div
        className={`relative mx-auto max-w-6xl px-4 sm:px-5 ${compact ? "py-10 sm:py-12" : "py-14 sm:py-20"}`}
      >
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.3em]">
            {eyebrow}
          </p>
          <h2
            className={`mt-3 text-[#0a1a4a] ${compact ? "text-[1.75rem] sm:text-4xl" : "text-[1.9rem] sm:text-5xl"}`}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#243447] sm:mt-4 sm:text-[15px]">
            {subtitle}
          </p>
        </Reveal>

        <div className={`relative ${compact ? "mt-8" : "mt-12"}`}>
          {/* Desktop flow line */}
          <div className="pointer-events-none absolute left-8 right-8 top-[44px] hidden h-[3px] overflow-visible rounded-full bg-white/80 lg:block">
            <div
              className={`process-progress h-full origin-left rounded-full ${live ? "animate-process-line" : ""}`}
              style={{ backgroundImage: FLOW_GRADIENT }}
            />
            {live ? (
              <span
                className="animate-process-dot absolute top-1/2 size-2.5 rounded-full bg-[#61c3ec] shadow-[0_0_12px_rgba(97,195,236,0.8)]"
                aria-hidden
              />
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((p, i) => {
              const isActive = live && activeStep === i;
              return (
                <div
                  key={p.step}
                  className={`process-step group relative rounded-2xl border bg-white/70 p-3.5 shadow-[0_16px_40px_-28px_rgba(47,111,184,0.45)] backdrop-blur-sm transition-all duration-500 sm:p-5 ${
                    isActive
                      ? "animate-process-breathe border-[#61c3ec]/55 shadow-[0_22px_48px_-22px_rgba(47,111,184,0.55)]"
                      : "border-white/80"
                  }`}
                  style={{
                    animationDelay: live ? `${i * 0.18}s` : undefined,
                  }}
                >
                  <span className="relative z-[1] mb-3 inline-flex sm:mb-4">
                    {isActive ? (
                      <span
                        aria-hidden
                        className="animate-process-ring absolute inset-0 rounded-full"
                      />
                    ) : null}
                    <span
                      className="process-icon feature-icon-gradient relative flex size-10 items-center justify-center rounded-full text-white sm:size-12 sm:animate-icon-float"
                      style={{
                        backgroundImage: BRAND_GRADIENT,
                        animationDelay: `${i * 0.22}s`,
                      }}
                    >
                      <p.icon className="size-4" strokeWidth={2.25} />
                    </span>
                  </span>

                  {/* Mobile mini progress between cards */}
                  {i < steps.length - 1 ? (
                    <div className="absolute -bottom-2 left-1/2 z-[1] h-4 w-px -translate-x-1/2 bg-gradient-to-b from-[#61c3ec] to-transparent lg:hidden" />
                  ) : null}

                  <div className="flex items-baseline gap-2">
                    <span
                      className="bg-clip-text text-xs font-semibold text-transparent"
                      style={{ backgroundImage: BRAND_GRADIENT }}
                    >
                      {p.step}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {isActive ? "Now" : "Stage"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg text-[#0a1a4a]">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>

                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-6 -top-6 size-20 rounded-full blur-2xl transition-opacity duration-500 ${
                      isActive ? "opacity-80" : "opacity-40"
                    }`}
                    style={{
                      background:
                        i % 2 === 0
                          ? "radial-gradient(circle, rgba(171,234,253,0.9) 0%, transparent 70%)"
                          : "radial-gradient(circle, rgba(47,111,184,0.35) 0%, transparent 70%)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
