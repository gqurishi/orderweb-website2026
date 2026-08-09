import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AboutEditor } from "@/components/admin/AboutEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContactEditor } from "@/components/admin/ContactEditor";
import { DpaEditor } from "@/components/admin/DpaEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { ListField, SectionCard, TextField } from "@/components/admin/Field";
import { LegalPageEditor } from "@/components/admin/LegalPageEditor";
import { PricingEditor } from "@/components/admin/PricingEditor";
import { RestaurantPosEditor } from "@/components/admin/RestaurantPosEditor";
import { SoftwarePageEditor } from "@/components/admin/SoftwarePageEditor";
import { WebsitePageEditor } from "@/components/admin/WebsitePageEditor";
import { getAdminSessionFn } from "@/lib/admin/auth.functions";
import {
  getPageEditorFn,
  publishPageFn,
  revertPageFn,
  saveDraftFn,
} from "@/lib/cms/cms.functions";
import { PAGE_FIELD_HINTS, SEO_HINTS } from "@/lib/cms/fieldHints";
import type {
  AboutContent,
  AdminRole,
  ContactContent,
  DpaContent,
  FaqContent,
  HomeContent,
  LegalPageContent,
  PageKey,
  PageSeo,
  PageStatus,
  PricingContent,
  RestaurantPosContent,
  SoftwareContent,
  WebsiteContent,
} from "@/lib/cms/types";

const EDITABLE_KEYS: PageKey[] = [
  "home",
  "about",
  "pricing",
  "contact",
  "restaurant-pos",
  "website",
  "software",
  "privacy",
  "terms",
  "cookies",
  "faq",
  "dpa",
];

export const Route = createFileRoute("/owadmin/pages/$pageKey")({
  loader: async ({ params }) => {
    const key = params.pageKey as PageKey;
    if (!EDITABLE_KEYS.includes(key)) {
      throw redirect({ to: "/owadmin" });
    }
    const session = await getAdminSessionFn();
    if (!session.email) throw redirect({ to: "/owadmin" });
    const page = await getPageEditorFn({ data: { key } });
    return {
      email: session.email,
      role: (session.role ?? "admin") as AdminRole,
      page,
    };
  },
  component: PageEditorRoute,
});

function statusLabel(status: PageStatus) {
  if (status === "dirty") return "Unpublished changes";
  if (status === "draft") return "Draft (never published)";
  return "Published";
}

function PageEditorRoute() {
  const { email, role, page } = Route.useLoaderData();
  return (
    <AdminShell email={email} role={role}>
      <PageEditor
        pageKey={page.key}
        title={page.meta.title}
        publicPath={page.meta.path}
        initialContent={page.content}
        initialSeo={page.seo}
        initialStatus={page.status}
        draftUpdatedAt={page.draftUpdatedAt}
        publishedAt={page.publishedAt}
      />
    </AdminShell>
  );
}

function PageEditor({
  pageKey,
  title,
  publicPath,
  initialContent,
  initialSeo,
  initialStatus,
  draftUpdatedAt,
  publishedAt,
}: {
  pageKey: PageKey;
  title: string;
  publicPath: string;
  initialContent: unknown;
  initialSeo: PageSeo;
  initialStatus: PageStatus;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
}) {
  const saveDraft = useServerFn(saveDraftFn);
  const publish = useServerFn(publishPageFn);
  const revert = useServerFn(revertPageFn);
  const [content, setContent] = useState(initialContent);
  const [seo, setSeo] = useState(initialSeo);
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const hints = PAGE_FIELD_HINTS[pageKey];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-[#0a1a4a]">Edit {title}</h1>
          <p className="mt-1 text-sm text-[#243447]">
            Public path <code>{publicPath}</code>
            {draftUpdatedAt
              ? ` · Draft saved ${new Date(draftUpdatedAt).toLocaleString()}`
              : ""}
            {publishedAt ? ` · Published ${new Date(publishedAt).toLocaleString()}` : ""}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2f6fb8] ring-1 ring-[#61c3ec]/40">
            {statusLabel(status)}
          </p>
          {hints.general ? (
            <p className="mt-2 max-w-xl text-xs text-[#5b6b7c]">{hints.general}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${publicPath}${publicPath.includes("?") ? "&" : "?"}cmsPreview=1`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-full border border-[#61c3ec]/40 bg-white px-5 text-sm font-semibold text-[#0a1a4a]"
          >
            Preview draft
          </a>
          <button
            type="button"
            disabled={busy}
            className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-5 text-sm font-semibold text-[#0a1a4a] disabled:opacity-60"
            onClick={async () => {
              setBusy(true);
              try {
                await saveDraft({
                  data: {
                    key: pageKey,
                    content: content as Record<string, unknown>,
                    seo,
                  },
                });
                setStatus((s) => (s === "published" ? "dirty" : s === "draft" ? "draft" : "dirty"));
                toast.success("Draft saved");
              } catch {
                toast.error("Could not save draft");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="btn-brand-gradient h-11 rounded-full px-5 text-sm font-semibold text-white disabled:opacity-60"
            onClick={async () => {
              setBusy(true);
              try {
                await saveDraft({
                  data: {
                    key: pageKey,
                    content: content as Record<string, unknown>,
                    seo,
                  },
                });
                const res = await publish({ data: { key: pageKey } });
                if (!res.ok) {
                  toast.error(res.errors.join(" "));
                  return;
                }
                setStatus("published");
                toast.success("Published — live on website");
              } catch {
                toast.error("Publish failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Publish
          </button>
          <button
            type="button"
            disabled={busy || status === "published"}
            className="h-11 rounded-full border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 disabled:opacity-40"
            onClick={async () => {
              if (!confirm("Discard draft changes and restore the last published version?")) {
                return;
              }
              setBusy(true);
              try {
                const res = await revert({ data: { key: pageKey } });
                setContent(res.content);
                setSeo(res.seo);
                setStatus(res.status);
                toast.success("Reverted to last published");
              } catch {
                toast.error("Revert failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Revert
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SectionCard title="Search listing (Google / social)">
          <p className="-mt-2 text-xs text-[#5b6b7c]">
            Shown in Google and when someone shares the page link. Not the main page content.
          </p>
          <TextField
            label="Browser / Google title"
            value={seo.metaTitle}
            onChange={(metaTitle) => setSeo({ ...seo, metaTitle })}
            hint={SEO_HINTS.metaTitle}
            maxLength={70}
            required
          />
          <TextField
            label="Short description for Google"
            value={seo.metaDescription}
            onChange={(metaDescription) => setSeo({ ...seo, metaDescription })}
            hint={SEO_HINTS.metaDescription}
            maxLength={170}
            multiline
            required
          />
          <TextField
            label="Share image URL (optional)"
            value={seo.ogImage}
            onChange={(ogImage) => setSeo({ ...seo, ogImage })}
            hint={SEO_HINTS.ogImage}
          />
        </SectionCard>

        {hints.heroHeadline || hints.heroImage || hints.general ? (
          <p className="rounded-xl bg-white px-4 py-3 text-xs text-[#5b6b7c] ring-1 ring-[#61c3ec]/25">
            {[hints.general, hints.heroHeadline, hints.heroImage].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        {pageKey === "home" ? (
          <HomeEditor value={content as HomeContent} onChange={setContent} />
        ) : null}
        {pageKey === "about" ? (
          <AboutEditor value={content as AboutContent} onChange={setContent} />
        ) : null}
        {pageKey === "pricing" ? (
          <PricingEditor value={content as PricingContent} onChange={setContent} />
        ) : null}
        {pageKey === "contact" ? (
          <ContactEditor value={content as ContactContent} onChange={setContent} />
        ) : null}
        {pageKey === "restaurant-pos" ? (
          <RestaurantPosEditor
            value={content as RestaurantPosContent}
            onChange={setContent}
          />
        ) : null}
        {pageKey === "website" ? (
          <WebsitePageEditor value={content as WebsiteContent} onChange={setContent} />
        ) : null}
        {pageKey === "software" ? (
          <SoftwarePageEditor value={content as SoftwareContent} onChange={setContent} />
        ) : null}
        {pageKey === "privacy" ? (
          <LegalPageEditor
            value={content as LegalPageContent}
            onChange={setContent}
            pageLabel="Privacy"
          />
        ) : null}
        {pageKey === "terms" ? (
          <LegalPageEditor
            value={content as LegalPageContent}
            onChange={setContent}
            pageLabel="Terms"
          />
        ) : null}
        {pageKey === "cookies" ? (
          <LegalPageEditor
            value={content as LegalPageContent}
            onChange={setContent}
            pageLabel="Cookie Policy"
          />
        ) : null}
        {pageKey === "faq" ? (
          <FaqEditor value={content as FaqContent} onChange={setContent} />
        ) : null}
        {pageKey === "dpa" ? (
          <DpaEditor value={content as DpaContent} onChange={setContent} />
        ) : null}
      </div>
    </div>
  );
}

function HomeEditor({
  value,
  onChange,
}: {
  value: HomeContent;
  onChange: (v: HomeContent) => void;
}) {
  return (
    <>
      <SectionCard title="Hero">
        <TextField
          label="Eyebrow"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
        />
        <TextField
          label="Headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          multiline
        />
        <TextField
          label="Subhead"
          value={value.hero.subhead}
          onChange={(subhead) => onChange({ ...value, hero: { ...value.hero, subhead } })}
          multiline
        />
        <TextField
          label="Primary CTA"
          value={value.hero.primaryCta}
          onChange={(primaryCta) =>
            onChange({ ...value, hero: { ...value.hero, primaryCta } })
          }
        />
        <TextField
          label="Secondary CTA"
          value={value.hero.secondaryCta}
          onChange={(secondaryCta) =>
            onChange({ ...value, hero: { ...value.hero, secondaryCta } })
          }
        />
        <TextField
          label="Desktop image URL"
          value={value.hero.imageDesktop}
          onChange={(imageDesktop) =>
            onChange({ ...value, hero: { ...value.hero, imageDesktop } })
          }
          hint="Paste from Media library (optional)"
        />
        <TextField
          label="Mobile image URL"
          value={value.hero.imageMobile}
          onChange={(imageMobile) => onChange({ ...value, hero: { ...value.hero, imageMobile } })}
        />
      </SectionCard>
      <SectionCard title="Why OrderWeb">
        <TextField
          label="Eyebrow"
          value={value.why.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, why: { ...value.why, eyebrow } })}
        />
        <TextField
          label="Headline"
          value={value.why.headline}
          onChange={(headline) => onChange({ ...value, why: { ...value.why, headline } })}
        />
        <TextField
          label="Image URL"
          value={value.why.image}
          onChange={(image) => onChange({ ...value, why: { ...value.why, image } })}
        />
        <ListField
          label="Points"
          value={value.why.points}
          onChange={(points) => onChange({ ...value, why: { ...value.why, points } })}
        />
        <ListField
          label="Point bodies"
          value={value.why.pointBodies}
          onChange={(pointBodies) =>
            onChange({ ...value, why: { ...value.why, pointBodies } })
          }
          hint="One body per line — aligns with points by line order"
        />
      </SectionCard>
      <SectionCard title="Services">
        <TextField
          label="Eyebrow"
          value={value.services.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, services: { ...value.services, eyebrow } })
          }
        />
        <TextField
          label="Headline"
          value={value.services.headline}
          onChange={(headline) =>
            onChange({ ...value, services: { ...value.services, headline } })
          }
        />
      </SectionCard>
      <SectionCard title="Reviews">
        <TextField
          label="Eyebrow"
          value={value.reviews.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, reviews: { ...value.reviews, eyebrow } })}
        />
        <TextField
          label="Headline"
          value={value.reviews.headline}
          onChange={(headline) =>
            onChange({ ...value, reviews: { ...value.reviews, headline } })
          }
        />
      </SectionCard>
      <SectionCard title="CTA">
        <TextField
          label="Headline"
          value={value.cta.headline}
          onChange={(headline) => onChange({ ...value, cta: { ...value.cta, headline } })}
        />
        <TextField
          label="Body"
          value={value.cta.body}
          onChange={(body) => onChange({ ...value, cta: { ...value.cta, body } })}
          multiline
        />
        <TextField
          label="Button label"
          value={value.cta.buttonLabel}
          onChange={(buttonLabel) => onChange({ ...value, cta: { ...value.cta, buttonLabel } })}
        />
      </SectionCard>
    </>
  );
}
