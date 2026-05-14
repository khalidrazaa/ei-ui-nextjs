import { Article } from "@/types/article";

export function formatDate(value?: string | null): string {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function formatReadingTime(minutes?: number | null): string {
  if (!minutes || minutes < 1) {
    return "3 min read";
  }
  return `${minutes} min read`;
}

export function articlePath(article: Pick<Article, "slug">): string {
  return `/articles/${article.slug}`;
}

export function summarizeText(value?: string | null, maxLength = 190): string {
  const text = (value || "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "More details coming soon.";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}
