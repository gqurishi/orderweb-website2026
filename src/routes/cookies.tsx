import { createFileRoute } from "@tanstack/react-router";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { LegalBody } from "@/lib/cms/legalBody";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { LegalPageContent, PageSeo } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "Cookie & Similar Technologies Policy — OrderWeb";
const DESC =
  "How OrderWeb Ltd uses cookies and similar technologies under UK PECR and data-protection rules across our websites and restaurant applications.";

export const Route = createFileRoute("/cookies")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "cookies", preview } });
    return page as { content: LegalPageContent; seo: PageSeo; preview: boolean };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/cookies" }),
      pageBreadcrumbJsonLd("cookies"),
    ),
  component: CookiesPage,
});

function CookiesPage() {
  const { content, preview } = Route.useLoaderData();

  return (
    <>
      {preview ? (
        <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
          Draft preview — not live. Publish from Admin to go live.
        </div>
      ) : null}
      <LegalPageShell
        eyebrow={content.eyebrow}
        title={content.title}
        intro={content.intro}
        updated={content.updated}
      >
        {content.sections.map((section, i) => (
          <LegalSection key={`${section.title}-${i}`} title={section.title}>
            <LegalBody text={section.body} />
          </LegalSection>
        ))}
      </LegalPageShell>
    </>
  );
}
