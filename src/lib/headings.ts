export type Heading = { id: string; text: string; level: 2 | 3 };

/** Strips the inline markdown the article renderer understands. */
export function plainText(value: string): string {
  return value
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function slugify(value: string): string {
  return (
    plainText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Returns a function producing unique, stable heading ids in document order. */
export function createHeadingIds(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** Collects h2/h3 headings; ids match those rendered by ArticleBody. */
export function extractHeadings(markdown: string): Heading[] {
  const nextId = createHeadingIds();
  const headings: Heading[] = [];

  for (const raw of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line.startsWith("### ")) {
      const text = plainText(line.slice(4));
      headings.push({ id: nextId(text), text, level: 3 });
    } else if (line.startsWith("## ")) {
      const text = plainText(line.slice(3));
      headings.push({ id: nextId(text), text, level: 2 });
    }
  }

  return headings;
}
