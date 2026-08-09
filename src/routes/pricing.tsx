import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingAddOns } from "@/components/pricing/PricingAddOns";
import { PricingHighlights } from "@/components/pricing/PricingHighlights";
import {
  parsePlanPrice,
  SavingsCalculator,
} from "@/components/pricing/SavingsCalculator";
import { Reveal } from "@/components/site/Reveal";
import commissionScale from "@/assets/pricing-commission-scale.png";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";
import type { PricingContent } from "@/lib/cms/types";

const TITLE = "Pricing — OrderWeb POS & Custom Software";
const DESC =
  "Flat £59.99/month. 0% order commission — unlike Uber Eats and other apps that take 30–35%. No setup fee. Optional white-label app (£500) and SMS at 5p.";

export const Route = createFileRoute("/pricing")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "pricing", preview } });
    return page as {
      content: PricingContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/pricing" }),
      pageBreadcrumbJsonLd("pricing"),
    ),
  component: PricingPage,
});

function PricingPage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const heroImage = cms.hero.image || commissionScale;
  const features = cms.plan.features.length ? cms.plan.features : [];

  return (
    <>
      {previewBanner}
      <div className="mx-auto max-w-6xl overflow-x-hidden px-4 pb-16 pt-24 sm:px-5 sm:pb-24 sm:pt-32">
      <Reveal>
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary sm:text-xs sm:tracking-[0.3em]">
              {cms.hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl text-[2.15rem] leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl">
              {cms.hero.headline}
            </h1>
            <p className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
              {cms.hero.body}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-3xl"
              aria-hidden
            />
            <img
              src={heroImage}
              alt="Scale comparing food-app commissions of 30–35% with OrderWeb at 0% flat rate and no hidden fees"
              width={1024}
              height={554}
              className="relative w-full animate-icon-float object-contain drop-shadow-[0_18px_40px_-22px_rgba(15,60,140,0.28)]"
              style={{ animationDuration: "4.8s" }}
              decoding="async"
            />
          </div>
        </div>
      </Reveal>

      <PricingHighlights highlights={cms.highlights} compare={cms.compare} />

      {/* Main offer */}
      <Reveal delay={160}>
        <section id="orderweb-pos" className="mt-16 scroll-mt-28">
          <div className="surface-panel relative flex flex-col overflow-hidden lg:flex-row">
            <div className="flex-1 p-5 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2">
                <Store className="size-5 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {cms.plan.label}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                  {cms.plan.price}
                </span>
                <span className="text-sm text-muted-foreground sm:text-base">
                  {cms.plan.priceSuffix}
                </span>
              </div>
              <p className="mt-4 max-w-lg text-sm text-muted-foreground">{cms.plan.summary}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/contact" search={{}}>
                    {cms.plan.primaryCta}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact" search={{}}>
                    {cms.plan.secondaryCta}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative lg:w-72">
              <div className="absolute inset-0 hidden bg-gradient-to-l from-primary/10 via-transparent to-transparent lg:block" />
              <div className="flex h-full flex-col items-stretch justify-center gap-3 p-5 sm:flex-row sm:p-6 lg:flex-col lg:items-center lg:justify-center lg:p-8">
                <div className="surface-panel w-full flex-1 p-4 text-center lg:flex-none">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    No setup fee
                  </p>
                  <p className="mt-1 text-2xl font-light">{cms.sideStats.setupFee}</p>
                </div>
                <div className="surface-panel w-full flex-1 p-4 text-center lg:flex-none">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    No commission
                  </p>
                  <p className="mt-1 text-2xl font-light">{cms.sideStats.commission}</p>
                </div>
                <div className="surface-panel w-full flex-1 p-4 text-center lg:flex-none">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Cancel any time
                  </p>
                  <p className="mt-1 text-2xl font-light">{cms.sideStats.billing}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {cms.notes ? (
        <Reveal delay={40}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground sm:mt-10">
            {cms.notes}
          </p>
        </Reveal>
      ) : null}

      {/* AI savings calculator */}
      <Reveal delay={80}>
        <div className="mt-16 sm:mt-24">
          <SavingsCalculator
            headline={cms.calculator.headline}
            body={cms.calculator.body}
            monthlyFee={parsePlanPrice(cms.plan.price)}
          />
        </div>
      </Reveal>

      <PricingAddOns addOns={cms.addOns} />
    </div>
    </>
  );
}
