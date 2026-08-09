import {
  CardBlock,
  EditorPart,
  TextField,
} from "@/components/admin/Field";
import type { DpaContent, DpaSubProcessor, LegalSectionBlock } from "@/lib/cms/types";

function updateSection(
  sections: LegalSectionBlock[],
  index: number,
  patch: Partial<LegalSectionBlock>,
): LegalSectionBlock[] {
  return sections.map((section, i) => (i === index ? { ...section, ...patch } : section));
}

function updateRow(
  rows: DpaSubProcessor[],
  index: number,
  patch: Partial<DpaSubProcessor>,
): DpaSubProcessor[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

const PARTS = [
  {
    part: 1,
    title: "Top of page",
    summary: "Small label, main title, intro, last-updated date, and the grey highlight box.",
  },
  {
    part: 2,
    title: "Agreement sections",
    summary: "Numbered legal sections (Definitions, Scope, Obligations, Breach, Governing law).",
  },
  {
    part: 3,
    title: "Sub-processors table",
    summary: "Schedule 1 table — AWS, Stripe, Worldpay, Twilio, etc.",
  },
  {
    part: 4,
    title: "Sign-off",
    summary: "Signature blocks for Processor and Controller, plus related links.",
  },
] as const;

function FormattingTips() {
  return (
    <div className="rounded-xl bg-[#f3f9fc] px-4 py-3 text-xs leading-relaxed text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
      <p className="font-semibold text-[#0a1a4a]">How to format section text</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        <li>
          Blank line between paragraphs
        </li>
        <li>
          Bullet list: start each line with <code className="text-[#0a1a4a]">- </code>
        </li>
        <li>
          Sub-heading: a line like <code className="text-[#0a1a4a]">### 3.1 Documented instructions</code>
        </li>
        <li>
          Bold word: <code className="text-[#0a1a4a]">**Customer Data**</code>
        </li>
        <li>
          Link: <code className="text-[#0a1a4a]">[Privacy Policy](/privacy)</code>
        </li>
      </ul>
    </div>
  );
}

export function DpaEditor({
  value,
  onChange,
}: {
  value: DpaContent;
  onChange: (v: DpaContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          DPA page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          The live DPA page has 4 parts (top → bottom), same idea as About. Open one part, edit,
          then Save draft → Preview → Publish.
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
        summary="Matches the top of /dpa — label, title, intro paragraph, date, and grey callout box."
        defaultOpen
      >
        <TextField
          label="Small label (above the title)"
          value={value.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, eyebrow })}
          hint='Example: "Legal · Article 28 UK GDPR"'
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
          hint='Change this whenever you publish DPA updates — e.g. "9 August 2026"'
        />
        <TextField
          label="Grey highlight box (under the intro)"
          value={value.callout}
          onChange={(callout) => onChange({ ...value, callout })}
          multiline
          rows={5}
          hint="Explains who is Processor vs Controller. Tip: wrap important names in **like this**"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Agreement sections"
        summary="Each card is one numbered block on /dpa (1. Definitions, 2. Scope, 3. Obligations…)."
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
                hint='Example: "1. Definitions and interpretation"'
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
                rows={12}
                hint="Write like a normal document. Use the formatting tips above for bold, bullets, and sub-headings."
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
                      if (!confirm("Remove this section from the DPA?")) return;
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
                  {
                    title: `${value.sections.length + 1}. New section`,
                    body: "Write the section text here.",
                  },
                ],
              })
            }
          >
            Add section
          </button>
        </div>
      </EditorPart>

      <EditorPart
        part={3}
        title="Sub-processors table"
        summary="Matches Schedule 1 on /dpa — one card per table row (company, what they do, where data is)."
      >
        <TextField
          label="Table section title"
          value={value.scheduleTitle}
          onChange={(scheduleTitle) => onChange({ ...value, scheduleTitle })}
          hint='Example: "Schedule 1: Pre-approved infrastructure sub-processors"'
        />
        <TextField
          label="Short intro above the table"
          value={value.scheduleIntro}
          onChange={(scheduleIntro) => onChange({ ...value, scheduleIntro })}
          multiline
          rows={3}
        />
        <div className="space-y-3">
          {value.subProcessors.map((row, index) => (
            <CardBlock
              key={index}
              label={`Row ${index + 1}${row.entity ? ` — ${row.entity}` : ""}`}
              hint="One company in the Schedule 1 table."
            >
              <TextField
                label="Company / sub-processor name"
                value={row.entity}
                onChange={(entity) =>
                  onChange({
                    ...value,
                    subProcessors: updateRow(value.subProcessors, index, { entity }),
                  })
                }
                hint='Example: "Stripe, Inc."'
              />
              <TextField
                label="What they do for OrderWeb"
                value={row.activity}
                onChange={(activity) =>
                  onChange({
                    ...value,
                    subProcessors: updateRow(value.subProcessors, index, { activity }),
                  })
                }
                multiline
                rows={4}
              />
              <TextField
                label="Where data is processed / safeguards"
                value={row.region}
                onChange={(region) =>
                  onChange({
                    ...value,
                    subProcessors: updateRow(value.subProcessors, index, { region }),
                  })
                }
                multiline
                rows={3}
                hint="Country or region, plus any transfer safeguards"
              />
              {value.subProcessors.length > 1 ? (
                <button
                  type="button"
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                  onClick={() => {
                    if (!confirm("Remove this sub-processor row?")) return;
                    onChange({
                      ...value,
                      subProcessors: value.subProcessors.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove row
                </button>
              ) : null}
            </CardBlock>
          ))}
          <button
            type="button"
            className="rounded-full border border-[#61c3ec]/40 bg-white px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
            onClick={() =>
              onChange({
                ...value,
                subProcessors: [
                  ...value.subProcessors,
                  {
                    entity: "New company",
                    activity: "Describe what they process.",
                    region: "United Kingdom",
                  },
                ],
              })
            }
          >
            Add company row
          </button>
        </div>
      </EditorPart>

      <EditorPart
        part={4}
        title="Sign-off"
        summary="Bottom of /dpa — two signature cards and the Privacy / Terms links."
      >
        <TextField
          label="Sign-off heading"
          value={value.executionTitle}
          onChange={(executionTitle) => onChange({ ...value, executionTitle })}
          hint='Example: "Execution and sign-off"'
        />
        <TextField
          label="Sign-off intro sentence"
          value={value.executionIntro}
          onChange={(executionIntro) => onChange({ ...value, executionIntro })}
          multiline
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CardBlock label="Left card — Processor">
            <TextField
              label="Small label"
              value={value.processorLabel}
              onChange={(processorLabel) => onChange({ ...value, processorLabel })}
              hint='Example: "For the Processor"'
            />
            <TextField
              label="Company name"
              value={value.processorName}
              onChange={(processorName) => onChange({ ...value, processorName })}
              hint='Example: "OrderWeb Ltd"'
            />
          </CardBlock>
          <CardBlock label="Right card — Controller">
            <TextField
              label="Small label"
              value={value.controllerLabel}
              onChange={(controllerLabel) => onChange({ ...value, controllerLabel })}
              hint='Example: "For the Controller"'
            />
            <TextField
              label="Placeholder name"
              value={value.controllerName}
              onChange={(controllerName) => onChange({ ...value, controllerName })}
              hint='Example: "[Restaurant name / entity]"'
            />
          </CardBlock>
        </div>
        <TextField
          label="Related links line"
          value={value.relatedNote}
          onChange={(relatedNote) => onChange({ ...value, relatedNote })}
          hint="Use [Privacy Policy](/privacy) and [Terms & Conditions](/terms) so links stay clickable."
        />
      </EditorPart>
    </div>
  );
}
