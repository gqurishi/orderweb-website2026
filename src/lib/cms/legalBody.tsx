import type { ReactNode } from "react";

/** Renders CMS legal text: paragraphs, "- " bullets, ### headings, **bold**, [label](url). */
export function LegalBody({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 1 && lines[0]!.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="pt-1 text-base font-medium text-[#0a1a4a] sm:text-lg"
            >
              {formatInline(lines[0]!.slice(4))}
            </h3>
          );
        }
        const isList =
          lines.length > 0 &&
          lines.every((l) => l.startsWith("- ") || l.startsWith("• "));
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{formatInline(line.replace(/^[-•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{formatInline(lines.join(" "))}</p>;
      })}
    </>
  );
}

function formatInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0]!;
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`b-${key++}`} className="text-[#0a1a4a]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = match[2]!;
      const href = match[3]!;
      nodes.push(
        <a
          key={`a-${key++}`}
          href={href}
          className="font-medium text-primary hover:underline"
        >
          {label}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
