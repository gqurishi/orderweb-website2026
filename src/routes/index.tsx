import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HeroScrollytelling } from "@/components/home/HeroScrollytelling";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { Reveal } from "@/components/site/Reveal";
import { getPublicAnalyticsFn, getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { HomeContent } from "@/lib/cms/types";
import {
  organizationJsonLd,
  webSiteJsonLd,
  withJsonLd,
} from "@/lib/site/jsonLd";
import { resolveSocialLinks, SITE_ORIGIN } from "@/lib/site/organization";

const TITLE = "OrderWeb — Restaurant POS & Custom Software Development";
const DESC =
  "Commission-free restaurant POS, online ordering, bookings, loyalty and delivery — plus bespoke websites, web apps and native iOS/Android development from a UK team.";

export const Route = createFileRoute("/")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const [page, site] = await Promise.all([
      getPublicPageFn({ data: { key: "home", preview } }),
      getPublicAnalyticsFn(),
    ]);
    return {
      ...(page as {
        content: HomeContent;
        seo: import("@/lib/cms/types").PageSeo;
        preview: boolean;
      }),
      socialSameAs: resolveSocialLinks({
        facebook: site.socialFacebook,
        instagram: site.socialInstagram,
        youtube: site.socialYoutube,
        x: site.socialX,
      }).map((s) => s.href),
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/" }),
      webSiteJsonLd(),
      organizationJsonLd(loaderData?.socialSameAs),
      {
        "@type": "SoftwareApplication",
        name: "OrderWeb POS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        url: `${SITE_ORIGIN}/restaurant-pos`,
        description:
          "All-in-one restaurant POS and online ordering platform with zero commission.",
        offers: {
          "@type": "Offer",
          price: "59.99",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
        },
        provider: { "@id": `${SITE_ORIGIN}/#organization` },
      },
    ),
  component: Home,
});

function Home() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;

  return (
    <>
      {previewBanner}
      <HeroScrollytelling content={{ hero: cms.hero, why: cms.why }} />
      <ServicesSection eyebrow={cms.services.eyebrow} headline={cms.services.headline} />

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-24">
          <Reveal>
            <div className="mb-8 text-center sm:mb-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary sm:text-sm sm:tracking-[0.35em]">
                {cms.reviews.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.85rem] sm:mt-4 sm:text-4xl">{cms.reviews.headline}</h2>
            </div>
          </Reveal>

          <ReviewsSection />

          <Reveal delay={120}>
            <div className="surface-panel mt-10 flex flex-col items-stretch gap-5 p-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-10">
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl">{cms.cta.headline}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{cms.cta.body}</p>
              </div>
              <Button
                asChild
                size="lg"
                className="btn-brand-gradient animate-cta-bounce h-12 w-full px-8 text-base hover:animate-none hover:scale-105 sm:h-16 sm:w-auto sm:min-w-[220px] sm:px-12 sm:text-lg"
              >
                <Link to="/contact" search={{}}>
                  {cms.cta.buttonLabel}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
