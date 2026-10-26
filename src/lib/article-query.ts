import { ARTICLES_PAGE_SIZE, DEFAULT_SORT, type SortOrder } from "@/config/listing";
import { Article } from "@/types/article";

/**
 * Everything the Articles page can filter by. It lives in the URL so views are
 * shareable. Production filters and pagination use the complete build snapshot,
 * keeping listing links consistent with the generated article pages.
 */
export type ArticleQuery = {
  q: string;
  category: string | null;
  subcategory: string | null;
  sort: SortOrder;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseArticleQuery(params: RawParams): ArticleQuery {
  const page = Number.parseInt(first(params.page), 10);

  return {
    q: first(params.q).trim(),
    category: first(params.category).trim() || null,
    subcategory: first(params.sub).trim() || null,
    sort: first(params.sort) === "oldest" ? "oldest" : DEFAULT_SORT,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Builds an /articles URL, dropping defaults so links stay short. */
export function articlesHref(query: Partial<ArticleQuery>): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.category && query.subcategory) params.set("sub", query.subcategory);
  if (query.sort && query.sort !== DEFAULT_SORT) params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));

  const search = params.toString();
  return search ? `/articles?${search}` : "/articles";
}

function label(value: string | null | undefined, fallback: string): string {
  const text = (value || "").trim();
  return text || fallback;
}

export function articleCategory(article: Pick<Article, "category">): string {
  return label(article.category, "");
}

export function articleSubcategory(article: Pick<Article, "subcategory">): string {
  return label(article.subcategory, "General");
}

function publishedTime(article: Pick<Article, "published_at" | "created_at">): number {
  return new Date(article.published_at || article.created_at || "").getTime() || 0;
}

export type ArticleResults = {
  items: Article[];
  total: number;
  page: number;
  pages: number;
};

export function queryArticles(articles: Article[], query: ArticleQuery): ArticleResults {
  const needle = query.q.toLowerCase();

  const matches = articles.filter((article) => {
    if (query.category && articleCategory(article) !== query.category) return false;
    if (query.subcategory && articleSubcategory(article) !== query.subcategory) return false;
    if (!needle) return true;

    return [
      article.title,
      articleCategory(article),
      articleSubcategory(article),
      article.excerpt,
      ...(article.tags || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const direction = query.sort === "oldest" ? 1 : -1;
  matches.sort((left, right) => direction * (publishedTime(left) - publishedTime(right)));

  const pages = Math.max(1, Math.ceil(matches.length / ARTICLES_PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const start = (page - 1) * ARTICLES_PAGE_SIZE;

  return { items: matches.slice(start, start + ARTICLES_PAGE_SIZE), total: matches.length, page, pages };
}

export type CategoryGroup = {
  category: string;
  count: number;
  branches: Array<{ subcategory: string; count: number }>;
};

/** Categories and subcategories with counts, alphabetical. */
export function buildCategoryIndex(articles: Article[]): CategoryGroup[] {
  const grouped = new Map<string, Map<string, number>>();

  for (const article of articles) {
    const category = articleCategory(article);
    if (!category) continue;

    const subcategory = articleSubcategory(article);
    const branches = grouped.get(category) || new Map<string, number>();
    branches.set(subcategory, (branches.get(subcategory) || 0) + 1);
    grouped.set(category, branches);
  }

  return Array.from(grouped, ([category, branches]) => ({
    category,
    count: Array.from(branches.values()).reduce((total, value) => total + value, 0),
    branches: Array.from(branches, ([subcategory, count]) => ({ subcategory, count })).sort((a, b) =>
      a.subcategory.localeCompare(b.subcategory),
    ),
  })).sort((a, b) => a.category.localeCompare(b.category));
}
