import {
  CardBlock,
  EditorPart,
  ListField,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { PricingContent } from "@/lib/cms/types";

const PARTS = [
  { part: 1, title: "Hero" },
  { part: 2, title: "Value cards" },
  { part: 3, title: "Marketplace compare" },
  { part: 4, title: "Main plan" },
  { part: 5, title: "Savings calculator" },
  { part: 6, title: "Optional add-ons" },
] as const;

export function PricingEditor({
  value,
  onChange,
}: {
  value: PricingContent;
  onChange: (v: PricingContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          Pricing page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          Matches the live /pricing page top → bottom. Open one part, edit, then Save draft →
          Preview → Publish.
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
        summary="Top of Pricing — label, headline, short line, and the scale picture."
        defaultOpen
      >
        <TextField
          label="Small label"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "Pricing"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          hint="Lead with the offer (price / commission) · under ~50 characters"
          maxLength={70}
          required
        />
        <TextField
          label="Short supporting line"
          value={value.hero.body}
          onChange={(body) => onChange({ ...value, hero: { ...value.hero, body } })}
          multiline
        />
        <ImageReplaceField
          label="Hero picture (scale / commission visual)"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.pricingCommission}
          hint="Right-side illustration on Pricing. Click Replace picture to upload — no URL needed."
          folder="pricing"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Value cards"
        summary="Three cards under the hero (commission, flat rate, no pay now)."
      >
        {value.highlights.cards.map((card, index) => (
          <CardBlock
            key={`highlight-${index}`}
            label={`Card ${index + 1} of ${value.highlights.cards.length}`}
          >
            <TextField
              label="Card title"
              value={card.title}
              onChange={(title) => {
                const cards = value.highlights.cards.map((c, i) =>
                  i === index ? { ...c, title } : c,
                );
                onChange({ ...value, highlights: { ...value.highlights, cards } });
              }}
            />
            <TextField
              label="Card text"
              value={card.body}
              onChange={(body) => {
                const cards = value.highlights.cards.map((c, i) =>
                  i === index ? { ...c, body } : c,
                );
                onChange({ ...value, highlights: { ...value.highlights, cards } });
              }}
              multiline
            />
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={3}
        title="Marketplace compare"
        summary="Banner that points people to the savings calculator (apps % vs OrderWeb %)."
      >
        <TextField
          label="Small label"
          value={value.compare.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, compare: { ...value.compare, eyebrow } })
          }
        />
        <TextField
          label="Headline"
          value={value.compare.headline}
          onChange={(headline) =>
            onChange({ ...value, compare: { ...value.compare, headline } })
          }
        />
        <TextField
          label="Supporting text"
          value={value.compare.body}
          onChange={(body) => onChange({ ...value, compare: { ...value.compare, body } })}
          multiline
        />
        <TextField
          label="Button text"
          value={value.compare.ctaLabel}
          onChange={(ctaLabel) =>
            onChange({ ...value, compare: { ...value.compare, ctaLabel } })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <CardBlock label="Left box (apps)">
            <TextField
              label="Label"
              value={value.compare.appsLabel}
              onChange={(appsLabel) =>
                onChange({ ...value, compare: { ...value.compare, appsLabel } })
              }
            />
            <TextField
              label="Big number"
              value={value.compare.appsValue}
              onChange={(appsValue) =>
                onChange({ ...value, compare: { ...value.compare, appsValue } })
              }
              hint='Example: "30–35%"'
            />
          </CardBlock>
          <CardBlock label="Right box (OrderWeb)">
            <TextField
              label="Label"
              value={value.compare.orderwebLabel}
              onChange={(orderwebLabel) =>
                onChange({ ...value, compare: { ...value.compare, orderwebLabel } })
              }
            />
            <TextField
              label="Big number"
              value={value.compare.orderwebValue}
              onChange={(orderwebValue) =>
                onChange({ ...value, compare: { ...value.compare, orderwebValue } })
              }
              hint='Example: "0%"'
            />
          </CardBlock>
        </div>
      </EditorPart>

      <EditorPart
        part={4}
        title="Main plan"
        summary="The £59.99 plan card — price, features, buttons, and side badges."
      >
        <TextField
          label="Plan name"
          value={value.plan.label}
          onChange={(label) => onChange({ ...value, plan: { ...value.plan, label } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Price"
            value={value.plan.price}
            onChange={(price) => onChange({ ...value, plan: { ...value.plan, price } })}
            hint='Example: "£59.99" — also used by the savings calculator'
          />
          <TextField
            label="Price suffix"
            value={value.plan.priceSuffix}
            onChange={(priceSuffix) =>
              onChange({ ...value, plan: { ...value.plan, priceSuffix } })
            }
            hint='Example: "/ month per device"'
          />
        </div>
        <TextField
          label="Short plan summary"
          value={value.plan.summary}
          onChange={(summary) => onChange({ ...value, plan: { ...value.plan, summary } })}
          multiline
        />
        <ListField
          label="What’s included (one feature per line)"
          value={value.plan.features}
          onChange={(features) => onChange({ ...value, plan: { ...value.plan, features } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Primary button"
            value={value.plan.primaryCta}
            onChange={(primaryCta) =>
              onChange({ ...value, plan: { ...value.plan, primaryCta } })
            }
          />
          <TextField
            label="Secondary button"
            value={value.plan.secondaryCta}
            onChange={(secondaryCta) =>
              onChange({ ...value, plan: { ...value.plan, secondaryCta } })
            }
          />
        </div>

        <p className="text-sm font-medium text-[#0a1a4a]">Side badges</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            label="Setup fee value"
            value={value.sideStats.setupFee}
            onChange={(setupFee) =>
              onChange({ ...value, sideStats: { ...value.sideStats, setupFee } })
            }
          />
          <TextField
            label="Commission value"
            value={value.sideStats.commission}
            onChange={(commission) =>
              onChange({ ...value, sideStats: { ...value.sideStats, commission } })
            }
          />
          <TextField
            label="Billing value"
            value={value.sideStats.billing}
            onChange={(billing) =>
              onChange({ ...value, sideStats: { ...value.sideStats, billing } })
            }
          />
        </div>
        <TextField
          label="Note under the plan"
          value={value.notes}
          onChange={(notes) => onChange({ ...value, notes })}
          multiline
          hint='Example: "No setup fee. Cancel any time…"'
        />
      </EditorPart>

      <EditorPart
        part={5}
        title="Savings calculator"
        summary="Intro copy above the interactive calculator. The flat fee number comes from Part 4 Price."
      >
        <TextField
          label="Calculator headline"
          value={value.calculator.headline}
          onChange={(headline) =>
            onChange({ ...value, calculator: { ...value.calculator, headline } })
          }
        />
        <TextField
          label="Calculator intro text"
          value={value.calculator.body}
          onChange={(body) =>
            onChange({ ...value, calculator: { ...value.calculator, body } })
          }
          multiline
        />
        <p className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
          Sliders stay interactive. Monthly OrderWeb fee uses the Price from Part 4 (
          {value.plan.price || "£59.99"}).
        </p>
      </EditorPart>

      <EditorPart
        part={6}
        title="Optional add-ons"
        summary="White-label app + SMS messaging — titles, prices, and copy. Demo phones stay built-in unless you upload a picture."
      >
        <TextField
          label="Section title"
          value={value.addOns.sectionTitle}
          onChange={(sectionTitle) =>
            onChange({ ...value, addOns: { ...value.addOns, sectionTitle } })
          }
        />
        <TextField
          label="Section intro"
          value={value.addOns.sectionBody}
          onChange={(sectionBody) =>
            onChange({ ...value, addOns: { ...value.addOns, sectionBody } })
          }
          multiline
        />

        <CardBlock label="White-label mobile app">
          <TextField
            label="Title"
            value={value.addOns.whiteLabelTitle}
            onChange={(whiteLabelTitle) =>
              onChange({ ...value, addOns: { ...value.addOns, whiteLabelTitle } })
            }
          />
          <TextField
            label="Price line"
            value={value.addOns.whiteLabelPrice}
            onChange={(whiteLabelPrice) =>
              onChange({ ...value, addOns: { ...value.addOns, whiteLabelPrice } })
            }
          />
          <TextField
            label="Description"
            value={value.addOns.whiteLabelBody}
            onChange={(whiteLabelBody) =>
              onChange({ ...value, addOns: { ...value.addOns, whiteLabelBody } })
            }
            multiline
          />
          <ImageReplaceField
            label="Optional add-on picture"
            value={value.addOns.whiteLabelImage}
            onChange={(whiteLabelImage) =>
              onChange({ ...value, addOns: { ...value.addOns, whiteLabelImage } })
            }
            hint="Leave empty to keep the built-in phone demos. Upload to show your own picture instead."
            folder="pricing"
          />
        </CardBlock>

        <CardBlock label="SMS messaging">
          <TextField
            label="Title"
            value={value.addOns.smsTitle}
            onChange={(smsTitle) =>
              onChange({ ...value, addOns: { ...value.addOns, smsTitle } })
            }
          />
          <TextField
            label="Subtitle"
            value={value.addOns.smsSubtitle}
            onChange={(smsSubtitle) =>
              onChange({ ...value, addOns: { ...value.addOns, smsSubtitle } })
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Price"
              value={value.addOns.smsPrice}
              onChange={(smsPrice) =>
                onChange({ ...value, addOns: { ...value.addOns, smsPrice } })
              }
              hint='Example: "5p"'
            />
            <TextField
              label="Price suffix"
              value={value.addOns.smsPriceSuffix}
              onChange={(smsPriceSuffix) =>
                onChange({ ...value, addOns: { ...value.addOns, smsPriceSuffix } })
              }
              hint='Example: "per SMS"'
            />
          </div>
          <TextField
            label="Description"
            value={value.addOns.smsBody}
            onChange={(smsBody) =>
              onChange({ ...value, addOns: { ...value.addOns, smsBody } })
            }
            multiline
          />
          <TextField
            label="Footer note on SMS card"
            value={value.addOns.smsFooter}
            onChange={(smsFooter) =>
              onChange({ ...value, addOns: { ...value.addOns, smsFooter } })
            }
            multiline
          />
        </CardBlock>

        <TextField
          label="Guide note under both cards"
          value={value.addOns.guideNote}
          onChange={(guideNote) =>
            onChange({ ...value, addOns: { ...value.addOns, guideNote } })
          }
          multiline
        />
      </EditorPart>
    </div>
  );
}
