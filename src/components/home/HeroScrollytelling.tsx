import { useEffect, useRef } from "react";
import { WhyOrderWeb } from "@/components/home/WhyOrderWeb";
import heroImage from "@/assets/home-hero-desktop.jpg";
import heroImageMobile from "@/assets/home-hero-mobile.jpg";
import type { HomeContent } from "@/lib/cms/types";

type HeroCms = {
  hero: HomeContent["hero"];
  why: HomeContent["why"];
};

type Rect = { x: number; y: number; w: number; h: number };
type Frame = { x: number; y: number };

/** Laptop LCD rect — desktop landscape hero. */
const SCREEN_DESKTOP: Rect = {
  x: 0.4141,
  y: 0.4826,
  w: 0.1182,
  h: 0.1181,
};

/**
 * iPad screen rect — mobile-only portrait hero (image space).
 * Phones only (< md). Desktop / iPad widths keep the landscape laptop plate.
 */
const SCREEN_MOBILE: Rect = {
  // Measured on home-hero-mobile.jpg — white iPad LCD only
  x: 0.488,
  y: 0.508,
  w: 0.118,
  h: 0.102,
};

const FRAME_DESKTOP: Frame = { x: 48, y: 40 };

function heroConfig(mobile: boolean) {
  return mobile
    ? {
        screen: SCREEN_MOBILE,
        fallbackW: 576,
        fallbackH: 1024,
      }
    : {
        screen: SCREEN_DESKTOP,
        frame: FRAME_DESKTOP,
        fallbackW: 2048,
        fallbackH: 1152,
      };
}

/** Desktop: classic object-cover framing. */
function screenInViewportDesktop(
  vw: number,
  vh: number,
  iw: number,
  ih: number,
  screen: Rect,
  frame: Frame,
) {
  const posX = frame.x / 100;
  const posY = frame.y / 100;
  const scale = Math.max(vw / iw, vh / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = (vw - dw) * posX;
  const oy = (vh - dh) * posY;

  const left = ox + screen.x * dw;
  const top = oy + screen.y * dh;
  const width = screen.w * dw;
  const height = screen.h * dh;

  return {
    leftPct: ((left + width / 2) / vw) * 100,
    topPct: ((top + height / 2) / vh) * 100,
    widthPct: (width / vw) * 100,
    heightPct: (height / vh) * 100,
    coverScale: Math.max(width / vw, height / vh),
    img: { width: dw, height: dh, x: ox, y: oy },
  };
}

/**
 * Mobile phones: show the full portrait plate (cover, centered — no pre-zoom).
 * Portal still tracks the iPad; scroll zooms into that screen for Stage 2.
 */
function screenInViewportMobile(
  vw: number,
  vh: number,
  iw: number,
  ih: number,
  screen: Rect,
) {
  const scale = Math.max(vw / iw, vh / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = (vw - dw) / 2;
  const oy = (vh - dh) / 2;

  const left = ox + screen.x * dw;
  const top = oy + screen.y * dh;
  const width = screen.w * dw;
  const height = screen.h * dh;

  return {
    leftPct: ((left + width / 2) / vw) * 100,
    topPct: ((top + height / 2) / vh) * 100,
    widthPct: (width / vw) * 100,
    heightPct: (height / vh) * 100,
    coverScale: Math.max(width / vw, height / vh),
    img: { width: dw, height: dh, x: ox, y: oy },
  };
}

/**
 * 1) Zoom into the device screen (iPad on phones / laptop on desktop)
 * 2) Why OrderWeb fades in clear — covering the full screen
 * 3) Then that covered screen zooms out to the full page
 */
export function HeroScrollytelling({ content }: { content?: HeroCms }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hero = content?.hero;
  const desktopSrc = hero?.imageDesktop || heroImage;
  const mobileSrc = hero?.imageMobile || heroImageMobile;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    let removeResize: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = rootRef.current;
      const portal = root.querySelector<HTMLElement>(".hero-portal");
      const portalInner = root.querySelector<HTMLElement>(".hero-portal-inner");

      const activeImg = () => {
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const el = root.querySelector<HTMLImageElement>(
          mobile ? ".hero-sky-mobile" : ".hero-sky-desktop",
        );
        const cfg = heroConfig(mobile);
        return {
          mobile,
          cfg,
          img: el,
          iw: el?.naturalWidth || cfg.fallbackW,
          ih: el?.naturalHeight || cfg.fallbackH,
        };
      };

      const layout = () => {
        const { mobile, cfg, iw, ih } = activeImg();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (mobile) {
          return screenInViewportMobile(vw, vh, iw, ih, cfg.screen);
        }
        return screenInViewportDesktop(
          vw,
          vh,
          iw,
          ih,
          cfg.screen,
          FRAME_DESKTOP,
        );
      };

      const applyMobileImageFrame = () => {
        const { mobile, img } = activeImg();
        if (!img) return;
        if (!mobile) {
          gsap.set(img, { clearProps: "width,height,x,y,left,top,maxWidth,objectFit" });
          return;
        }
        const s = layout();
        gsap.set(img, {
          position: "absolute",
          left: 0,
          top: 0,
          maxWidth: "none",
          width: s.img.width,
          height: s.img.height,
          x: s.img.x,
          y: s.img.y,
          objectFit: "fill",
        });
      };

      ctx = gsap.context((self) => {
        const q = self.selector!;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const { mobile } = activeImg();

        applyMobileImageFrame();
        const s0 = layout();
        const origin = `${s0.leftPct}% ${s0.topPct}%`;

        gsap.set(q(".hero-media"), {
          transformOrigin: origin,
          scale: 1,
          opacity: 1,
        });
        const portalRadius = mobile ? 10 : 8;

        gsap.set(q(".hero-portal"), {
          transformOrigin: "50% 50%",
          left: `${s0.leftPct}%`,
          top: `${s0.topPct}%`,
          width: `${s0.widthPct}%`,
          height: `${s0.heightPct}%`,
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 0,
          borderRadius: portalRadius,
          boxShadow: "none",
        });
        gsap.set(q(".hero-portal-inner"), {
          width: () => window.innerWidth,
          height: () => window.innerHeight,
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          scale: () => layout().coverScale,
        });
        gsap.set(q(".hero-stage2-item"), {
          opacity: 0,
          y: mobile ? 18 : 36,
          scale: mobile ? 0.99 : 0.97,
        });
        gsap.set(q(".hero-vignette"), {
          background: mobile
            ? `radial-gradient(circle at ${s0.leftPct}% ${s0.topPct}%, transparent 18%, oklch(0.28 0.02 250 / 0.28) 62%, oklch(0.22 0.02 250 / 0.55) 100%)`
            : `radial-gradient(circle at ${s0.leftPct}% ${s0.topPct}%, transparent 12%, oklch(0.18 0.04 255 / 0.45) 78%)`,
        });
        if (mobile) {
          gsap.set(q(".hero-feed-wash"), { opacity: 0 });
        }

        portalInner?.classList.add("overflow-hidden");
        portalInner?.classList.remove("overflow-y-auto");

        if (!reduced) {
          gsap.fromTo(
            q(".hero-copy > *"),
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 },
          );
        } else {
          gsap.set(q(".hero-copy > *"), { opacity: 1, y: 0 });
        }

        // Mobile: longer pin + softer scrub so Stage 2 can “feed” out of the LCD
        const end = mobile ? "+=240%" : "+=340%";
        const scrub = mobile ? 1.05 : 1.25;

        const tl = gsap.timeline({
          defaults: { force3D: true },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end,
            scrub,
            pin: q(".hero-stage")[0],
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            onUpdate: (self) => {
              if (portal) {
                portal.style.pointerEvents =
                  self.progress > (mobile ? 0.55 : 0.62) ? "auto" : "none";
              }
              if (!portalInner) return;
              if (self.progress > (mobile ? 0.72 : 0.94)) {
                portalInner.classList.remove("overflow-hidden");
                portalInner.classList.add("overflow-y-auto");
              } else {
                portalInner.classList.add("overflow-hidden");
                portalInner.classList.remove("overflow-y-auto");
                portalInner.scrollTop = 0;
              }
            },
            onRefresh: (self) => {
              applyMobileImageFrame();
              if (self.progress > 0.02) return;
              const s = layout();
              gsap.set(q(".hero-media"), {
                transformOrigin: `${s.leftPct}% ${s.topPct}%`,
              });
              gsap.set(q(".hero-portal"), {
                left: `${s.leftPct}%`,
                top: `${s.topPct}%`,
                width: `${s.widthPct}%`,
                height: `${s.heightPct}%`,
                opacity: 0,
                borderRadius: portalRadius,
                boxShadow: "none",
              });
              gsap.set(q(".hero-portal-inner"), { scale: s.coverScale });
              gsap.set(q(".hero-vignette"), {
                background: mobile
                  ? `radial-gradient(circle at ${s.leftPct}% ${s.topPct}%, transparent 18%, oklch(0.28 0.02 250 / 0.28) 62%, oklch(0.22 0.02 250 / 0.55) 100%)`
                  : `radial-gradient(circle at ${s.leftPct}% ${s.topPct}%, transparent 12%, oklch(0.18 0.04 255 / 0.45) 78%)`,
              });
              if (mobile) gsap.set(q(".hero-feed-wash"), { opacity: 0 });
            },
          },
        });

        if (reduced) {
          tl.to(q(".hero-copy"), { opacity: 0, duration: 0.2, ease: "none" }, 0)
            .to(q(".hero-media"), { opacity: 0, duration: 0.3, ease: "none" }, 0)
            .to(
              q(".hero-portal"),
              {
                opacity: 1,
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                borderRadius: 0,
                duration: 0.35,
                ease: "none",
              },
              0.05,
            )
            .to(q(".hero-portal-inner"), { scale: 1, duration: 0.35, ease: "none" }, 0.05)
            .to(
              q(".hero-stage2-item"),
              { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.06, ease: "none" },
              0.12,
            );
          return;
        }

        if (mobile) {
          /**
           * Mobile feed: start on the full plate → zoom into iPad →
           * Stage 2 fills → full page wash (no photo behind the panel).
           */
          const peak = 3.6;
          const exit = peak * 1.15;

          tl.to(q(".hero-copy"), { opacity: 0, y: -16, duration: 0.65, ease: "power2.in" }, 0)
            .to(q(".hero-clear"), { opacity: 0, duration: 0.5, ease: "power1.in" }, 0)
            .to(q(".hero-vignette"), { opacity: 0.28, duration: 0.75, ease: "sine.inOut" }, 0)
            .to(q(".hero-media"), { scale: peak, duration: 1.1, ease: "power1.inOut" }, 0);

          // Stage 2 appears in the iPad
          tl.to(q(".hero-portal"), { opacity: 1, duration: 0.75, ease: "sine.out" }, 0.48);

          tl.to(
            q(".hero-stage2-item"),
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.04,
              ease: "power2.out",
            },
            0.6,
          );

          // Full fade: solid page wash covers the photo completely
          tl.to(
            q(".hero-feed-wash"),
            { opacity: 1, duration: 0.55, ease: "power1.inOut" },
            0.68,
          )
            .to(
              q(".hero-media"),
              { scale: exit, opacity: 0, duration: 0.5, ease: "power2.in" },
              0.68,
            )
            .to(q(".hero-vignette"), { opacity: 0, duration: 0.4, ease: "sine.out" }, 0.72);

          // Expand on a clean background — nothing peeking behind Stage 2
          tl.to(
            q(".hero-portal"),
            {
              left: "50%",
              top: "50%",
              width: "100%",
              height: "100%",
              borderRadius: 0,
              duration: 1.15,
              ease: "power2.inOut",
            },
            0.9,
          ).to(q(".hero-portal-inner"), { scale: 1, duration: 1.15, ease: "power2.inOut" }, 0.9);
        } else {
          const peak = 3.75;
          const exit = peak * 1.45;

          tl.to(q(".hero-copy"), { opacity: 0, y: -40, duration: 0.55, ease: "power2.in" }, 0)
            .to(q(".hero-clear"), { opacity: 0, duration: 0.55, ease: "power1.in" }, 0)
            .to(q(".hero-vignette"), { opacity: 0.34, duration: 0.7, ease: "sine.inOut" }, 0)
            .to(q(".hero-media"), { scale: peak, duration: 1.05, ease: "power1.inOut" }, 0);

          tl.to(q(".hero-portal"), { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.72);

          tl.to(q(".hero-media"), { scale: peak * 1.04, duration: 0.28, ease: "sine.inOut" }, 1.0);

          tl.to(
            q(".hero-portal"),
            {
              left: "50%",
              top: "50%",
              width: "100%",
              height: "100%",
              borderRadius: 0,
              duration: 0.9,
              ease: "power2.inOut",
            },
            1.18,
          )
            .to(q(".hero-portal-inner"), { scale: 1, duration: 0.9, ease: "power2.inOut" }, 1.18)
            .to(
              q(".hero-media"),
              { scale: exit, opacity: 0, duration: 0.75, ease: "power2.in" },
              1.25,
            )
            .to(q(".hero-vignette"), { opacity: 0, duration: 0.45, ease: "sine.out" }, 1.4);

          tl.to(
            q(".hero-stage2-item"),
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.55,
              stagger: 0.07,
              ease: "power2.out",
            },
            1.55,
          );
        }
      }, root);

      const onResize = () => {
        applyMobileImageFrame();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize, { passive: true });
      removeResize = () => window.removeEventListener("resize", onResize);

      const imgs = root.querySelectorAll<HTMLImageElement>(".hero-sky-desktop, .hero-sky-mobile");
      let pending = 0;
      imgs.forEach((img) => {
        if (!img.complete) {
          pending += 1;
          img.addEventListener(
            "load",
            () => {
              pending -= 1;
              applyMobileImageFrame();
              if (pending <= 0) ScrollTrigger.refresh();
            },
            { once: true },
          );
        }
      });
      if (pending === 0) {
        applyMobileImageFrame();
        ScrollTrigger.refresh();
      }
    })();

    return () => {
      cancelled = true;
      removeResize?.();
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="hero-stage relative h-svh w-full overflow-hidden bg-background">
        <div className="hero-media absolute inset-0 will-change-transform">
          <img
            src={desktopSrc}
            alt="A balcony workspace with a laptop overlooking a city street and restaurant frontage"
            width={2048}
            height={1152}
            className="hero-sky-desktop absolute inset-0 hidden size-full object-cover md:block"
            style={{ objectPosition: `${FRAME_DESKTOP.x}% ${FRAME_DESKTOP.y}%` }}
            decoding="async"
            fetchPriority="high"
          />
          <img
            src={mobileSrc}
            alt="A balcony workspace with an iPad overlooking a city street — mobile view"
            width={576}
            height={1024}
            className="hero-sky-mobile absolute md:hidden"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="hero-vignette pointer-events-none absolute inset-0 z-[1] opacity-0" />
        {/* Mobile-only: solid wash so Stage 2 has no photo behind it */}
        <div
          aria-hidden
          className="hero-feed-wash pointer-events-none absolute inset-0 z-[2] bg-background opacity-0 md:hidden"
        />
        <div className="hero-clear pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/55 via-background/20 to-transparent" />
        <div
          aria-hidden
          className="hero-clear pointer-events-none absolute inset-x-0 top-0 z-[1] h-[42vh] md:h-[52vh]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.99 0.005 240 / 0.72) 0%, oklch(0.99 0.005 240 / 0.35) 42%, transparent 100%)",
          }}
        />

        <div className="hero-copy absolute inset-x-0 top-[max(5rem,7vh)] z-[2] mx-auto max-w-3xl px-4 text-center sm:top-[8vh] sm:px-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.35em]">
            {hero?.eyebrow || "SOFTWARE COMPANY | SPECIALISED POS PLATFORM"}
          </p>
          <h1 className="mt-3 text-[2.1rem] leading-[1.08] tracking-tight text-foreground [font-weight:550] [text-shadow:0.015em_0_0_currentColor] sm:mt-5 sm:text-6xl md:text-7xl">
            {hero?.headline || "Restaurant software that puts you back in control"}
          </h1>
        </div>

        <div className="hero-portal pointer-events-none absolute z-[3] overflow-hidden bg-background opacity-0 will-change-transform">
          <div className="hero-portal-inner absolute overflow-hidden bg-background">
            <div className="flex min-h-full w-full items-start justify-center sm:items-center">
              <WhyOrderWeb content={content?.why} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
