import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Layers,
  Monitor,
  Paintbrush,
  Rocket,
  Smartphone,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { SoftwareStageTheater } from "@/components/site/SoftwareStageTheater";
import softwarePhoneHero from "@/assets/software-phone-hero.png";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { SoftwareContent } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "Custom Software — Web Apps & Mobile Apps | OrderWeb";
const DESC =
  "OrderWeb builds custom web applications and native mobile apps to your requirements — design, development, launch and ongoing support.";

export const Route = createFileRoute("/software")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "software", preview } });
    return page as {
      content: SoftwareContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/software" }),
      pageBreadcrumbJsonLd("software"),
    ),
  component: SoftwarePage,
});

const PROCESS_ICONS = [Compass, Paintbrush, Layers, Rocket, Wrench];

function SoftwarePage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImage = cms.hero.image || softwarePhoneHero;
  const webProduct = {
    ...cms.products.web,
    icon: Monitor,
  };
  const mobileProduct = {
    ...cms.products.mobile,
    icon: Smartphone,
  };
  const process = cms.process.steps.map((step, i) => ({
    ...step,
    icon: PROCESS_ICONS[i % PROCESS_ICONS.length]!,
  }));

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }] = await Promise.all([import("gsap")]);
      if (cancelled || !heroRef.current) return;

      ctx = gsap.context(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        gsap.fromTo(
          heroRef.current!.querySelectorAll(".hero-anim:not(.hero-phone)"),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
          },
        );

        gsap.fromTo(
          heroRef.current!.querySelector(".hero-phone"),
          { opacity: 0, y: 40, scale: 0.88, rotate: 4 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 1.15,
            delay: 0.2,
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
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-border/60 pt-24 pb-12 sm:pt-32 sm:pb-20"
      >
        {/* Atmospheric background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 85% 40%, rgba(97, 195, 236, 0.38) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 10% 20%, rgba(171, 234, 253, 0.45) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 50% 100%, rgba(47, 111, 184, 0.14) 0%, transparent 55%), linear-gradient(165deg, #f3f9fc 0%, #e8f4fa 42%, #f7fafc 100%)",
            }}
          />
          <div
            className="absolute -right-16 top-10 hidden size-[420px] rounded-full opacity-50 blur-3xl sm:block sm:size-[520px]"
            style={{
              background: "radial-gradient(circle, rgba(47, 111, 184, 0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -left-20 bottom-0 hidden size-[280px] rounded-full opacity-40 blur-3xl sm:block"
            style={{
              background: "radial-gradient(circle, rgba(171, 234, 253, 0.7) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(10, 26, 74, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10, 26, 74, 0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 70% 60% at 70% 45%, black 20%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-10 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
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
            <div className="hero-anim mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[#243447]/75 sm:mt-10 sm:gap-3 sm:text-xs sm:tracking-[0.22em]">
              {cms.hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#61c3ec]/35 bg-white/70 px-3 py-1.5"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <figure className="hero-anim hero-phone software-phone-stage relative mx-auto flex w-full max-w-[220px] items-center justify-center sm:max-w-[300px] lg:max-w-[320px]">
            <div
              aria-hidden
              className="software-phone-glow absolute left-1/2 top-1/2 size-[78%] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(97, 195, 236, 0.55) 0%, rgba(47, 111, 184, 0.22) 48%, transparent 72%)",
              }}
            />
            <div
              aria-hidden
              className="software-phone-ring pointer-events-none absolute left-1/2 top-[52%] hidden h-[88%] w-[72%] rounded-[46%] border border-dashed border-[#61c3ec]/40 sm:block"
            />
            <div
              aria-hidden
              className="software-phone-ring pointer-events-none absolute left-1/2 top-[52%] hidden h-[72%] w-[58%] rounded-[46%] border border-dotted border-primary/25 sm:block"
              style={{ animationDelay: "-2.2s", animationDuration: "8s" }}
            />
            <div className="animate-software-phone relative">
              <img
                src={heroImage}
                alt="Mobile app development — code and live app preview on a phone"
                width={416}
                height={811}
                className="relative z-[1] mx-auto h-auto w-full object-contain drop-shadow-[0_28px_48px_rgba(10,26,74,0.32)]"
                loading="eager"
              />
              <span
                aria-hidden
                className="software-phone-shine pointer-events-none absolute inset-[3%] z-[2] hidden overflow-hidden sm:block"
              />
            </div>
          </figure>
        </div>
      </section>

      <div id="software">
        <SoftwareStageTheater webProduct={webProduct} mobileProduct={mobileProduct} />
      </div>

      {/* Always stays below the slide stages */}
      <ProcessTimeline
        eyebrow={cms.process.eyebrow}
        title={cms.process.headline}
        subtitle={cms.process.subtitle}
        steps={process}
        compact
      />

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-5">
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#61c3ec]/25 bg-primary/5 p-6 text-center sm:gap-6 sm:p-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:tracking-[0.3em]">
                {cms.cta.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.75rem] text-[#0a1a4a] sm:text-4xl">
                {cms.cta.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#243447] sm:text-[15px]">
                {cms.cta.body}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="btn-brand-gradient w-full sm:w-auto sm:animate-cta-bounce sm:hover:animate-none sm:hover:scale-105"
            >
              <Link to="/contact" search={{}}>
                {cms.cta.buttonLabel}
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
    </>
  );
}
