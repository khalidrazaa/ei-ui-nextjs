import Image from "next/image";
import React from "react";

import { createHeadingIds, plainText } from "@/lib/headings";

type Block =
  | { type: "h1" | "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "image"; alt: string; src: string }
  | { type: "hr" };

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 675;

function renderInline(text: string): React.ReactNode[] {
  const tokens = text
    .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.length > 2 && token.startsWith("*") && token.endsWith("*")) {
      return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a key={`${token}-${index}`} href={href} target="_blank" rel="noreferrer noopener">
          {label}
        </a>
      );
    }

    return <React.Fragment key={`${token}-${index}`}>{token}</React.Fragment>;
  });
}

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+[.)]\s+/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;

function startsNewBlock(line: string): boolean {
  return (
    !line ||
    line.startsWith("#") ||
    line.startsWith("> ") ||
    line.startsWith("```") ||
    BULLET.test(line) ||
    ORDERED.test(line) ||
    IMAGE.test(line) ||
    RULE.test(line)
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

    if (RULE.test(current)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const image = current.match(IMAGE);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2] });
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
    while (index < lines.length && !startsNewBlock(lines[index].trim())) {
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
    <div className="article-prose">
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
            return (
              <pre key={index} data-language={block.lang || undefined}>
                <code>{block.code}</code>
              </pre>
            );
          case "image":
            return (
              <figure key={index}>
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  className="h-auto w-full rounded-xl border border-border"
                  unoptimized
                />
                {block.alt && <figcaption>{block.alt}</figcaption>}
              </figure>
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
