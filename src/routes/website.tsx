import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  LayoutTemplate,
  Maximize2,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { WebsiteJourney } from "@/components/site/WebsiteJourney";
import { WebsiteDemoShowcase } from "@/components/site/WebsiteDemoShowcase";
import websiteDevicesHero from "@/assets/website-devices-hero.png";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { WebsiteContent } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "Custom Websites & Redesigns — OrderWeb";
const DESC =
  "Custom new websites and redesigns for restaurants and brands — built to convert. Get a quote from OrderWeb.";

export const Route = createFileRoute("/website")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "website", preview } });
    return page as {
      content: WebsiteContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/website" }),
      pageBreadcrumbJsonLd("website"),
    ),
  component: WebsitePage,
});

const BRAND_GRADIENT =
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)";

const AUDIENCE_ICONS = [Utensils, ShoppingBag, Megaphone, LayoutTemplate];

const ROADMAP_ICONS = [MessageCircle, MessagesSquare, Briefcase, Wand2, Maximize2];

function WebsitePage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImage = cms.hero.image || websiteDevicesHero;
  const audiences = (cms.hero.audiences.length
    ? cms.hero.audiences
    : ["Restaurants", "Retail brands", "Local services", "Multi-location"]
  ).map((label, i) => ({
    label,
    icon: AUDIENCE_ICONS[i % AUDIENCE_ICONS.length]!,
  }));
  const roadmap = cms.roadmap.steps.map((step, i) => ({
    ...step,
    icon: ROADMAP_ICONS[i % ROADMAP_ICONS.length]!,
  }));

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !heroRef.current) return;

      ctx = gsap.context(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
          heroRef.current!.querySelectorAll(".hero-anim:not(.hero-devices)"),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.09 },
        );

        gsap.fromTo(
          heroRef.current!.querySelector(".hero-devices"),
          { opacity: 0, y: 36, scale: 0.9, rotate: -2 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 1.15,
            delay: 0.18,
            ease: "power3.out",
          },
        );
      }, heroRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <>
      {previewBanner}
      <div className="overflow-x-hidden pb-16 sm:pb-24">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-border/60 pt-24 pb-12 sm:pt-32 sm:pb-20"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 75% 65% at 88% 35%, rgba(97,195,236,0.42) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 8% 25%, rgba(171,234,253,0.5) 0%, transparent 50%), radial-gradient(ellipse 50% 55% at 45% 100%, rgba(47,111,184,0.14) 0%, transparent 55%), linear-gradient(165deg, #f3f9fc 0%, #e8f4fa 40%, #f8fafc 100%)",
            }}
          />
          <div
            className="absolute -right-20 top-8 hidden size-[420px] rounded-full opacity-50 blur-3xl sm:block"
            style={{
              background: "radial-gradient(circle, rgba(47,111,184,0.32) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.32]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(10,26,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,26,74,0.04) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse 70% 60% at 75% 40%, black 15%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-12 sm:px-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <p className="hero-anim text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.3em]">
              {cms.hero.eyebrow}
            </p>
            <h1 className="hero-anim mt-3 text-[2.05rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl lg:text-6xl">
              {cms.hero.headline}
            </h1>
            <p className="hero-anim mt-4 max-w-xl text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
              {cms.hero.body}
            </p>
            <div className="hero-anim mt-6 sm:mt-8">
              <Button asChild size="lg" className="btn-brand-gradient w-full sm:w-auto">
                <Link to="/contact" search={{}}>
                  {cms.hero.primaryCta}
                </Link>
              </Button>
            </div>
            <div className="hero-anim mt-6 flex flex-wrap gap-2 sm:mt-10">
              {audiences.map((a) => (
                <span
                  key={a.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#61c3ec]/35 bg-white/70 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0a1a4a]/80 sm:px-3 sm:text-[11px] sm:tracking-[0.18em]"
                >
                  <a.icon className="size-3 text-[#2f6fb8]" />
                  {a.label}
                </span>
              ))}
            </div>
          </div>

          <figure className="hero-anim hero-devices website-devices-stage relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
            <div
              aria-hidden
              className="website-devices-glow absolute left-1/2 top-[52%] size-[82%] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(97,195,236,0.5) 0%, rgba(47,111,184,0.2) 48%, transparent 72%)",
              }}
            />
            <div
              aria-hidden
              className="website-devices-ring pointer-events-none absolute left-1/2 top-[48%] hidden h-[78%] w-[88%] rounded-[48%] border border-dashed border-[#61c3ec]/35 sm:block"
            />
            <span
              aria-hidden
              className="website-devices-orb pointer-events-none absolute right-[8%] top-[12%] hidden size-3 rounded-full bg-[#61c3ec]/80 shadow-[0_0_14px_rgba(97,195,236,0.7)] sm:block"
            />
            <span
              aria-hidden
              className="website-devices-orb pointer-events-none absolute left-[10%] top-[28%] hidden size-2 rounded-full bg-primary/70 shadow-[0_0_10px_rgba(47,111,184,0.55)] sm:block"
              style={{ animationDelay: "-1.1s", animationDuration: "4.2s" }}
            />
            <span
              aria-hidden
              className="website-devices-orb pointer-events-none absolute bottom-[18%] right-[18%] hidden size-2.5 rounded-full bg-[#abeafd] shadow-[0_0_12px_rgba(171,234,253,0.8)] sm:block"
              style={{ animationDelay: "-2s", animationDuration: "3.2s" }}
            />
            <div className="animate-website-devices relative">
              <img
                src={heroImage}
                alt="Custom website design across desktop, laptop and mobile"
                width={917}
                height={533}
                className="relative z-[1] mx-auto h-auto w-full object-contain drop-shadow-[0_28px_52px_rgba(10,26,74,0.26)]"
                loading="eager"
              />
              <span
                aria-hidden
                className="website-devices-shine pointer-events-none absolute inset-[4%] z-[2] hidden sm:block"
              />
            </div>
          </figure>
        </div>
      </section>

      {/* Promise strip */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: BRAND_GRADIENT,
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
          <p className="flex items-center gap-2 text-sm font-medium sm:text-base">
            <Sparkles className="size-4 shrink-0 text-[#abeafd]" />
            {cms.promiseStrip.left}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/75 sm:text-xs sm:tracking-[0.22em]">
            {cms.promiseStrip.right}
          </p>
        </div>
      </section>

      <WebsiteDemoShowcase content={cms.demoShowcase} />

      {/* How we build a custom website */}
      <section className="relative mx-auto mt-12 max-w-5xl overflow-hidden px-4 sm:mt-14 sm:px-5">
        <Reveal>
          <div
            className="rounded-2xl border border-[#61c3ec]/30 px-4 py-6 sm:px-8 sm:py-8"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 10% 20%, rgba(171,234,253,0.55) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 90% 80%, rgba(47,111,184,0.12) 0%, transparent 50%), linear-gradient(165deg, #f7fbfd 0%, #eef6fb 100%)",
            }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:tracking-[0.3em]">
              {cms.roadmap.eyebrow}
            </p>
            <h2 className="mt-2 text-[1.55rem] leading-snug text-[#0a1a4a] sm:text-3xl">
              {cms.roadmap.headline}
            </h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-[#243447] sm:text-[15px]">
              {cms.roadmap.body}
            </p>

            <WebsiteJourney steps={roadmap} />
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-20 sm:px-5">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-10 text-center text-white sm:rounded-[1.75rem] sm:px-12 sm:py-12"
            style={{ backgroundImage: BRAND_GRADIENT }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(171,234,253,0.35) 0%, transparent 45%)",
              }}
            />
            <div className="relative">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/75 sm:tracking-[0.3em]">
                {cms.cta.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.75rem] leading-snug sm:text-4xl">
                {cms.cta.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:text-[15px]">
                {cms.cta.body}
              </p>
              <div className="mt-6 sm:mt-8">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-white text-[#0a1a4a] hover:bg-[#f3faff] sm:w-auto sm:animate-cta-bounce sm:hover:animate-none sm:hover:scale-105"
                >
                  <Link to="/contact" search={{}}>
                    {cms.cta.buttonLabel}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
    </>
  );
}

