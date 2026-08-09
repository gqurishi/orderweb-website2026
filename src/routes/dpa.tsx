import { createFileRoute } from "@tanstack/react-router";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { LegalBody } from "@/lib/cms/legalBody";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { DpaContent, PageSeo } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "Data Processing Agreement (DPA) — OrderWeb";
const DESC =
  "OrderWeb Ltd UK GDPR Article 28 Data Processing Agreement for restaurant Controllers using our multi-tenant SaaS platform.";

export const Route = createFileRoute("/dpa")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "dpa", preview } });
    return page as { content: DpaContent; seo: PageSeo; preview: boolean };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/dpa" }),
      pageBreadcrumbJsonLd("dpa"),
    ),
  component: DpaPage,
});

function DpaPage() {
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
        {content.callout.trim() ? (
          <div className="rounded-xl border border-border bg-surface/50 px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
            <LegalBody text={content.callout} />
          </div>
        ) : null}

        {content.sections.map((section, i) => (
          <LegalSection key={`${section.title}-${i}`} title={section.title}>
            <LegalBody text={section.body} />
          </LegalSection>
        ))}

        <LegalSection title={content.scheduleTitle}>
          {content.scheduleIntro.trim() ? <LegalBody text={content.scheduleIntro} /> : null}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-surface/80 text-[#0a1a4a]">
                <tr className="border-b border-border">
                  <th className="px-3 py-3 font-medium sm:px-4">Sub-processor</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Core processing activity</th>
                  <th className="px-3 py-3 font-medium sm:px-4">
                    Geographic region &amp; safeguards
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.subProcessors.map((row) => (
                  <tr key={row.entity} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 align-top font-medium text-[#0a1a4a] sm:px-4">
                      {row.entity}
                    </td>
                    <td className="px-3 py-3 align-top text-muted-foreground sm:px-4">
                      {row.activity}
                    </td>
                    <td className="px-3 py-3 align-top text-muted-foreground sm:px-4">
                      {row.region}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>

        <LegalSection title={content.executionTitle}>
          {content.executionIntro.trim() ? <LegalBody text={content.executionIntro} /> : null}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background px-4 py-5 sm:px-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                {content.processorLabel}
              </p>
              <p className="mt-2 font-medium text-[#0a1a4a]">{content.processorName}</p>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <p>Authorised signature: _______________________</p>
                <p>Name: ____________________________________</p>
                <p>Title: _____________________________________</p>
                <p>Date: _____________________________________</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-5 sm:px-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                {content.controllerLabel}
              </p>
              <p className="mt-2 font-medium text-[#0a1a4a]">{content.controllerName}</p>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <p>Authorised signature: _______________________</p>
                <p>Name: ____________________________________</p>
                <p>Title: _____________________________________</p>
                <p>Date: _____________________________________</p>
              </div>
            </div>
          </div>
          {content.relatedNote.trim() ? (
            <div className="text-sm text-muted-foreground">
              <LegalBody text={content.relatedNote} />
            </div>
          ) : null}
        </LegalSection>
      </LegalPageShell>
    </>
  );
}
