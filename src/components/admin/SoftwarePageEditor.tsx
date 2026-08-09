import {
  CardBlock,
  EditorPart,
  ListField,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { SoftwareContent, SoftwareProductBlock } from "@/lib/cms/types";

const PARTS = [
  { part: 1, title: "Hero" },
  { part: 2, title: "Web applications" },
  { part: 3, title: "Mobile apps" },
  { part: 4, title: "Process" },
  { part: 5, title: "Bottom button" },
] as const;

function ProductPart({
  part,
  title,
  summary,
  value,
  onChange,
  defaultOpen,
}: {
  part: number;
  title: string;
  summary: string;
  value: SoftwareProductBlock;
  onChange: (v: SoftwareProductBlock) => void;
  defaultOpen?: boolean;
}) {
  return (
    <EditorPart part={part} title={title} summary={summary} defaultOpen={defaultOpen}>
      <TextField
        label="Small label"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
        hint='Example: "01 — Web applications"'
      />
      <TextField
        label="Block title"
        value={value.title}
        onChange={(titleText) => onChange({ ...value, title: titleText })}
      />
      <TextField
        label="Short description"
        value={value.body}
        onChange={(body) => onChange({ ...value, body })}
        multiline
      />
      <ListField
        label="What’s included (one point per line)"
        value={value.points}
        onChange={(points) => onChange({ ...value, points })}
      />
      <ListField
        label="Tech / stack chips (one per line)"
        value={value.stack}
        onChange={(stack) => onChange({ ...value, stack })}
        hint='Example: Node / Postgres / Auth'
      />
    </EditorPart>
  );
}

export function SoftwarePageEditor({
  value,
  onChange,
}: {
  value: SoftwareContent;
  onChange: (v: SoftwareContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          Software page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          Matches /software top → bottom. Open one part, edit, then Save draft → Preview → Publish.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <a
              key={p.part}
              href={`#editor-part-${p.part}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#61c3ec]/35 bg-[#f3f9fc] px-3 py-1.5 text-sm font-medium text-[#0a1a4a] transition hover:border-[#2f6fb8] hover:bg-white"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f6fb8] text-[10px] font-semibold text-white">
                {p.part}
              </span>
              {p.title}
            </a>
          ))}
        </div>
      </div>

      <EditorPart
        part={1}
        title="Hero"
        summary="Top of the Software page — label, headline, chips, button, and phone picture."
        defaultOpen
      >
        <TextField
          label="Small label"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "Software"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          maxLength={100}
          required
        />
        <TextField
          label="Short supporting line"
          value={value.hero.body}
          onChange={(body) => onChange({ ...value, hero: { ...value.hero, body } })}
          multiline
        />
        <TextField
          label="Primary button text"
          value={value.hero.primaryCta}
          onChange={(primaryCta) =>
            onChange({ ...value, hero: { ...value.hero, primaryCta } })
          }
          hint='Example: "Share your requirements"'
        />
        <ListField
          label="Chips under the hero (one per line)"
          value={value.hero.chips}
          onChange={(chips) => onChange({ ...value, hero: { ...value.hero, chips } })}
          hint='Example: Web applications / Mobile apps'
        />
        <ImageReplaceField
          label="Hero picture (phone)"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.softwarePhone}
          hint="Click Replace picture to upload — no URL needed."
          folder="software"
        />
      </EditorPart>

      <ProductPart
        part={2}
        title="Web applications"
        summary="First product block — custom web apps / portals."
        value={value.products.web}
        onChange={(web) => onChange({ ...value, products: { ...value.products, web } })}
      />

      <ProductPart
        part={3}
        title="Mobile apps"
        summary="Second product block — iOS and Android apps."
        value={value.products.mobile}
        onChange={(mobile) =>
          onChange({ ...value, products: { ...value.products, mobile } })
        }
      />

      <EditorPart
        part={4}
        title="Process"
        summary="“How a project runs” timeline steps."
      >
        <TextField
          label="Small label"
          value={value.process.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, process: { ...value.process, eyebrow } })
          }
        />
        <TextField
          label="Section headline"
          value={value.process.headline}
          onChange={(headline) =>
            onChange({ ...value, process: { ...value.process, headline } })
          }
        />
        <TextField
          label="Short intro under the headline"
          value={value.process.subtitle}
          onChange={(subtitle) =>
            onChange({ ...value, process: { ...value.process, subtitle } })
          }
          multiline
        />

        <p className="text-sm font-medium text-[#0a1a4a]">
          Timeline steps
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">
            ({value.process.steps.length})
          </span>
        </p>
        {value.process.steps.map((step, index) => (
          <CardBlock
            key={`proc-${index}`}
            label={`Step ${step.step || index + 1}: ${step.title || "Untitled"}`}
          >
            <TextField
              label="Step number"
              value={step.step}
              onChange={(stepNo) => {
                const steps = value.process.steps.map((s, i) =>
                  i === index ? { ...s, step: stepNo } : s,
                );
                onChange({ ...value, process: { ...value.process, steps } });
              }}
              hint='Example: "01"'
            />
            <TextField
              label="Step title"
              value={step.title}
              onChange={(title) => {
                const steps = value.process.steps.map((s, i) =>
                  i === index ? { ...s, title } : s,
                );
                onChange({ ...value, process: { ...value.process, steps } });
              }}
            />
            <TextField
              label="Step text"
              value={step.body}
              onChange={(body) => {
                const steps = value.process.steps.map((s, i) =>
                  i === index ? { ...s, body } : s,
                );
                onChange({ ...value, process: { ...value.process, steps } });
              }}
              multiline
            />
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={5}
        title="Bottom button"
        summary="Closing section at the bottom of the page."
      >
        <TextField
          label="Small label"
          value={value.cta.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, cta: { ...value.cta, eyebrow } })}
        />
        <TextField
          label="Closing headline"
          value={value.cta.headline}
          onChange={(headline) => onChange({ ...value, cta: { ...value.cta, headline } })}
        />
        <TextField
          label="Short supporting line"
          value={value.cta.body}
          onChange={(body) => onChange({ ...value, cta: { ...value.cta, body } })}
          multiline
        />
        <TextField
          label="Button text"
          value={value.cta.buttonLabel}
          onChange={(buttonLabel) =>
            onChange({ ...value, cta: { ...value.cta, buttonLabel } })
          }
        />
      </EditorPart>
    </div>
  );
}
