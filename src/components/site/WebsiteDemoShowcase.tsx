import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import demoRestaurant1 from "@/assets/demo-restaurant-1.png";
import demoRestaurant2 from "@/assets/demo-restaurant-2.png";
import demoRestaurant3 from "@/assets/demo-restaurant-3.png";
import demoRetail1 from "@/assets/demo-retail-1.png";
import demoRetail2 from "@/assets/demo-retail-2.png";
import demoRetail3 from "@/assets/demo-retail-3.png";
import demoServices1 from "@/assets/demo-services-1.png";
import demoServices2 from "@/assets/demo-services-2.png";
import demoServices3 from "@/assets/demo-services-3.png";
import type { WebsiteContent } from "@/lib/cms/types";

type DemoTile = { label: string; image?: string };

type Demo = {
  id: string;
  label: string;
  domain: string;
  brand: string;
  headline: string;
  support: string;
  cta: string;
  secondary: string;
  gradient: string;
  accent: string;
  heroImage?: string;
  tiles: DemoTile[];
};

const DEMOS: Demo[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    domain: "harbourkitchen.com",
    brand: "Harbour Kitchen",
    headline: "Welcome in.\nOrder in minutes.",
    support: "Menus, bookings and orders — built for real customers.",
    cta: "View menu",
    secondary: "Book a table",
    gradient: "linear-gradient(145deg, #abeafd 0%, #61c3ec 40%, #2f6fb8 100%)",
    accent: "#2f6fb8",
    heroImage: demoRestaurant3,
    tiles: [
      { label: "Signature", image: demoRestaurant1 },
      { label: "Popular", image: demoRestaurant2 },
      { label: "Dining", image: demoRestaurant3 },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    domain: "luxorialondon.com",
    brand: "Luxoria London",
    headline: "New season.\nShop the edit.",
    support: "Product stories that feel premium and convert.",
    cta: "Shop now",
    secondary: "Lookbook",
    gradient: "linear-gradient(145deg, #c5d4e0 0%, #6b8499 45%, #243447 100%)",
    accent: "#243447",
    heroImage: demoRetail3,
    tiles: [
      { label: "New in", image: demoRetail1 },
      { label: "Best sellers", image: demoRetail2 },
      { label: "In store", image: demoRetail3 },
    ],
  },
  {
    id: "services",
    label: "Services",
    domain: "cleanproservices.com",
    brand: "CleanPro Services",
    headline: "Book today.\nGet it done.",
    support: "Clear CTAs so visitors take the next step fast.",
    cta: "Get a quote",
    secondary: "Our work",
    gradient: "linear-gradient(145deg, #b8e0d2 0%, #3d8f7a 45%, #1a3d35 100%)",
    accent: "#1a3d35",
    heroImage: demoServices3,
    tiles: [
      { label: "Home", image: demoServices1 },
      { label: "Business", image: demoServices2 },
      { label: "Ready", image: demoServices3 },
    ],
  },
];

function resolveDemos(cmsDemos: WebsiteContent["demoShowcase"]["demos"] | undefined): Demo[] {
  const source = cmsDemos?.length ? cmsDemos : null;
  if (!source) return DEMOS;
  return source.map((demo, i) => {
    const fallback = DEMOS.find((d) => d.id === demo.id) ?? DEMOS[i % DEMOS.length]!;
    const heroImage = demo.heroImage || fallback.heroImage;
    const tiles = (demo.tiles?.length ? demo.tiles : fallback.tiles).map((tile, ti) => {
      const label = tile.label || fallback.tiles[ti]?.label || "Tile";
      const image = tile.image || fallback.tiles[ti]?.image;
      return image ? { label, image } : { label };
    });
    const resolved: Demo = {
      ...fallback,
      id: demo.id || fallback.id,
      label: demo.label || fallback.label,
      domain: demo.domain || fallback.domain,
      brand: demo.brand || fallback.brand,
      headline: demo.headline || fallback.headline,
      support: demo.support || fallback.support,
      cta: demo.cta || fallback.cta,
      secondary: demo.secondary || fallback.secondary,
      tiles,
      gradient: fallback.gradient,
      accent: fallback.accent,
    };
    if (heroImage) resolved.heroImage = heroImage;
    return resolved;
  });
}

/**
 * Animated showcase of the websites OrderWeb builds — no configurator.
 */
export function WebsiteDemoShowcase({
  content,
}: {
  content?: WebsiteContent["demoShowcase"] | undefined;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const demos = resolveDemos(content?.demos);
  const demo = demos[active] ?? demos[0]!;
  const bullets =
    content?.bullets?.length
      ? content.bullets
      : [
          "Custom design around your brand",
          "Mobile-first and built for speed",
          "Clear actions that win customers",
        ];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % demos.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused, demos.length]);

  useEffect(() => {
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
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
          rootRef.current!.querySelectorAll(".demo-enter"),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
          },
        );
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="mx-auto mt-12 max-w-6xl px-4 sm:mt-20 sm:px-5">
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.3em]">
          {content?.eyebrow || "Our work"}
        </p>
        <h2 className="mt-3 max-w-2xl text-[1.75rem] leading-snug text-[#0a1a4a] sm:text-4xl">
          {content?.headline || "Websites we build for real businesses"}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#243447] sm:text-[15px]">
          {content?.body ||
            "Custom customer-facing sites — fast, on-brand, and ready to convert. Here’s the kind of result we deliver."}
        </p>
      </Reveal>

      {/* Demo type pills */}
      <div className="demo-enter mt-5 flex flex-wrap gap-2 sm:mt-6">
        {demos.map((d, i) => {
          const on = i === active;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setActive(i);
                setPaused(true);
              }}
              className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-all duration-300 sm:px-3.5 sm:text-xs sm:tracking-[0.16em] ${
                on
                  ? "border-transparent text-white shadow-md"
                  : "border-border bg-white text-muted-foreground hover:border-[#61c3ec]/50"
              }`}
              style={on ? { backgroundImage: d.gradient } : undefined}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="demo-enter mt-6 grid items-center gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Animated browser / phone demo */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={() => setPaused(true)}
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${demo.accent}55 0%, transparent 70%)`,
            }}
          />

          {/* Desktop frame */}
          <div className="relative mx-auto hidden overflow-hidden rounded-2xl border border-[#61c3ec]/30 bg-white shadow-[0_28px_60px_-28px_rgba(10,26,74,0.4)] sm:block">
            <div className="flex items-center gap-2 border-b border-border bg-[#f3f9fc] px-3 py-2.5">
              <span className="size-2 rounded-full bg-[#e8a598]" />
              <span className="size-2 rounded-full bg-[#e8d49a]" />
              <span className="size-2 rounded-full bg-[#a8d4b8]" />
              <div className="ml-2 flex-1 truncate rounded-full bg-white px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                {demo.domain}
              </div>
            </div>
            <DemoSite key={demo.id} demo={demo} compact={false} />
          </div>

          {/* Mobile frame */}
          <div className="relative mx-auto max-w-[300px] overflow-hidden rounded-[1.75rem] border-[3px] border-[#0a1a4a]/85 bg-white shadow-[0_24px_50px_-20px_rgba(10,26,74,0.45)] sm:absolute sm:-bottom-6 sm:-right-2 sm:max-w-[200px] sm:border-[3px] lg:-right-4">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-foreground/15 sm:mt-1.5 sm:w-8" />
            <DemoSite key={`m-${demo.id}`} demo={demo} compact />
          </div>
        </div>

        {/* Copy */}
        <div className="demo-enter lg:pl-2">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-500 sm:tracking-[0.22em]"
            style={{ color: demo.accent }}
          >
            {demo.label} website
          </p>
          <h3 className="mt-2 text-xl text-[#0a1a4a] sm:text-3xl">{demo.brand}</h3>
          <p className="mt-2 text-base leading-relaxed text-[#243447] sm:mt-3 sm:text-[15px]">
            {demo.support}
          </p>

          <ul className="mt-4 space-y-2 text-[15px] text-[#243447] sm:mt-5 sm:space-y-2.5 sm:text-sm">
            {bullets.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ background: demo.accent }}
                />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
            <Button asChild className="btn-brand-gradient w-full sm:w-auto">
              <Link to="/contact" search={{}}>
                {content?.primaryCta || "Start your website"}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setActive((i) => (i + 1) % demos.length);
                setPaused(true);
              }}
            >
              {content?.nextExampleLabel || "See next example"}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="demo-enter mt-10 flex justify-center gap-0.5 sm:mt-14">
        {demos.map((d, i) => (
          <button
            key={d.id}
            type="button"
            aria-label={`Show ${d.label}`}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
            className="flex size-11 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-8" : "w-1.5 bg-border"
              }`}
              style={i === active ? { backgroundImage: d.gradient } : undefined}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function DemoSite({
  demo,
  compact,
}: {
  demo: Demo;
  compact: boolean;
}) {
  return (
    <div className="demo-site-in">
      <div
        className={`relative overflow-hidden text-white ${compact ? "px-3 pb-3 pt-3" : "px-5 pb-5 pt-5"}`}
        style={
          demo.heroImage
            ? undefined
            : { backgroundImage: demo.gradient }
        }
      >
        {demo.heroImage ? (
          <>
            <img
              src={demo.heroImage}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(10,26,74,0.72) 0%, rgba(47,111,184,0.55) 55%, rgba(10,26,74,0.7) 100%)",
              }}
            />
          </>
        ) : null}
        <div className="relative z-[1]">
          <p className={`uppercase tracking-[0.2em] text-white/70 ${compact ? "text-[8px]" : "text-[10px]"}`}>
            {demo.brand}
          </p>
          <p
            className={`mt-1.5 whitespace-pre-line font-semibold leading-tight ${
              compact ? "text-base" : "text-2xl sm:text-3xl"
            }`}
          >
            {demo.headline}
          </p>
          {!compact ? (
            <p className="mt-2 max-w-md text-xs text-white/80 sm:text-sm">{demo.support}</p>
          ) : null}
          <div className={`mt-3 flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-4"}`}>
            <span
              className={`rounded-full bg-white font-medium text-[#0a1a4a] ${
                compact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[11px]"
              }`}
            >
              {demo.cta}
            </span>
            <span
              className={`rounded-full border border-white/40 text-white ${
                compact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[11px]"
              }`}
            >
              {demo.secondary}
            </span>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-1.5 bg-[#f7fbfd] ${compact ? "p-2" : "p-3 sm:p-4"}`}>
        {demo.tiles.map((tile, i) => (
          <div
            key={tile.label}
            className={`overflow-hidden rounded-lg border border-[#61c3ec]/20 bg-white shadow-sm demo-tile ${
              compact ? "p-1.5" : "p-2"
            }`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {tile.image ? (
              <img
                src={tile.image}
                alt={tile.label}
                className={`w-full rounded-md object-cover ${compact ? "mb-1 h-7" : "mb-1.5 h-12 sm:h-14"}`}
              />
            ) : (
              <div
                className={`rounded-md ${compact ? "mb-1 h-7" : "mb-1.5 h-12 sm:h-14"}`}
                style={{
                  backgroundImage:
                    i === 1
                      ? demo.gradient
                      : `linear-gradient(160deg, ${demo.accent}33, ${demo.accent}99)`,
                }}
              />
            )}
            <p className={`font-medium text-[#0a1a4a] ${compact ? "text-[7px]" : "text-[10px]"}`}>
              {tile.label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes demo-site-in {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes demo-tile-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .demo-site-in {
          animation: demo-site-in 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .demo-tile {
          animation: demo-tile-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .demo-site-in, .demo-tile { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
