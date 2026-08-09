import {
  CardBlock,
  EditorPart,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { AboutCard, AboutContent } from "@/lib/cms/types";

function updateCard(
  cards: AboutCard[],
  index: number,
  patch: Partial<AboutCard>,
): AboutCard[] {
  return cards.map((card, i) => (i === index ? { ...card, ...patch } : card));
}

const PARTS = [
  {
    part: 1,
    title: "Our story",
    summary: "Top of the About page — short label, big headline, two paragraphs, and the story image.",
  },
  {
    part: 2,
    title: "The problem",
    summary: "Four pain-point cards (extras, rising costs, locked hardware, commission).",
  },
  {
    part: 3,
    title: "The difference",
    summary: "Three benefit cards — why OrderWeb is fairer and simpler.",
  },
  {
    part: 4,
    title: "More than POS",
    summary: "Studio section — web apps, mobile apps, and brand experiences.",
  },
  {
    part: 5,
    title: "Mission & buttons",
    summary: "Closing line at the bottom of the page, plus the two buttons.",
  },
] as const;

export function AboutEditor({
  value,
  onChange,
}: {
  value: AboutContent;
  onChange: (v: AboutContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          About page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          The live About page has 5 parts (top → bottom). Open one part, edit, then Save draft →
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
        title="Our story"
        summary="Matches the first section on /about — “Born on the restaurant floor”."
        defaultOpen
      >
        <TextField
          label="Small label (above the title)"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "Our story"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          hint="One clear line — under ~60 characters"
          maxLength={80}
          required
        />
        <TextField
          label="Paragraph 1"
          value={value.hero.body1}
          onChange={(body1) => onChange({ ...value, hero: { ...value.hero, body1 } })}
          multiline
          hint="First block of story text"
        />
        <TextField
          label="Paragraph 2"
          value={value.hero.body2}
          onChange={(body2) => onChange({ ...value, hero: { ...value.hero, body2 } })}
          multiline
          hint="Second block of story text"
        />
        <ImageReplaceField
          label="Story picture (right side of Part 1)"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.aboutFloorStory}
          hint="This is the big illustration next to “Our story”. Click Replace picture to upload a new one — no URL needed."
          folder="about"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="The problem"
        summary="Section heading + up to four cards in a grid."
      >
        <TextField
          label="Small label"
          value={value.problem.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, problem: { ...value.problem, eyebrow } })
          }
          hint='Example: "The problem"'
        />
        <TextField
          label="Section headline"
          value={value.problem.headline}
          onChange={(headline) =>
            onChange({ ...value, problem: { ...value.problem, headline } })
          }
        />
        <TextField
          label="Short intro under the headline"
          value={value.problem.subhead}
          onChange={(subhead) =>
            onChange({ ...value, problem: { ...value.problem, subhead } })
          }
          multiline
        />

        <p className="text-sm font-medium text-[#0a1a4a]">
          Problem cards
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">
            (usually 4 — one job each)
          </span>
        </p>
        {value.problem.cards.map((card, index) => (
          <CardBlock
            key={`problem-${index}`}
            label={`Card ${index + 1} of ${value.problem.cards.length}`}
            hint="Big line → short subtitle → explanation"
          >
            <TextField
              label="Big line (bold callout)"
              value={card.hit ?? ""}
              onChange={(hit) =>
                onChange({
                  ...value,
                  problem: {
                    ...value.problem,
                    cards: updateCard(value.problem.cards, index, { hit }),
                  },
                })
              }
              hint='Example: "EXTRA MODULES" or "£200–£500+/MO"'
            />
            <TextField
              label="Short subtitle"
              value={card.title}
              onChange={(title) =>
                onChange({
                  ...value,
                  problem: {
                    ...value.problem,
                    cards: updateCard(value.problem.cards, index, { title }),
                  },
                })
              }
            />
            <TextField
              label="Explanation"
              value={card.body}
              onChange={(body) =>
                onChange({
                  ...value,
                  problem: {
                    ...value.problem,
                    cards: updateCard(value.problem.cards, index, { body }),
                  },
                })
              }
              multiline
            />
            {value.problem.cards.length > 1 ? (
              <button
                type="button"
                className="h-9 w-fit rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700"
                onClick={() =>
                  onChange({
                    ...value,
                    problem: {
                      ...value.problem,
                      cards: value.problem.cards.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                Remove this card
              </button>
            ) : null}
          </CardBlock>
        ))}
        {value.problem.cards.length < 6 ? (
          <button
            type="button"
            className="h-10 w-fit rounded-full border border-[#61c3ec]/40 bg-white px-4 text-sm font-semibold text-[#0a1a4a]"
            onClick={() =>
              onChange({
                ...value,
                problem: {
                  ...value.problem,
                  cards: [...value.problem.cards, { hit: "", title: "", body: "" }],
                },
              })
            }
          >
            + Add problem card
          </button>
        ) : null}
      </EditorPart>

      <EditorPart
        part={3}
        title="The difference"
        summary="Section heading + three benefit cards."
      >
        <TextField
          label="Small label"
          value={value.difference.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, difference: { ...value.difference, eyebrow } })
          }
          hint='Example: "The difference"'
        />
        <TextField
          label="Section headline"
          value={value.difference.headline}
          onChange={(headline) =>
            onChange({ ...value, difference: { ...value.difference, headline } })
          }
        />
        <TextField
          label="Short intro under the headline"
          value={value.difference.subhead}
          onChange={(subhead) =>
            onChange({ ...value, difference: { ...value.difference, subhead } })
          }
        />

        <p className="text-sm font-medium text-[#0a1a4a]">
          Benefit cards
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">(usually 3)</span>
        </p>
        {value.difference.cards.map((card, index) => (
          <CardBlock
            key={`difference-${index}`}
            label={`Card ${index + 1} of ${value.difference.cards.length}`}
          >
            <TextField
              label="Card title"
              value={card.title}
              onChange={(title) =>
                onChange({
                  ...value,
                  difference: {
                    ...value.difference,
                    cards: updateCard(value.difference.cards, index, { title }),
                  },
                })
              }
            />
            <TextField
              label="Card text"
              value={card.body}
              onChange={(body) =>
                onChange({
                  ...value,
                  difference: {
                    ...value.difference,
                    cards: updateCard(value.difference.cards, index, { body }),
                  },
                })
              }
              multiline
            />
            {value.difference.cards.length > 1 ? (
              <button
                type="button"
                className="h-9 w-fit rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700"
                onClick={() =>
                  onChange({
                    ...value,
                    difference: {
                      ...value.difference,
                      cards: value.difference.cards.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                Remove this card
              </button>
            ) : null}
          </CardBlock>
        ))}
        {value.difference.cards.length < 6 ? (
          <button
            type="button"
            className="h-10 w-fit rounded-full border border-[#61c3ec]/40 bg-white px-4 text-sm font-semibold text-[#0a1a4a]"
            onClick={() =>
              onChange({
                ...value,
                difference: {
                  ...value.difference,
                  cards: [...value.difference.cards, { title: "", body: "" }],
                },
              })
            }
          >
            + Add benefit card
          </button>
        ) : null}
      </EditorPart>

      <EditorPart
        part={4}
        title="More than POS"
        summary="Studio section — web, mobile, and brand work."
      >
        <TextField
          label="Small label"
          value={value.studio.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, studio: { ...value.studio, eyebrow } })
          }
          hint='Example: "More than POS"'
        />
        <TextField
          label="Section headline"
          value={value.studio.headline}
          onChange={(headline) =>
            onChange({ ...value, studio: { ...value.studio, headline } })
          }
        />
        <TextField
          label="Short intro under the headline"
          value={value.studio.subhead}
          onChange={(subhead) =>
            onChange({ ...value, studio: { ...value.studio, subhead } })
          }
          multiline
        />

        <p className="text-sm font-medium text-[#0a1a4a]">
          Studio cards
          <span className="ml-2 text-xs font-normal text-[#5b6b7c]">(usually 3)</span>
        </p>
        {value.studio.cards.map((card, index) => (
          <CardBlock
            key={`studio-${index}`}
            label={`Card ${index + 1} of ${value.studio.cards.length}`}
          >
            <TextField
              label="Card title"
              value={card.title}
              onChange={(title) =>
                onChange({
                  ...value,
                  studio: {
                    ...value.studio,
                    cards: updateCard(value.studio.cards, index, { title }),
                  },
                })
              }
            />
            <TextField
              label="Card text"
              value={card.body}
              onChange={(body) =>
                onChange({
                  ...value,
                  studio: {
                    ...value.studio,
                    cards: updateCard(value.studio.cards, index, { body }),
                  },
                })
              }
              multiline
            />
            {value.studio.cards.length > 1 ? (
              <button
                type="button"
                className="h-9 w-fit rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700"
                onClick={() =>
                  onChange({
                    ...value,
                    studio: {
                      ...value.studio,
                      cards: value.studio.cards.filter((_, i) => i !== index),
                    },
                  })
                }
              >
                Remove this card
              </button>
            ) : null}
          </CardBlock>
        ))}
        {value.studio.cards.length < 6 ? (
          <button
            type="button"
            className="h-10 w-fit rounded-full border border-[#61c3ec]/40 bg-white px-4 text-sm font-semibold text-[#0a1a4a]"
            onClick={() =>
              onChange({
                ...value,
                studio: {
                  ...value.studio,
                  cards: [...value.studio.cards, { title: "", body: "" }],
                },
              })
            }
          >
            + Add studio card
          </button>
        ) : null}
      </EditorPart>

      <EditorPart
        part={5}
        title="Mission & buttons"
        summary="Bottom of the About page — mission line and the two action buttons."
      >
        <TextField
          label="Small label"
          value={value.mission.eyebrow}
          onChange={(eyebrow) =>
            onChange({ ...value, mission: { ...value.mission, eyebrow } })
          }
          hint='Example: "Our mission"'
        />
        <TextField
          label="Mission statement"
          value={value.mission.statement}
          onChange={(statement) =>
            onChange({ ...value, mission: { ...value.mission, statement } })
          }
          multiline
        />
        <TextField
          label="Primary button text"
          value={value.mission.primaryCta}
          onChange={(primaryCta) =>
            onChange({ ...value, mission: { ...value.mission, primaryCta } })
          }
          hint='Example: "Start a conversation"'
        />
        <TextField
          label="Secondary button text"
          value={value.mission.secondaryCta}
          onChange={(secondaryCta) =>
            onChange({ ...value, mission: { ...value.mission, secondaryCta } })
          }
          hint='Example: "See pricing"'
        />
      </EditorPart>
    </div>
  );
}
