import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { FaqContent, PageSeo } from "@/lib/cms/types";
import { faqPageJsonLd, pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "FAQ — OrderWeb POS & Custom Software";
const DESC =
  "Answers about OrderWeb pricing, commission-free POS, hardware, support, websites and custom software — for UK restaurant operators.";

export const Route = createFileRoute("/faq")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "faq", preview } });
    return page as { content: FaqContent; seo: PageSeo; preview: boolean };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/faq" }),
      pageBreadcrumbJsonLd("faq"),
      faqPageJsonLd(loaderData?.content.items ?? []),
    ),
  component: FaqPage,
});

function FaqPage() {
  const { content, preview } = Route.useLoaderData();

  return (
    <div className="overflow-x-hidden pb-16 pt-24 sm:pb-24 sm:pt-32">
      {preview ? (
        <div className="sticky top-0 z-[80] -mt-24 mb-6 bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white sm:-mt-32">
          Draft preview — not live. Publish from Admin to go live.
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl px-4 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.3em]">
          {content.eyebrow}
        </p>
        <h1 className="mt-3 text-[2.15rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl">
          {content.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#243447] sm:text-lg">
          {content.intro}
        </p>

        <Accordion type="single" collapsible className="mt-10 w-full sm:mt-12">
          {content.items.map((item, i) => (
            <AccordionItem
              key={`${item.question}-${i}`}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="py-5 text-left text-base text-[#0a1a4a] hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-[#243447] sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-2xl border border-border bg-surface/50 px-5 py-6 sm:px-7 sm:py-7">
          <h2 className="text-xl text-[#0a1a4a] sm:text-2xl">{content.ctaHeadline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {content.ctaBody}
          </p>
          <Link
            to="/contact"
            search={{}}
            className="btn-brand-gradient mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-white"
          >
            {content.ctaButtonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
