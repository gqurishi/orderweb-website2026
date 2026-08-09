import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AppWindow,
  BadgePercent,
  LockKeyhole,
  MonitorSmartphone,
  PackagePlus,
  Smartphone,
  Store,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import aboutFloorStory from "@/assets/about-floor-story.png";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { AboutContent } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "About OrderWeb — Built by Hospitality, for Hospitality";
const DESC =
  "OrderWeb was built by someone who spent 8 years working restaurant floors. One transparent price, your own hardware, no add-on traps — plus a full custom software studio.";

export const Route = createFileRoute("/about")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "about", preview } });
    return page as {
      content: AboutContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/about" }),
      pageBreadcrumbJsonLd("about"),
    ),
  component: AboutPage,
});

const PROBLEMS = [
  {
    icon: PackagePlus,
    hit: "Extra modules",
    title: "Useful features sold as add-ons",
    body: "Ordering, bookings, gift cards and loyalty get taken out of the base plan — then billed again every month.",
  },
  {
    icon: TrendingUp,
    hit: "£200–£300+/mo",
    title: "Monthly costs that keep rising",
    body: "Subscriptions, commissions and required modules stack up until you’re paying hundreds a month just to stay open.",
  },
  {
    icon: LockKeyhole,
    hit: "Locked hardware",
    title: "Hardware you can’t take with you",
    body: "You’re pushed into special terminals. If you switch later, that equipment is often useless.",
  },
  {
    icon: BadgePercent,
    hit: "Cut of every order",
    title: "Commission on your own sales",
    body: "Third-party platforms take a share of every order — money your team earned on a busy Friday night.",
  },
];

const DIFFERENCE = [
  {
    icon: MonitorSmartphone,
    title: "Use the hardware you already own",
    body: "OrderWeb runs on your Windows devices, screens and printers. No forced kit. No lock-in.",
  },
  {
    icon: Tag,
    title: "One clear price for everything",
    body: "POS, online ordering, reservations, gift cards, loyalty, delivery dispatch and payments — all in one subscription.",
  },
  {
    icon: Zap,
    title: "Built for real service speed",
    body: "Faster order entry, fewer kitchen mistakes, and smoother table turns — shaped by real floor experience.",
  },
];

const STUDIO = [
  {
    icon: AppWindow,
    title: "Custom web applications",
    body: "Platforms, portals and internal tools built around how your business actually works.",
  },
  {
    icon: Smartphone,
    title: "iOS and Android apps",
    body: "Mobile apps built for speed and shipped to the App Store and Google Play.",
  },
  {
    icon: Store,
    title: "Brand-led digital experiences",
    body: "White-label products and custom storefronts that keep the customer relationship yours.",
  },
];

function AboutPage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const pageRef = useRef<HTMLDivElement>(null);
  const storyImage = cms.hero.image || aboutFloorStory;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !pageRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const heroItems = pageRef.current!.querySelectorAll(".about-hero-anim");
        const heroVisual = pageRef.current!.querySelector(".about-hero-visual");
        const heroStats = pageRef.current!.querySelectorAll(".about-stat-live");
        if (reduce) {
          gsap.set([heroItems, heroVisual, heroStats].filter(Boolean), {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
          });
        } else {
          gsap.fromTo(
            heroItems,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.12 },
          );
          if (heroVisual) {
            gsap.fromTo(
              heroVisual,
              { opacity: 0, x: 48, scale: 0.88, rotate: 2.5 },
              {
                opacity: 1,
                x: 0,
                scale: 1,
                rotate: 0,
                duration: 1.15,
                ease: "back.out(1.15)",
                delay: 0.12,
              },
            );
            const sparks = heroVisual.querySelectorAll(".about-hero-spark");
            if (sparks.length) {
              gsap.fromTo(
                sparks,
                { opacity: 0, scale: 0 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.5,
                  ease: "back.out(2)",
                  stagger: 0.1,
                  delay: 0.55,
                },
              );
            }
          }
          if (heroStats.length) {
            gsap.fromTo(
              heroStats,
              { opacity: 0, y: 16, scale: 0.96 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                ease: "power3.out",
                stagger: 0.1,
                delay: 0.45,
                clearProps: "transform",
              },
            );
          }
        }

        pageRef.current!.querySelectorAll<HTMLElement>(".about-section").forEach((section) => {
          const heading = section.querySelectorAll(".about-heading > *");
          const cards = section.querySelectorAll<HTMLElement>(".about-card");
          const lines = section.querySelectorAll(".about-line");
          const panel = section.querySelector(".about-panel");
          const icons = section.querySelectorAll<HTMLElement>(".about-card-icon");

          if (reduce) {
            gsap.set([heading, cards, lines, panel, icons].filter(Boolean), {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              rotate: 0,
            });
            return;
          }

          if (heading.length) {
            gsap.fromTo(
              heading,
              { opacity: 0, y: 26 },
              {
                opacity: 1,
                y: 0,
                duration: 0.75,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 78%", once: true },
              },
            );
          }

          if (cards.length) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.65,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "transform",
                scrollTrigger: { trigger: section, start: "top 72%", once: true },
              },
            );
            gsap.set(icons, { opacity: 1, visibility: "visible", clearProps: "transform" });
          }

          if (lines.length) {
            gsap.fromTo(
              lines,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 62%", once: true },
              },
            );
          }

          if (panel) {
            gsap.fromTo(
              panel,
              { opacity: 0, y: 40, scale: 0.98 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 80%", once: true },
              },
            );
          }
        });
      }, pageRef);

      requestAnimationFrame(() => ScrollTrigger.refresh());
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <>
      {previewBanner}
      <div ref={pageRef} className="overflow-x-hidden pb-16 sm:pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 pt-24 pb-12 sm:pt-32 sm:pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 75% 65% at 88% 30%, rgba(97,195,236,0.4) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 8% 20%, rgba(171,234,253,0.48) 0%, transparent 50%), radial-gradient(ellipse 50% 55% at 40% 100%, rgba(47,111,184,0.12) 0%, transparent 55%), linear-gradient(165deg, #f3f9fc 0%, #e8f4fa 40%, #f8fafc 100%)",
            }}
          />
          <div
            className="absolute -right-20 top-10 hidden size-[420px] rounded-full blur-3xl sm:block"
            style={{
              background: "radial-gradient(circle, rgba(47,111,184,0.28) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-10 sm:px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div className="min-w-0">
            <p className="about-hero-anim text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
              {cms.hero.eyebrow}
            </p>
            <h1 className="about-hero-anim mt-3 max-w-xl text-[2.15rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl lg:text-6xl">
              {cms.hero.headline}
            </h1>
            <p className="about-hero-anim mt-4 max-w-xl text-base leading-relaxed text-[#243447] sm:mt-6 sm:text-lg">
              {cms.hero.body1}
            </p>
            <p className="about-hero-anim mt-3 max-w-xl text-base leading-relaxed text-[#243447] sm:mt-4 sm:text-lg">
              {cms.hero.body2}
            </p>
          </div>

          <div className="about-hero-visual relative mx-auto w-full max-w-md sm:max-w-xl lg:max-w-none">
            <div
              aria-hidden
              className="about-hero-glow absolute left-1/2 top-[48%] size-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(97,195,236,0.42) 0%, rgba(47,111,184,0.16) 48%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="about-hero-orbit pointer-events-none absolute left-1/2 top-[46%] hidden h-[78%] w-[86%] rounded-[50%] border border-dashed border-[#61c3ec]/35 sm:block"
            />
            <div
              aria-hidden
              className="about-hero-orbit-slow pointer-events-none absolute left-1/2 top-[46%] hidden h-[62%] w-[70%] rounded-[50%] border border-dotted border-[#2f6fb8]/25 sm:block"
            />
            {(
              [
                { className: "left-[10%] top-[18%] size-2", delay: "0s" },
                { className: "right-[12%] top-[24%] size-1.5", delay: "0.45s" },
                { className: "left-[16%] bottom-[28%] size-1.5", delay: "0.9s" },
                { className: "right-[14%] bottom-[22%] size-2", delay: "1.3s" },
              ] as const
            ).map((spark) => (
              <span
                key={spark.className}
                aria-hidden
                className={`about-hero-spark pointer-events-none absolute z-[2] hidden rounded-full bg-[#61c3ec] shadow-[0_0_12px_rgba(97,195,236,0.75)] sm:block ${spark.className}`}
                style={{ animationDelay: spark.delay }}
              />
            ))}
            {/* On mobile, crop tiny baked-in captions; readable HTML stats sit below */}
            <div className="relative z-[1] mx-auto max-sm:aspect-[1.05/1] max-sm:overflow-hidden">
              <img
                src={storyImage}
                alt="OrderWeb story: from chaotic restaurant service to one clear platform — 8 years on the floor, £59.99 all-in, 0% commission"
                className="animate-about-hero mx-auto h-full w-full object-cover object-[center_8%] drop-shadow-[0_24px_50px_rgba(10,26,74,0.18)] sm:h-auto sm:object-contain sm:object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
              >
                <div className="about-hero-shine absolute inset-0" />
              </div>
            </div>

            <div className="relative z-[1] mt-3 grid gap-2 sm:hidden">
              {[
                { stat: "8 yrs", label: "On the floor before a line of code" },
                { stat: "£59.99", label: "One price, everything included" },
                { stat: "0%", label: "Commission on your own orders" },
              ].map((s) => (
                <div
                  key={s.stat}
                  className="about-stat-live flex items-center gap-3 rounded-xl border border-[#61c3ec]/30 bg-white/95 px-3 py-2.5"
                >
                  <p className="min-w-[4.5rem] text-base font-semibold text-[#0a1a4a]">{s.stat}</p>
                  <p className="text-sm leading-snug text-[#243447]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="about-section relative overflow-hidden border-b border-border/60 py-14 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 10% 20%, rgba(171,234,253,0.4) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 90% 80%, rgba(47,111,184,0.1) 0%, transparent 50%), linear-gradient(165deg, #f7fbfd 0%, #eef6fb 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-5">
          <div className="about-heading max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
              {cms.problem.eyebrow}
            </p>
            <h2 className="mt-3 text-[1.75rem] leading-tight text-[#0a1a4a] sm:mt-4 sm:text-4xl lg:text-5xl">
              {cms.problem.headline}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
              {cms.problem.subhead}
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5">
            {cms.problem.cards.map((p, i) => (
              <li
                key={`${p.title}-${i}`}
                className="about-card group flex gap-3 rounded-2xl border border-[#61c3ec]/25 bg-white/90 p-4 sm:gap-4 sm:p-6"
              >
                <span className="about-card-icon mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11">
                  {(() => {
                    const Icon = PROBLEMS[i % PROBLEMS.length]!.icon;
                    return <Icon aria-hidden />;
                  })()}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.14em]">
                    {p.hit || PROBLEMS[i % PROBLEMS.length]!.hit}
                  </p>
                  <h3 className="mt-1.5 text-lg leading-snug text-[#0a1a4a] sm:mt-2 sm:text-xl">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#243447] sm:mt-2 sm:text-base">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="about-line mx-auto mt-8 max-w-4xl px-1 text-center text-base font-medium leading-snug text-[#0a1a4a] sm:mt-12 sm:whitespace-nowrap sm:text-lg lg:text-xl">
            We knew there had to be a fairer, smarter way to run restaurant tech.
          </p>
        </div>
      </section>

      {/* Difference */}
      <section className="about-section mx-auto mt-14 max-w-6xl px-4 sm:mt-28 sm:px-5">
        <div className="about-heading max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
            {cms.difference.eyebrow}
          </p>
          <h2 className="mt-3 text-[1.75rem] leading-tight text-[#0a1a4a] sm:mt-4 sm:text-4xl lg:text-5xl">
            {cms.difference.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
            {cms.difference.subhead}
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {cms.difference.cards.map((d, i) => (
            <div
              key={`${d.title}-${i}`}
              className="about-card group h-full rounded-2xl border border-[#61c3ec]/25 bg-white p-5 sm:p-7"
            >
              <span className="about-card-icon flex size-10 items-center justify-center rounded-full sm:size-11">
                {(() => {
                  const Icon = DIFFERENCE[i % DIFFERENCE.length]!.icon;
                  return <Icon aria-hidden />;
                })()}
              </span>
              <h3 className="mt-4 text-lg leading-snug text-[#0a1a4a] sm:mt-5 sm:text-xl">
                {d.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#243447] sm:mt-3 sm:text-base">
                {d.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Studio */}
      <section className="about-section relative mt-14 overflow-hidden border-y border-border/60 py-14 sm:mt-28 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 85% 30%, rgba(97,195,236,0.28) 0%, transparent 55%), linear-gradient(165deg, #f3f9fc 0%, #eef6fb 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-5">
          <div className="about-heading max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
              {cms.studio.eyebrow}
            </p>
            <h2 className="mt-3 text-[1.75rem] leading-tight text-[#0a1a4a] sm:mt-4 sm:text-4xl lg:text-5xl">
              {cms.studio.headline}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
              {cms.studio.subhead}
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-5 md:grid-cols-3">
            {cms.studio.cards.map((s, i) => (
              <div
                key={`${s.title}-${i}`}
                className="about-card group h-full rounded-2xl border border-[#61c3ec]/25 bg-white/90 p-5 sm:p-7"
              >
                <span className="about-card-icon flex size-10 items-center justify-center rounded-full sm:size-11">
                  {(() => {
                    const Icon = STUDIO[i % STUDIO.length]!.icon;
                    return <Icon aria-hidden />;
                  })()}
                </span>
                <h3 className="mt-4 text-lg leading-snug text-[#0a1a4a] sm:mt-5 sm:text-xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#243447] sm:mt-3 sm:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section mx-auto mt-14 max-w-6xl px-4 sm:mt-28 sm:px-5">
        <div
          className="about-panel relative overflow-hidden rounded-2xl border border-[#61c3ec]/25 p-6 sm:p-14"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 90% 10%, rgba(171,234,253,0.55) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(47,111,184,0.14) 0%, transparent 55%), linear-gradient(145deg, #f7fbfd 0%, #ffffff 55%, #eef6fb 100%)",
          }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
            {cms.mission.eyebrow}
          </p>
          <p className="mt-4 max-w-3xl text-xl leading-snug text-[#0a1a4a] sm:mt-6 sm:text-3xl">
            {cms.mission.statement}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button asChild className="btn-brand-gradient w-full sm:w-auto">
              <Link to="/contact" search={{}}>
                {cms.mission.primaryCta}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/pricing">{cms.mission.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
