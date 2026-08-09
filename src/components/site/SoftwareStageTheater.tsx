import { useEffect, useRef, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { AppWindow, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BriefCodeVisual } from "@/components/site/BriefCodeVisual";

const BRAND_GRADIENT =
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)";

type Product = {
  id: string;
  icon: ComponentType<LucideProps>;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  stack: string[];
};

function useCinematicSlide() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 1100px) and (min-height: 780px) and (prefers-reduced-motion: no-preference) and (pointer: fine)",
    );
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return enabled;
}

/**
 * Desktop (fine pointer): sticky slide — web exits left, mobile enters right.
 * Uses document scroll (no GSAP pin) so the page never traps the wheel.
 * Mobile / touch / short screens: stacked cards.
 */
export function SoftwareStageTheater({
  webProduct,
  mobileProduct,
}: {
  webProduct: Product;
  mobileProduct: Product;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cinematic = useCinematicSlide();

  useEffect(() => {
    if (!cinematic) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const root = rootRef.current!;
        const web = root.querySelector<HTMLElement>(".soft-stage-web");
        const mobile = root.querySelector<HTMLElement>(".soft-stage-mobile");
        const track = root.querySelector<HTMLElement>(".soft-stage-track");
        if (!web || !mobile || !track) return;

        gsap.set(web, { xPercent: 0, force3D: true });
        gsap.set(mobile, { xPercent: 100, force3D: true });

        gsap
          .timeline({
            defaults: { ease: "none", force3D: true },
            scrollTrigger: {
              trigger: root,
              // Animate while the tall track scrolls; sticky viewport holds the cards
              start: "top top",
              end: "bottom bottom",
              scrub: 0.45,
              invalidateOnRefresh: true,
              // No pin — avoids wheel-trap / stuck scroll with nested UI
            },
          })
          .to(web, { xPercent: -110, duration: 1 }, 0)
          .to(mobile, { xPercent: 0, duration: 1 }, 0);
      }, rootRef);

      requestAnimationFrame(() => ScrollTrigger.refresh());
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [cinematic]);

  if (!cinematic) {
    return (
      <div className="mx-auto mt-10 max-w-5xl space-y-4 px-4 sm:mt-16 sm:space-y-6 sm:px-5">
        <ProductCard product={webProduct} tone="web" />
        <ProductCard product={mobileProduct} tone="mobile" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="soft-stage-root relative mt-10">
      {/* Tall scroll track — normal page scroll drives the slide */}
      <div className="soft-stage-track relative h-[165vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#f7fbfd]">
          <div className="relative mx-auto h-full w-full max-w-5xl px-5 py-5">
            <div className="soft-stage-web absolute inset-x-5 inset-y-5 z-[1] flex items-center will-change-transform">
              <div className="w-full">
                <ProductCard product={webProduct} tone="web" dense />
              </div>
            </div>

            <div className="soft-stage-mobile absolute inset-x-5 inset-y-5 z-[2] flex items-center will-change-transform">
              <div className="w-full">
                <ProductCard product={mobileProduct} tone="mobile" dense />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  tone,
  dense = false,
}: {
  product: Product;
  tone: "web" | "mobile";
  dense?: boolean;
}) {
  const isMobile = tone === "mobile";
  // On dense theater cards, keep the list shorter so nothing needs inner scrolling
  const points = dense ? product.points.slice(0, 3) : product.points;

  return (
    <article
      className={`relative overflow-hidden transition-shadow duration-500 hover:shadow-[var(--shadow-glow)] ${
        isMobile
          ? "rounded-[var(--radius-xl)] border border-[#61c3ec]/35 shadow-[var(--shadow-lift)]"
          : "surface-panel"
      }`}
      style={
        isMobile
          ? { background: "linear-gradient(145deg, #ffffff 0%, #f3faff 48%, #e8f4fb 100%)" }
          : undefined
      }
    >
      {isMobile ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 92% 20%, rgba(171,234,253,0.55) 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 8% 90%, rgba(47,111,184,0.12) 0%, transparent 50%)",
          }}
        />
      ) : null}

      <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className={dense ? "p-4 sm:p-5" : "p-4 sm:p-7"}>
          <div className="flex items-center gap-2.5">
            <span
              className="feature-icon-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-white sm:animate-icon-float"
              style={{ backgroundImage: BRAND_GRADIENT }}
            >
              <product.icon className="size-4" strokeWidth={2.25} />
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#2f6fb8] sm:tracking-[0.28em]">
              {product.eyebrow}
            </p>
          </div>
          <h2
            className={`mt-3 text-[#0a1a4a] ${dense ? "text-xl sm:text-2xl" : "text-[1.45rem] leading-snug sm:text-3xl"}`}
          >
            {product.title}
          </h2>
          <p
            className={`mt-2 max-w-lg leading-relaxed text-[#243447] ${dense ? "text-xs sm:text-sm" : "text-[15px] sm:text-base"}`}
          >
            {product.body}
          </p>
          <ul className={`mt-3 ${dense ? "space-y-1.5" : "mt-4 space-y-2"}`}>
            {points.map((point) => (
              <li
                key={point}
                className={`flex items-start gap-2 text-[#243447] ${dense ? "text-xs" : "text-[14px] sm:text-[15px]"}`}
              >
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#2f6fb8]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className={dense ? "mt-4" : "mt-5"}>
            <Button
              asChild
              size="sm"
              className={`${isMobile ? "btn-brand-gradient" : ""} w-full sm:w-auto`}
            >
              <Link to="/contact" search={{}}>Discuss this build</Link>
            </Button>
          </div>
        </div>

        <div
          className={`border-t lg:border-l lg:border-t-0 ${
            dense ? "p-4 sm:p-5" : "p-4 sm:p-7"
          } ${
            isMobile
              ? "border-[#61c3ec]/25 bg-white/40 backdrop-blur-[2px]"
              : "border-border bg-surface/50"
          }`}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#243447]/70 sm:tracking-[0.28em]">
            Typical stack
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.stack.map((s) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  isMobile
                    ? "border border-[#61c3ec]/45 bg-white/80 text-[#0a1a4a]/85 shadow-sm"
                    : "border border-border bg-background text-foreground/80"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <div
            className={`mt-3 overflow-hidden rounded-xl ${dense ? "p-3" : "mt-4 p-3 sm:mt-5 sm:p-4"} ${
              isMobile
                ? "border border-[#61c3ec]/35 bg-white/90 shadow-[0_18px_40px_-28px_rgba(47,111,184,0.45)]"
                : "border border-border bg-background"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[#0a1a4a]">
              <AppWindow className="size-3.5 text-[#2f6fb8]" />
              Built around your brief
            </div>
            {!dense ? (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#243447] sm:text-[13px]">
                Features, flows and integrations are scoped from your requirements — not forced into
                a fixed product package.
              </p>
            ) : null}
            <div className="mt-2 min-w-0">
              <BriefCodeVisual variant={isMobile ? "mobile" : "webapps"} compact />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
