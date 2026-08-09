import {
  CardBlock,
  EditorPart,
  ListField,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { RestaurantPosContent } from "@/lib/cms/types";

const PARTS = [
  { part: 1, title: "Hero" },
  { part: 2, title: "Product tour" },
  { part: 3, title: "Why choose OrderWeb" },
  { part: 4, title: "Payments" },
  { part: 5, title: "Feature map" },
  { part: 6, title: "Bottom button" },
] as const;

export function RestaurantPosEditor({
  value,
  onChange,
}: {
  value: RestaurantPosContent;
  onChange: (v: RestaurantPosContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          Restaurant POS page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          Matches /restaurant-pos top → bottom. Open one part, edit, then Save draft → Preview →
          Publish.
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
        summary="Top of the page — label, headline, short intro, and the hardware picture."
        defaultOpen
      >
        <TextField
          label="Small label"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "Restaurant management system"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          hint="Product benefit in one line — under ~70 characters"
          maxLength={90}
          required
        />
        <TextField
          label="Short supporting line"
          value={value.hero.body}
          onChange={(body) => onChange({ ...value, hero: { ...value.hero, body } })}
          multiline
        />
        <TextField
          label="Book a demo button"
          value={value.hero.primaryCta}
          onChange={(primaryCta) =>
            onChange({ ...value, hero: { ...value.hero, primaryCta } })
          }
          hint='Shown under the product tour (above the laptop). Links to Contact. Example: "Book a demo"'
        />
        <ImageReplaceField
          label="Hero picture (till / hardware)"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.posHardware}
          hint="Right-side product image. Click Replace picture to upload — no URL needed."
          folder="restaurant-pos"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Product tour"
        summary="Section above the laptop screen showcase. The animated screens stay built into the site."
      >
        <TextField
          label="Small label"
          value={value.productTour.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, productTour: { ...value.productTour, eyebrow } })
          }
          hint='Example: "Product tour"'
        />
        <TextField
          label="Section headline"
          value={value.productTour.headline}
          onChange={(headline) =>
            onChange({ ...value, productTour: { ...value.productTour, headline } })
          }
        />
        <TextField
          label="Short intro under the headline"
          value={value.productTour.body}
          onChange={(body) =>
            onChange({ ...value, productTour: { ...value.productTour, body } })
          }
          multiline
        />
        <p className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
          The MacBook product screens are fixed in the design. This part only edits the text above
          them. The Book a demo button under this section uses the Hero button label.
        </p>
      </EditorPart>

      <EditorPart
        part={3}
        title="Why choose OrderWeb"
        summary="Short reasons under the product tour — commission-free, what’s included, UK focus."
      >
        <TextField
          label="Small label"
          value={value.whyChoose.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, whyChoose: { ...value.whyChoose, eyebrow } })
          }
          hint='Example: "Why choose OrderWeb"'
        />
        <TextField
          label="Section headline"
          value={value.whyChoose.headline}
          onChange={(headline) =>
            onChange({ ...value, whyChoose: { ...value.whyChoose, headline } })
          }
        />
        <TextField
          label="Short intro"
          value={value.whyChoose.body}
          onChange={(body) => onChange({ ...value, whyChoose: { ...value.whyChoose, body } })}
          multiline
        />
        {value.whyChoose.points.map((point, index) => (
          <CardBlock key={`why-${index}`} label={`Reason ${index + 1}`}>
            <TextField
              label="Title"
              value={point.title}
              onChange={(title) => {
                const points = value.whyChoose.points.map((p, i) =>
                  i === index ? { ...p, title } : p,
                );
                onChange({ ...value, whyChoose: { ...value.whyChoose, points } });
              }}
            />
            <TextField
              label="Short line"
              value={point.body}
              onChange={(body) => {
                const points = value.whyChoose.points.map((p, i) =>
                  i === index ? { ...p, body } : p,
                );
                onChange({ ...value, whyChoose: { ...value.whyChoose, points } });
              }}
              multiline
            />
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={4}
        title="Payments"
        summary="Payments section — heading, intro, button label, and the four benefit points."
      >
        <TextField
          label="Small label"
          value={value.payments.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, payments: { ...value.payments, eyebrow } })
          }
        />
        <TextField
          label="Section headline"
          value={value.payments.headline}
          onChange={(headline) =>
            onChange({ ...value, payments: { ...value.payments, headline } })
          }
        />
        <TextField
          label="Short intro"
          value={value.payments.body}
          onChange={(body) => onChange({ ...value, payments: { ...value.payments, body } })}
          multiline
        />
        <TextField
          label="Button text"
          value={value.payments.ctaLabel}
          onChange={(ctaLabel) =>
            onChange({ ...value, payments: { ...value.payments, ctaLabel } })
          }
          hint='Example: "Ask about your gateway"'
        />

        <p className="text-sm font-medium text-[#0a1a4a]">
          Benefit points
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">(usually 4)</span>
        </p>
        {value.payments.points.map((point, index) => (
          <CardBlock
            key={`pay-${index}`}
            label={`Point ${index + 1} of ${value.payments.points.length}`}
          >
            <TextField
              label="Point title"
              value={point.title}
              onChange={(title) => {
                const points = value.payments.points.map((p, i) =>
                  i === index ? { ...p, title } : p,
                );
                onChange({ ...value, payments: { ...value.payments, points } });
              }}
            />
            <TextField
              label="Point text"
              value={point.body}
              onChange={(body) => {
                const points = value.payments.points.map((p, i) =>
                  i === index ? { ...p, body } : p,
                );
                onChange({ ...value, payments: { ...value.payments, points } });
              }}
              multiline
            />
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={5}
        title="Feature map"
        summary="“All modules in one system” — section copy plus each group of module names."
      >
        <TextField
          label="Small label"
          value={value.featureMap.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, featureMap: { ...value.featureMap, eyebrow } })
          }
        />
        <TextField
          label="Section headline"
          value={value.featureMap.headline}
          onChange={(headline) =>
            onChange({ ...value, featureMap: { ...value.featureMap, headline } })
          }
        />
        <TextField
          label="Short intro"
          value={value.featureMap.body}
          onChange={(body) =>
            onChange({ ...value, featureMap: { ...value.featureMap, body } })
          }
          multiline
        />

        <p className="text-sm font-medium text-[#0a1a4a]">Module groups</p>
        {value.featureMap.groups.map((group, index) => (
          <CardBlock
            key={`group-${index}`}
            label={`Group ${index + 1}: ${group.title || "Untitled"}`}
            hint="One module name per line"
          >
            <TextField
              label="Group title"
              value={group.title}
              onChange={(title) => {
                const groups = value.featureMap.groups.map((g, i) =>
                  i === index ? { ...g, title } : g,
                );
                onChange({ ...value, featureMap: { ...value.featureMap, groups } });
              }}
              hint='Example: "Core Operations"'
            />
            <ListField
              label="Module names"
              value={group.items}
              onChange={(items) => {
                const groups = value.featureMap.groups.map((g, i) =>
                  i === index ? { ...g, items } : g,
                );
                onChange({ ...value, featureMap: { ...value.featureMap, groups } });
              }}
            />
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={6}
        title="Bottom button"
        summary="Closing strip at the bottom of the page — short line + Book a demo button (goes to Contact)."
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
          multiline
        />
        <TextField
          label="Button text"
          value={value.cta.buttonLabel}
          onChange={(buttonLabel) =>
            onChange({ ...value, cta: { ...value.cta, buttonLabel } })
          }
          hint='Example: "Book a demo"'
        />
      </EditorPart>
    </div>
  );
}
