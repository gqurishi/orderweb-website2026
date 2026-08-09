import {
  CardBlock,
  EditorPart,
  TextField,
} from "@/components/admin/Field";
import type { FaqContent, FaqItem } from "@/lib/cms/types";

function updateItem(items: FaqItem[], index: number, patch: Partial<FaqItem>): FaqItem[] {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

const PARTS = [
  {
    part: 1,
    title: "Top of page",
    summary: "Small label, main headline, and short intro under the title.",
  },
  {
    part: 2,
    title: "Questions & answers",
    summary: "Accordion items on /faq — one card per Q&A (order is top → bottom).",
  },
  {
    part: 3,
    title: "Bottom button",
    summary: "“Still need help?” box and Contact button under the FAQ list.",
  },
] as const;

export function FaqEditor({
  value,
  onChange,
}: {
  value: FaqContent;
  onChange: (v: FaqContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          FAQ page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          The live FAQ page (/faq) has 3 parts (top → bottom), same idea as About. Open one part,
          edit, then Save draft → Preview → Publish.
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
        title="Top of page"
        summary="Matches the top of /faq — label, headline, and intro sentence."
        defaultOpen
      >
        <TextField
          label="Small label (above the title)"
          value={value.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, eyebrow })}
          hint='Example: "FAQ"'
        />
        <TextField
          label="Main headline"
          value={value.headline}
          onChange={(headline) => onChange({ ...value, headline })}
          hint='Example: "Questions operators ask us"'
          required
        />
        <TextField
          label="Intro paragraph"
          value={value.intro}
          onChange={(intro) => onChange({ ...value, intro })}
          multiline
          rows={4}
          hint="Short line under the headline"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Questions & answers"
        summary="Each card is one drop-down on the live FAQ page. Move up/down to change order."
      >
        <div className="rounded-xl bg-[#f3f9fc] px-4 py-3 text-xs leading-relaxed text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
          <p className="font-semibold text-[#0a1a4a]">Tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Keep questions short — one clear line</li>
            <li>Keep answers plain English (2–4 sentences works well)</li>
            <li>Use Move up / Move down to match the order customers should see</li>
          </ul>
        </div>
        <div className="space-y-3">
          {value.items.map((item, index) => (
            <CardBlock
              key={index}
              label={`Q${index + 1}${item.question ? ` — ${item.question}` : ""}`}
              hint="One accordion item on /faq."
            >
              <TextField
                label="Question"
                value={item.question}
                onChange={(question) =>
                  onChange({
                    ...value,
                    items: updateItem(value.items, index, { question }),
                  })
                }
                hint='Example: "Do you take a cut of my orders?"'
              />
              <TextField
                label="Answer"
                value={item.answer}
                onChange={(answer) =>
                  onChange({
                    ...value,
                    items: updateItem(value.items, index, { answer }),
                  })
                }
                multiline
                rows={5}
                hint="Shown when the customer opens this question"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold disabled:opacity-40"
                  disabled={index === 0}
                  onClick={() => {
                    if (index === 0) return;
                    const items = [...value.items];
                    const prev = items[index - 1]!;
                    items[index - 1] = items[index]!;
                    items[index] = prev;
                    onChange({ ...value, items });
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold disabled:opacity-40"
                  disabled={index >= value.items.length - 1}
                  onClick={() => {
                    if (index >= value.items.length - 1) return;
                    const items = [...value.items];
                    const next = items[index + 1]!;
                    items[index + 1] = items[index]!;
                    items[index] = next;
                    onChange({ ...value, items });
                  }}
                >
                  Move down
                </button>
                {value.items.length > 1 ? (
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                    onClick={() => {
                      if (!confirm("Remove this question?")) return;
                      onChange({
                        ...value,
                        items: value.items.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    Remove question
                  </button>
                ) : null}
              </div>
            </CardBlock>
          ))}
          <button
            type="button"
            className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
            onClick={() =>
              onChange({
                ...value,
                items: [
                  ...value.items,
                  {
                    question: "New question?",
                    answer: "Write a clear short answer here.",
                  },
                ],
              })
            }
          >
            Add question
          </button>
        </div>
      </EditorPart>

      <EditorPart
        part={3}
        title="Bottom button"
        summary="Matches the “Still need help?” box at the bottom of /faq."
      >
        <TextField
          label="Box headline"
          value={value.ctaHeadline}
          onChange={(ctaHeadline) => onChange({ ...value, ctaHeadline })}
          hint='Example: "Still need help?"'
        />
        <TextField
          label="Box text"
          value={value.ctaBody}
          onChange={(ctaBody) => onChange({ ...value, ctaBody })}
          multiline
          rows={3}
          hint="Short line under the box headline"
        />
        <TextField
          label="Button text"
          value={value.ctaButtonLabel}
          onChange={(ctaButtonLabel) => onChange({ ...value, ctaButtonLabel })}
          hint='Example: "Contact us" — button goes to the Contact page'
        />
      </EditorPart>
    </div>
  );
}
