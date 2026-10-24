import "server-only";

import { cache } from "react";

import { siteConfig } from "@/config/site";
import publishedArticles from "@/generated/published-articles.json";
import { Article, ArticleComment } from "@/types/article";

import { fetchPublicApi } from "@/lib/public-api";

export type PublishedArticleResult = {
  articles: Article[];
};

// The backend currently caps this unpaginated endpoint at 500 records.
const PUBLIC_ARTICLES_LIMIT = 500;

function normalizeHost(value?: string | null): string {
  const host = (value || "").trim().toLowerCase();
  const noProto = host.replace(/^https?:\/\//, "").split("/")[0] || "";
  return noProto.startsWith("www.") ? noProto.slice(4) : noProto;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function normalizeArticle(article: Article): Article {
  const createdAt = article.created_at || article.published_at || null;

  return {
    ...article,
    created_at: createdAt,
    tags: toArray(article.tags),
    keywords: toArray(article.keywords),
    excerpt: article.excerpt || "",
    content: article.content || "",
    host_site: normalizeHost(article.host_site || siteConfig.hostSite),
    reading_time: typeof article.reading_time === "number" ? article.reading_time : null,
  };
}

function sortNewestFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const left = new Date(a.published_at || a.created_at || "").getTime();
    const right = new Date(b.published_at || b.created_at || "").getTime();
    return right - left;
  });
}

const loadPublishedArticles = cache(async (): Promise<Article[]> => {
  const hostSite = normalizeHost(siteConfig.hostSite);

  // Development stays live. Production pages, filters and navigation all use
  // the same bundled snapshot, so no link can point at an unbuilt article.
  const endpoint = "/public/articles?host_site=" + encodeURIComponent(hostSite) + "&limit=" + PUBLIC_ARTICLES_LIMIT;
  const response = process.env.NODE_ENV === "development"
    ? await fetchPublicApi<Article[]>(endpoint, { cache: "no-store" })
    : publishedArticles as Article[];
  if (!Array.isArray(response)) {
    throw new Error("Invalid article list response.");
  }
  if (response.length >= PUBLIC_ARTICLES_LIMIT) {
    throw new Error("The public article API reached its 500-article limit. Add backend pagination before building so no published pages are omitted.");
  }

  const slugs = new Set<string>();
  const articles = response.map((article) => {
    if (!article || typeof article.slug !== "string" || !article.slug.trim() || slugs.has(article.slug)) {
      throw new Error("The public article API returned an invalid or duplicate slug.");
    }
    slugs.add(article.slug);
    return normalizeArticle(article);
  }).filter((article) => article.host_site === hostSite && (!article.status || article.status === "published"));

  return sortNewestFirst(articles);
});

export async function getPublishedArticles(limit?: number): Promise<PublishedArticleResult> {
  const articles = await loadPublishedArticles();
  const selected = limit === undefined ? articles : articles.slice(0, limit);
  return {
    articles: selected.map((article) => {
      // Cards and carousels cross client boundaries; don't send full article
      // bodies to the browser when only their summaries are displayed.
      const summary = { ...article };
      delete summary.content;
      return summary;
    }),
  };
}

export async function getAllPublishedArticleSlugs(): Promise<string[]> {
  return (await loadPublishedArticles()).map((article) => article.slug);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // The published list already includes full content and metadata. Reuse that
  // build snapshot instead of making another API request for every page.
  return (await loadPublishedArticles()).find((article) => article.slug === slug) || null;
}


export async function getCommentsForSlug(slug: string): Promise<ArticleComment[]> {
  const hostSite = normalizeHost(siteConfig.hostSite);

  const endpoint = "/public/articles/" + encodeURIComponent(slug) + "/comments?host_site=" + encodeURIComponent(hostSite) + "&limit=200";
  return fetchPublicApi<ArticleComment[]>(endpoint, { cache: "no-store" });
}

export async function createCommentForSlug(
  slug: string,
  payload: { author_name: string; content: string }
): Promise<ArticleComment> {
  const hostSite = normalizeHost(siteConfig.hostSite);
  const endpoint = `/public/articles/${encodeURIComponent(slug)}/comments?host_site=${encodeURIComponent(hostSite)}`;

  return fetchPublicApi<ArticleComment>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
