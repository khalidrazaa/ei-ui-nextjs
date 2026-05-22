import "server-only";

import { siteConfig } from "@/config/site";
import { Article, ArticleComment } from "@/types/article";

import { fetchPublicApi, isPublicApiConfigured } from "@/lib/public-api";
import { fallbackArticles } from "@/lib/fallback-articles";

export type PublishedArticleResult = {
  articles: Article[];
  usedFallback: boolean;
};

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
  const createdAt = article.created_at || article.published_at || new Date().toISOString();

  return {
    ...article,
    created_at: createdAt,
    tags: toArray(article.tags),
    keywords: toArray(article.keywords),
    status: article.status || "published",
    excerpt: article.excerpt || "No summary available yet.",
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

export async function getPublishedArticles(limit = 120): Promise<PublishedArticleResult> {
  const hostSite = normalizeHost(siteConfig.hostSite);

  if (!isPublicApiConfigured()) {
    return {
      articles: sortNewestFirst(fallbackArticles),
      usedFallback: true,
    };
  }

  try {
    const endpoint = `/public/articles?host_site=${encodeURIComponent(hostSite)}&limit=${limit}`;
    const response = await fetchPublicApi<Article[]>(endpoint, {
      next: { revalidate: 90 },
      cache: "no-store",
    });

    const normalized = sortNewestFirst(response.map(normalizeArticle)).filter(
      (article) => normalizeHost(article.host_site) === hostSite
    );

    if (normalized.length === 0) {
      return {
        articles: sortNewestFirst(fallbackArticles),
        usedFallback: true,
      };
    }

    return {
      articles: normalized,
      usedFallback: false,
    };
  } catch {
    return {
      articles: sortNewestFirst(fallbackArticles),
      usedFallback: true,
    };
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const hostSite = normalizeHost(siteConfig.hostSite);

  if (!isPublicApiConfigured()) {
    return fallbackArticles.find((article) => article.slug === slug) || null;
  }

  try {
    const endpoint = `/public/articles/${encodeURIComponent(slug)}?host_site=${encodeURIComponent(hostSite)}`;
    const article = await fetchPublicApi<Article>(endpoint, {
      next: { revalidate: 60 },
      cache: "no-store",
    });
    return normalizeArticle(article);
  } catch {
    return fallbackArticles.find((article) => article.slug === slug) || null;
  }
}

export async function getRelatedArticles(slug: string, limit = 4): Promise<Article[]> {
  const { articles } = await getPublishedArticles(120);
  return articles.filter((article) => article.slug !== slug).slice(0, limit);
}

export async function getCommentsForSlug(slug: string): Promise<ArticleComment[]> {
  const hostSite = normalizeHost(siteConfig.hostSite);

  if (!isPublicApiConfigured()) {
    return [];
  }

  try {
    const endpoint = `/public/articles/${encodeURIComponent(slug)}/comments?host_site=${encodeURIComponent(hostSite)}&limit=200`;
    return await fetchPublicApi<ArticleComment[]>(endpoint, {
      cache: "no-store",
    });
  } catch {
    return [];
  }
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
