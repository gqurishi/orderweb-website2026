import {
  CardBlock,
  EditorPart,
  TextField,
} from "@/components/admin/Field";
import type { LegalPageContent, LegalSectionBlock } from "@/lib/cms/types";

function updateSection(
  sections: LegalSectionBlock[],
  index: number,
  patch: Partial<LegalSectionBlock>,
): LegalSectionBlock[] {
  return sections.map((section, i) => (i === index ? { ...section, ...patch } : section));
}

const PARTS = [
  {
    part: 1,
    title: "Top of page",
    summary: "Small label, main title, intro paragraph, and last-updated date.",
  },
  {
    part: 2,
    title: "Page sections",
    summary: "Each card is one heading + text block on the live page (top → bottom).",
  },
] as const;

function FormattingTips() {
  return (
    <div className="rounded-xl bg-[#f3f9fc] px-4 py-3 text-xs leading-relaxed text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
      <p className="font-semibold text-[#0a1a4a]">How to format section text</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        <li>Blank line between paragraphs</li>
        <li>
          Bullet list: start each line with <code className="text-[#0a1a4a]">- </code>
        </li>
        <li>
          Bold word: <code className="text-[#0a1a4a]">**Customer Data**</code>
        </li>
        <li>
          Link: <code className="text-[#0a1a4a]">[Contact us](/contact)</code> or{" "}
          <code className="text-[#0a1a4a]">[mail@orderweb.co.uk](mailto:mail@orderweb.co.uk)</code>
        </li>
        <li>
          Sub-heading inside a section: start a line with{" "}
          <code className="text-[#0a1a4a]">### Heading text</code>
        </li>
      </ul>
    </div>
  );
}

export function LegalPageEditor({
  value,
  onChange,
  pageLabel,
}: {
  value: LegalPageContent;
  onChange: (v: LegalPageContent) => void;
  pageLabel: string;
}) {
  const normalized = pageLabel.toLowerCase();
  const pathHint =
    normalized === "privacy"
      ? "/privacy"
      : normalized === "terms"
        ? "/terms"
        : normalized === "cookies" || normalized === "cookie policy"
          ? "/cookies"
          : `/${normalized.replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          {pageLabel} page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          The live {pageLabel} page ({pathHint}) has 2 parts (top → bottom), same idea as About.
          Open one part, edit, then Save draft → Preview → Publish.
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
        summary={`Matches the top of ${pathHint} — label, title, intro, and “Last updated”.`}
        defaultOpen
      >
        <TextField
          label="Small label (above the title)"
          value={value.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, eyebrow })}
          hint='Example: "Legal"'
        />
        <TextField
          label="Main headline"
          value={value.title}
          onChange={(title) => onChange({ ...value, title })}
          hint="Big title at the top of the page"
          required
        />
        <TextField
          label="Intro paragraph"
          value={value.intro}
          onChange={(intro) => onChange({ ...value, intro })}
          multiline
          rows={5}
          hint="Short summary under the title"
        />
        <TextField
          label="Last updated date"
          value={value.updated}
          onChange={(updated) => onChange({ ...value, updated })}
          hint='Change this whenever you publish updates — e.g. "9 August 2026"'
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Page sections"
        summary={`Each card is one section on ${pathHint} (for example “Who we are”, “Website use”).`}
      >
        <FormattingTips />
        <div className="space-y-3">
          {value.sections.map((section, index) => (
            <CardBlock
              key={index}
              label={`Section ${index + 1}${section.title ? ` — ${section.title}` : ""}`}
              hint="This heading and text appear in order on the live page."
            >
              <TextField
                label="Section heading"
                value={section.title}
                onChange={(title) =>
                  onChange({
                    ...value,
                    sections: updateSection(value.sections, index, { title }),
                  })
                }
                hint='Example: "Who we are" or "Website use"'
              />
              <TextField
                label="Section text"
                value={section.body}
                onChange={(body) =>
                  onChange({
                    ...value,
                    sections: updateSection(value.sections, index, { body }),
                  })
                }
                multiline
                rows={10}
                hint="Write like a normal document. Use the formatting tips above for bold, bullets, and links."
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold disabled:opacity-40"
                  disabled={index === 0}
                  onClick={() => {
                    if (index === 0) return;
                    const sections = [...value.sections];
                    const prev = sections[index - 1]!;
                    sections[index - 1] = sections[index]!;
                    sections[index] = prev;
                    onChange({ ...value, sections });
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold disabled:opacity-40"
                  disabled={index >= value.sections.length - 1}
                  onClick={() => {
                    if (index >= value.sections.length - 1) return;
                    const sections = [...value.sections];
                    const next = sections[index + 1]!;
                    sections[index + 1] = sections[index]!;
                    sections[index] = next;
                    onChange({ ...value, sections });
                  }}
                >
                  Move down
                </button>
                {value.sections.length > 1 ? (
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                    onClick={() => {
                      if (!confirm("Remove this section?")) return;
                      onChange({
                        ...value,
                        sections: value.sections.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    Remove section
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
                sections: [
                  ...value.sections,
                  { title: "New section", body: "Write the section text here." },
                ],
              })
            }
          >
            Add section
          </button>
        </div>
      </EditorPart>
    </div>
  );
}
