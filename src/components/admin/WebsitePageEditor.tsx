import {
  CardBlock,
  EditorPart,
  ListField,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { WebsiteContent, WebsiteDemo } from "@/lib/cms/types";

const PARTS = [
  { part: 1, title: "Hero" },
  { part: 2, title: "Promise strip" },
  { part: 3, title: "Demo websites" },
  { part: 4, title: "Roadmap" },
  { part: 5, title: "Bottom button" },
] as const;

const DEMO_FALLBACKS = [
  siteMedia.demoRestaurant3,
  siteMedia.demoRetail3,
  siteMedia.demoServices3,
] as const;

function updateDemo(
  demos: WebsiteDemo[],
  index: number,
  patch: Partial<WebsiteDemo>,
): WebsiteDemo[] {
  return demos.map((demo, i) => (i === index ? { ...demo, ...patch } : demo));
}

export function WebsitePageEditor({
  value,
  onChange,
}: {
  value: WebsiteContent;
  onChange: (v: WebsiteContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          Website page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          Matches /website top → bottom. Open one part, edit, then Save draft → Preview → Publish.
          Demo websites (Part 3) take the longest — edit one example at a time.
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
        summary="Top of the Website page — label, headline, button, audience chips, and devices picture."
        defaultOpen
      >
        <TextField
          label="Small label"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "OrderWeb · Website"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
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
          label="Primary button text"
          value={value.hero.primaryCta}
          onChange={(primaryCta) =>
            onChange({ ...value, hero: { ...value.hero, primaryCta } })
          }
          hint='Example: "Start your website"'
        />
        <ListField
          label="Audience chips (one per line)"
          value={value.hero.audiences}
          onChange={(audiences) =>
            onChange({ ...value, hero: { ...value.hero, audiences } })
          }
          hint='Example: Restaurants / Retail brands / Local services'
        />
        <ImageReplaceField
          label="Hero picture (devices)"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.websiteDevices}
          hint="Click Replace picture to upload — no URL needed."
          folder="website"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Promise strip"
        summary="Thin bar under the hero — short promise on the left and right."
      >
        <TextField
          label="Left text"
          value={value.promiseStrip.left}
          onChange={(left) =>
            onChange({ ...value, promiseStrip: { ...value.promiseStrip, left } })
          }
          hint='Example: "Custom design · Fast build · Launch ready"'
        />
        <TextField
          label="Right text"
          value={value.promiseStrip.right}
          onChange={(right) =>
            onChange({ ...value, promiseStrip: { ...value.promiseStrip, right } })
          }
          hint='Example: "Made for the businesses you run"'
        />
      </EditorPart>

      <EditorPart
        part={3}
        title="Demo websites"
        summary="Showcase section + each example site (Restaurant, Retail, Services). Edit one demo at a time."
      >
        <TextField
          label="Small label"
          value={value.demoShowcase.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, demoShowcase: { ...value.demoShowcase, eyebrow } })
          }
        />
        <TextField
          label="Section headline"
          value={value.demoShowcase.headline}
          onChange={(headline) =>
            onChange({ ...value, demoShowcase: { ...value.demoShowcase, headline } })
          }
        />
        <TextField
          label="Short intro"
          value={value.demoShowcase.body}
          onChange={(body) =>
            onChange({ ...value, demoShowcase: { ...value.demoShowcase, body } })
          }
          multiline
        />
        <ListField
          label="Bullet points (one per line)"
          value={value.demoShowcase.bullets}
          onChange={(bullets) =>
            onChange({ ...value, demoShowcase: { ...value.demoShowcase, bullets } })
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Primary button text"
            value={value.demoShowcase.primaryCta}
            onChange={(primaryCta) =>
              onChange({ ...value, demoShowcase: { ...value.demoShowcase, primaryCta } })
            }
          />
          <TextField
            label="“Next example” button text"
            value={value.demoShowcase.nextExampleLabel}
            onChange={(nextExampleLabel) =>
              onChange({
                ...value,
                demoShowcase: { ...value.demoShowcase, nextExampleLabel },
              })
            }
          />
        </div>

        <p className="text-sm font-medium text-[#0a1a4a]">
          Example sites
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">
            ({value.demoShowcase.demos.length} demos)
          </span>
        </p>

        {value.demoShowcase.demos.map((demo, index) => (
          <CardBlock
            key={demo.id || index}
            label={`Demo ${index + 1}: ${demo.label || "Untitled"}`}
            hint="Shown when visitors click through the showcase"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Tab label"
                value={demo.label}
                onChange={(label) =>
                  onChange({
                    ...value,
                    demoShowcase: {
                      ...value.demoShowcase,
                      demos: updateDemo(value.demoShowcase.demos, index, { label }),
                    },
                  })
                }
                hint='Example: "Restaurant"'
              />
              <TextField
                label="Demo domain"
                value={demo.domain}
                onChange={(domain) =>
                  onChange({
                    ...value,
                    demoShowcase: {
                      ...value.demoShowcase,
                      demos: updateDemo(value.demoShowcase.demos, index, { domain }),
                    },
                  })
                }
                hint='Example: "harbourkitchen.com"'
              />
            </div>
            <TextField
              label="Brand name"
              value={demo.brand}
              onChange={(brand) =>
                onChange({
                  ...value,
                  demoShowcase: {
                    ...value.demoShowcase,
                    demos: updateDemo(value.demoShowcase.demos, index, { brand }),
                  },
                })
              }
            />
            <TextField
              label="Demo headline"
              value={demo.headline}
              onChange={(headline) =>
                onChange({
                  ...value,
                  demoShowcase: {
                    ...value.demoShowcase,
                    demos: updateDemo(value.demoShowcase.demos, index, { headline }),
                  },
                })
              }
              hint="Use a new line for a line break"
              multiline
            />
            <TextField
              label="Support line under headline"
              value={demo.support}
              onChange={(support) =>
                onChange({
                  ...value,
                  demoShowcase: {
                    ...value.demoShowcase,
                    demos: updateDemo(value.demoShowcase.demos, index, { support }),
                  },
                })
              }
              multiline
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="In-demo primary button"
                value={demo.cta}
                onChange={(cta) =>
                  onChange({
                    ...value,
                    demoShowcase: {
                      ...value.demoShowcase,
                      demos: updateDemo(value.demoShowcase.demos, index, { cta }),
                    },
                  })
                }
              />
              <TextField
                label="In-demo secondary button"
                value={demo.secondary}
                onChange={(secondary) =>
                  onChange({
                    ...value,
                    demoShowcase: {
                      ...value.demoShowcase,
                      demos: updateDemo(value.demoShowcase.demos, index, { secondary }),
                    },
                  })
                }
              />
            </div>
            <ImageReplaceField
              label="Demo main picture"
              value={demo.heroImage}
              onChange={(heroImage) =>
                onChange({
                  ...value,
                  demoShowcase: {
                    ...value.demoShowcase,
                    demos: updateDemo(value.demoShowcase.demos, index, { heroImage }),
                  },
                })
              }
              fallbackSrc={DEMO_FALLBACKS[index % DEMO_FALLBACKS.length]}
              hint="Main visual for this example site"
              folder="website-demos"
            />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6fb8]">
              Small tiles under the demo
            </p>
            {demo.tiles.map((tile, tileIndex) => (
              <CardBlock
                key={`tile-${index}-${tileIndex}`}
                label={`Tile ${tileIndex + 1}`}
              >
                <TextField
                  label="Tile label"
                  value={tile.label}
                  onChange={(label) => {
                    const tiles = demo.tiles.map((t, i) =>
                      i === tileIndex ? { ...t, label } : t,
                    );
                    onChange({
                      ...value,
                      demoShowcase: {
                        ...value.demoShowcase,
                        demos: updateDemo(value.demoShowcase.demos, index, { tiles }),
                      },
                    });
                  }}
                />
                <ImageReplaceField
                  label="Tile picture"
                  value={tile.image}
                  onChange={(image) => {
                    const tiles = demo.tiles.map((t, i) =>
                      i === tileIndex ? { ...t, image } : t,
                    );
                    onChange({
                      ...value,
                      demoShowcase: {
                        ...value.demoShowcase,
                        demos: updateDemo(value.demoShowcase.demos, index, { tiles }),
                      },
                    });
                  }}
                  hint="Optional. Leave empty to keep the built-in tile image."
                  folder="website-demos"
                />
              </CardBlock>
            ))}
          </CardBlock>
        ))}
      </EditorPart>

      <EditorPart
        part={4}
        title="Roadmap"
        summary="“How we build your website” steps."
      >
        <TextField
          label="Small label"
          value={value.roadmap.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, roadmap: { ...value.roadmap, eyebrow } })
          }
        />
        <TextField
          label="Section headline"
          value={value.roadmap.headline}
          onChange={(headline) =>
            onChange({ ...value, roadmap: { ...value.roadmap, headline } })
          }
        />
        <TextField
          label="Short intro"
          value={value.roadmap.body}
          onChange={(body) => onChange({ ...value, roadmap: { ...value.roadmap, body } })}
          multiline
        />
        {value.roadmap.steps.map((step, index) => (
          <CardBlock
            key={`step-${index}`}
            label={`Step ${step.step || index + 1}: ${step.title || "Untitled"}`}
          >
            <TextField
              label="Step number"
              value={step.step}
              onChange={(stepNo) => {
                const steps = value.roadmap.steps.map((s, i) =>
                  i === index ? { ...s, step: stepNo } : s,
                );
                onChange({ ...value, roadmap: { ...value.roadmap, steps } });
              }}
              hint='Example: "01"'
            />
            <TextField
              label="Step title"
              value={step.title}
              onChange={(title) => {
                const steps = value.roadmap.steps.map((s, i) =>
                  i === index ? { ...s, title } : s,
                );
                onChange({ ...value, roadmap: { ...value.roadmap, steps } });
              }}
            />
            <TextField
              label="Step text"
              value={step.body}
              onChange={(body) => {
                const steps = value.roadmap.steps.map((s, i) =>
                  i === index ? { ...s, body } : s,
                );
                onChange({ ...value, roadmap: { ...value.roadmap, steps } });
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
