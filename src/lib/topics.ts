import { Article } from "@/types/article";

export type Topic = { name: string; count: number };

/** Categories with their article counts, most populated first. */
export function getTopics(articles: Article[]): Topic[] {
  const counts = new Map<string, number>();

  for (const article of articles) {
    const name = (article.category || "").trim();
    if (name) counts.set(name, (counts.get(name) || 0) + 1);
  }

  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  );
}

export function topicHref(name: string): string {
  return `/articles?category=${encodeURIComponent(name)}`;
}
