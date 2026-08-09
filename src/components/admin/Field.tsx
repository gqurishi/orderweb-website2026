import { useState } from "react";

export function TextField({
  label,
  value,
  onChange,
  multiline,
  hint,
  maxLength,
  required,
  type = "text",
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  maxLength?: number;
  required?: boolean;
  type?: string;
  /** Textarea height when multiline */
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#0a1a4a]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {hint ? <span className="mt-0.5 block text-xs text-[#5b6b7c]">{hint}</span> : null}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          className="mt-1.5 w-full rounded-xl border border-[#61c3ec]/30 bg-white px-3 py-2 text-sm text-[#0a1a4a] outline-none focus:border-[#2f6fb8]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className="mt-1.5 w-full rounded-xl border border-[#61c3ec]/30 bg-white px-3 py-2 text-sm text-[#0a1a4a] outline-none focus:border-[#2f6fb8]"
        />
      )}
      {typeof maxLength === "number" ? (
        <span className="mt-1 block text-right text-[11px] text-[#5b6b7c]">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </label>
  );
}

export function ListField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  return (
    <TextField
      label={label}
      hint={hint ?? "One item per line"}
      multiline
      value={value.join("\n")}
      onChange={(v) =>
        onChange(
          v
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
      <h2 className="text-lg text-[#0a1a4a]">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

/** Numbered page section for non-technical editors (Part 1, Part 2…). */
export function EditorPart({
  part,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  part: number;
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      id={`editor-part-${part}`}
      className="scroll-mt-6 rounded-2xl border border-[#61c3ec]/25 bg-white shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-[#f8fbfe]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#61c3ec] to-[#2f6fb8] text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(47,111,184,0.9)]">
          {part}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
            Part {part}
          </span>
          <span className="mt-0.5 block font-[family-name:var(--font-display)] text-xl leading-tight text-[#0a1a4a]">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-[#5b6b7c]">
            {summary}
          </span>
        </span>
        <span className="mt-1 shrink-0 rounded-full border border-[#61c3ec]/35 px-3 py-1 text-xs font-semibold text-[#2f6fb8]">
          {open ? "Hide" : "Edit"}
        </span>
      </button>
      {open ? (
        <div className="grid gap-4 border-t border-[#61c3ec]/20 px-5 py-5">{children}</div>
      ) : null}
    </section>
  );
}

/** Nested card block inside an EditorPart. */
export function CardBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#f3f9fc] p-4 ring-1 ring-[#61c3ec]/20">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6fb8]">
        {label}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#5b6b7c]">{hint}</p> : null}
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}
