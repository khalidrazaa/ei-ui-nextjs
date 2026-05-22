import React from "react";

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a key={`${token}-${index}`} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }

    return <React.Fragment key={`${token}-${index}`}>{token}</React.Fragment>;
  });
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
      const quoteParts: string[] = [current.slice(2).trim()];
      index += 1;
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteParts.push(lines[index].trim().slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "quote", text: quoteParts.join(" ") });
      continue;
    }

    if (/^[-*]\s+/.test(current)) {
      const items: string[] = [current.replace(/^[-*]\s+/, "").trim()];
      index += 1;
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphParts: string[] = [current];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || next.startsWith("#") || next.startsWith("> ") || /^[-*]\s+/.test(next)) {
        break;
      }
      paragraphParts.push(next);
      index += 1;
    }

    blocks.push({ type: "p", text: paragraphParts.join(" ") });
  }

  return blocks;
}

type ArticleBodyProps = {
  content: string;
};

export default function ArticleBody({ content }: ArticleBodyProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="article-prose">
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          return <h1 key={`h1-${index}`}>{renderInline(block.text)}</h1>;
        }
        if (block.type === "h2") {
          return <h2 key={`h2-${index}`}>{renderInline(block.text)}</h2>;
        }
        if (block.type === "h3") {
          return <h3 key={`h3-${index}`}>{renderInline(block.text)}</h3>;
        }
        if (block.type === "quote") {
          return <blockquote key={`quote-${index}`}>{renderInline(block.text)}</blockquote>;
        }
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={`p-${index}`}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
