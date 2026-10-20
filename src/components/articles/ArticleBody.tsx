import React from "react";

import { createHeadingIds, plainText } from "@/lib/headings";

/** Only http(s), site-relative and in-page links are allowed. */
export function safeHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  return undefined;
}

const INLINE = /(!?\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;

function renderInline(text: string): React.ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, index) => {
      const link = part.match(/^(!?)\[([^\]]*)\]\(([^)]+)\)$/);
      if (link) {
        const [, isImage, label, target] = link;
        const href = safeHref(target.trim());
        if (!href) return <span key={index}>{label}</span>;
        const external = /^https?:/i.test(href);
        return (
          <a key={index} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {label || (isImage ? "View image" : href)}
          </a>
        );
      }
      if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
      if (part.length > 2 && part.startsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

type Edge = { from: string; to: string; label: string };

/** Parses the small `flowchart TD` subset; anything else is rejected, never executed. */
export function parseFlow(source: string): { nodes: [string, string][]; edges: Edge[] } | null {
  const lines = source
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!/^(flowchart|graph) (TD|TB|LR)$/.test(lines.shift() || "")) return null;

  const nodes = new Map<string, string>();
  const edges: Edge[] = [];
  const endpoint = (value: string) => {
    const match = value.trim().match(/^([A-Za-z]\w*)(?:\[([^\]<>]{1,100})\])?$/);
    if (!match) return null;
    if (!nodes.has(match[1]) || match[2]) nodes.set(match[1], match[2] || match[1]);
    return match[1];
  };

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*-->(?:\|([^|<>]{1,60})\|)?\s*(.+?)\s*;?$/);
    if (!match) {
      if (!endpoint(line)) return null;
      continue;
    }
    const from = endpoint(match[1]);
    const to = endpoint(match[3]);
    if (!from || !to || from === to) return null;
    edges.push({ from, to, label: match[2] || "" });
  }

  if (!edges.length || nodes.size > 16) return null;
  return { nodes: [...nodes], edges };
}

const NODE_GAP = 110;

function Flow({ source }: { source: string }) {
  const flow = parseFlow(source);
  if (!flow) {
    return (
      <div role="note">
        <p>Diagram syntax is not supported by the safe flow renderer. Revise before publishing.</p>
        <pre>{source}</pre>
      </div>
    );
  }

  const height = flow.nodes.length * NODE_GAP;
  const index = (id: string) => flow.nodes.findIndex(([key]) => key === id);

  return (
    <figure className="overflow-x-auto rounded-xl border border-border bg-card p-3">
      <svg
        role="img"
        aria-label="Data flow diagram; connections described below"
        viewBox={`0 0 660 ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
      >
        {flow.edges.map((edge, edgeIndex) => {
          const y1 = index(edge.from) * NODE_GAP + 65;
          const y2 = index(edge.to) * NODE_GAP + 15;
          const adjacent = index(edge.to) === index(edge.from) + 1;

          return (
            <g key={edgeIndex} fill="none" strokeWidth="2" className="stroke-muted-foreground">
              <path
                d={adjacent ? `M330 ${y1} L330 ${y2 - 6}` : `M510 ${y1 - 25} C610 ${y1 - 25} 610 ${y2 + 25} 510 ${y2 + 25}`}
              />
              {adjacent ? (
                <path d={`M325 ${y2 - 12} L330 ${y2 - 6} L335 ${y2 - 12}`} />
              ) : (
                <path d={`M518 ${y2 + 20} L510 ${y2 + 25} L518 ${y2 + 30}`} />
              )}
              {adjacent && (
                <text x="340" y={(y1 + y2) / 2 + 4} stroke="none" fontSize="13" className="fill-muted-foreground">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        {flow.nodes.map(([id, label], nodeIndex) => (
          <g key={id}>
            <rect
              x="150"
              y={nodeIndex * NODE_GAP + 15}
              width="360"
              height="50"
              rx="8"
              className="fill-accent stroke-primary/40"
            />
            <text
              x="330"
              y={nodeIndex * NODE_GAP + 45}
              textAnchor="middle"
              fontSize={label.length > 42 ? "11" : "14"}
              className="fill-foreground"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {flow.edges
          .map(
            (edge) =>
              `${flow.nodes[index(edge.from)][1]} → ${flow.nodes[index(edge.to)][1]}${edge.label ? ` (${edge.label})` : ""}`,
          )
          .join("; ")}
      </figcaption>
    </figure>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" };

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+[.)]\s+/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;
const TABLE_DIVIDER = /^\|?\s*:?-{3,}/;

const tableCells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

function isTableStart(lines: string[], index: number): boolean {
  return lines[index].includes("|") && index + 1 < lines.length && TABLE_DIVIDER.test(lines[index + 1].trim());
}

function startsNewBlock(lines: string[], index: number): boolean {
  const line = lines[index].trim();
  return (
    !line ||
    line.startsWith("#") ||
    line.startsWith("> ") ||
    line.startsWith("```") ||
    BULLET.test(line) ||
    ORDERED.test(line) ||
    RULE.test(line) ||
    isTableStart(lines, index)
  );
}

function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const current = lines[index].trim();

    if (!current) {
      index += 1;
      continue;
    }

    if (current.startsWith("```")) {
      const lang = current.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    if (isTableStart(lines, index)) {
      const head = tableCells(current);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", head, rows });
      continue;
    }

    if (RULE.test(current)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (current.startsWith("### ")) {
      blocks.push({ type: "h3", text: current.slice(4).trim() });
      index += 1;
      continue;
    }

    if (current.startsWith("## ")) {
      blocks.push({ type: "h2", text: current.slice(3).trim() });
      index += 1;
      continue;
    }

    if (current.startsWith("# ")) {
      blocks.push({ type: "h1", text: current.slice(2).trim() });
      index += 1;
      continue;
    }

    if (current.startsWith("> ")) {
      const parts: string[] = [current.slice(2).trim()];
      index += 1;
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        parts.push(lines[index].trim().slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "quote", text: parts.join(" ") });
      continue;
    }

    const listPattern = BULLET.test(current) ? BULLET : ORDERED.test(current) ? ORDERED : null;
    if (listPattern) {
      const items: string[] = [];
      while (index < lines.length && listPattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(listPattern, "").trim());
        index += 1;
      }
      blocks.push({ type: listPattern === ORDERED ? "ol" : "ul", items });
      continue;
    }

    const paragraph: string[] = [current];
    index += 1;
    while (index < lines.length && !startsNewBlock(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}

type ArticleBodyProps = {
  content: string;
  /** When set, a leading heading identical to the title is dropped (the page header already shows it). */
  title?: string;
};

export default function ArticleBody({ content, title }: ArticleBodyProps) {
  const parsed = parseMarkdownBlocks(content);
  const first = parsed[0];
  const nextId = createHeadingIds();
  const blocks =
    title && first?.type === "h1" && first.text.trim().toLowerCase() === title.trim().toLowerCase()
      ? parsed.slice(1)
      : parsed;

  return (
    <div className="article-prose break-words">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h1":
            return <h1 key={index}>{renderInline(block.text)}</h1>;
          case "h2":
            return (
              <h2 key={index} id={nextId(plainText(block.text))}>
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} id={nextId(plainText(block.text))}>
                {renderInline(block.text)}
              </h3>
            );
          case "quote":
            return <blockquote key={index}>{renderInline(block.text)}</blockquote>;
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "code":
            return block.lang === "mermaid" ? (
              <Flow key={index} source={block.code} />
            ) : (
              <pre key={index} data-language={block.lang || undefined}>
                <code>{block.code}</code>
              </pre>
            );
          case "table":
            return (
              <div key={index} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {block.head.map((cell, cellIndex) => (
                        <th key={cellIndex}>{renderInline(cell)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={index} />;
          default:
            return <p key={index}>{renderInline(block.text)}</p>;
        }
      })}
    </div>
  );
}
