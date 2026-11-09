import React from "react";

import ArticleImage from "@/components/articles/ArticleImage";
import { createHeadingIds, plainText } from "@/lib/headings";
import { collectMarkdownImageDefinitions, markdownTableCells, parseMarkdownImageAt, type MarkdownImage, type MarkdownImageDefinition } from "@/lib/markdownImages";

/** Only http(s), site-relative and in-page links are allowed. */
export function safeHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  return undefined;
}

function renderInline(text: string, definitions: ReadonlyMap<string, MarkdownImageDefinition>): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let plain = "";
  const flush = () => {
    if (plain) { nodes.push(<React.Fragment key={nodes.length}>{plain}</React.Fragment>); plain = ""; }
  };
  for (let index = 0; index < text.length;) {
    if (text[index] === "\\" && /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~]/.test(text[index + 1] || "")) {
      plain += text[index + 1]; index += 2; continue;
    }
    if (text[index] === "`") {
      const run = text.slice(index).match(/^`+/)![0];
      let end = text.indexOf(run, index + run.length);
      while (end >= 0 && (text[end - 1] === "`" || text[end + run.length] === "`")) end = text.indexOf(run, end + run.length);
      if (end >= 0) {
        flush(); nodes.push(<code key={nodes.length}>{text.slice(index + run.length, end)}</code>);
        index = end + run.length; continue;
      }
      plain += run; index += run.length; continue;
    }
    const image = parseMarkdownImageAt(text, index, definitions);
    if (image) {
      flush(); nodes.push(<ArticleImage key={nodes.length} src={image.destination} alt={image.alt} title={image.title} inline />);
      index = image.end; continue;
    }
    const rest = text.slice(index);
    const link = rest.match(/^\[([^\]]*)\]\(([^)]+)\)/);
    if (link) {
      flush();
      const href = safeHref(link[2].trim());
      nodes.push(href ? <a key={nodes.length} href={href} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link[1] || href}</a> : <span key={nodes.length}>{link[1]}</span>);
      index += link[0].length; continue;
    }
    const bold = rest.match(/^\*\*([^*]+)\*\*/);
    const italic = rest.match(/^\*([^*\s][^*]*)\*/);
    if (bold || italic) {
      const match = (bold || italic)!;
      flush();
      const children = renderInline(match[1], definitions);
      nodes.push(bold ? <strong key={nodes.length}>{children}</strong> : <em key={nodes.length}>{children}</em>);
      index += match[0].length; continue;
    }
    plain += text[index]; index += 1;
  }
  flush();
  return nodes;
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
  | { type: "image"; image: MarkdownImage }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" };

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+[.)]\s+/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;
const TABLE_DIVIDER = /^\|?\s*:?-{3,}/;

function isTableStart(lines: string[], index: number): boolean {
  return lines[index].includes("|") && index + 1 < lines.length && TABLE_DIVIDER.test(lines[index + 1].trim());
}

function standaloneImage(line: string, definitions: ReadonlyMap<string, MarkdownImageDefinition>): MarkdownImage | null {
  const image = parseMarkdownImageAt(line, 0, definitions);
  return image && image.end === line.length ? image : null;
}

function startsNewBlock(lines: string[], index: number, definitions: ReadonlyMap<string, MarkdownImageDefinition>): boolean {
  const line = lines[index].trim();
  return (
    !line ||
    line.startsWith("#") ||
    line.startsWith("> ") ||
    /^(?:`{3,}|~{3,})/.test(line) ||
    standaloneImage(line, definitions) !== null ||
    BULLET.test(line) ||
    ORDERED.test(line) ||
    RULE.test(line) ||
    isTableStart(lines, index)
  );
}

function parseMarkdownBlocks(markdown: string, definitions: ReadonlyMap<string, MarkdownImageDefinition>): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const current = lines[index].trim();

    if (!current) {
      index += 1;
      continue;
    }

    if (/^(?: {4}|\t)/.test(lines[index])) {
      const code: string[] = [];
      while (index < lines.length && /^(?: {4}|\t)/.test(lines[index])) {
        code.push(lines[index].replace(/^(?: {4}|\t)/, ""));
        index += 1;
      }
      blocks.push({ type: "code", lang: "", code: code.join("\n") });
      continue;
    }

    const fence = current.match(/^(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const lang = fence[2].trim();
      const code: string[] = [];
      index += 1;
      const closing = new RegExp(`^${fence[1][0]}{${fence[1].length},}\\s*$`);
      while (index < lines.length && !closing.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    const image = standaloneImage(current, definitions);
    if (image) {
      blocks.push({ type: "image", image });
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const head = markdownTableCells(current);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(markdownTableCells(lines[index]));
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
    while (index < lines.length && !startsNewBlock(lines, index, definitions)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join("\n") });
  }

  return blocks;
}

type ArticleBodyProps = {
  content: string;
  /** When set, a leading heading identical to the title is dropped (the page header already shows it). */
  title?: string;
};

export default function ArticleBody({ content, title }: ArticleBodyProps) {
  const document = collectMarkdownImageDefinitions(content);
  const parsed = parseMarkdownBlocks(document.content, document.definitions);
  const inline = (text: string) => renderInline(text, document.definitions);
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
            return <h1 key={index}>{inline(block.text)}</h1>;
          case "h2":
            return (
              <h2 key={index} id={nextId(plainText(block.text))}>
                {inline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} id={nextId(plainText(block.text))}>
                {inline(block.text)}
              </h3>
            );
          case "quote":
            return <blockquote key={index}>{inline(block.text)}</blockquote>;
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
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
          case "image":
            return <ArticleImage key={index} src={block.image.destination} alt={block.image.alt} title={block.image.title} />;
          case "table":
            return (
              <div key={index} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {block.head.map((cell, cellIndex) => (
                        <th key={cellIndex}>{inline(cell)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{inline(cell)}</td>
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
            return <p key={index}>{inline(block.text)}</p>;
        }
      })}
    </div>
  );
}
