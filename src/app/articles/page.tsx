import type { Metadata } from "next";
import Link from "next/link";

import ActiveFilters from "@/components/articles/ActiveFilters";
import ArticleCard from "@/components/articles/ArticleCard";
import { ArticleSidePanel, ArticleTopControls } from "@/components/articles/ArticleFilterPanel";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { ARTICLES_PAGE_SIZE } from "@/config/listing";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/articles";
import { articleCategory, articlesHref, buildCategoryIndex, parseArticleQuery, queryArticles } from "@/lib/article-query";

type ArticlesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const query = parseArticleQuery(await searchParams);
  const filtered = Boolean(query.q || query.category || query.page > 1 || query.sort !== "newest");

  return {
    title: "Articles",
    description: `Published stories on ${siteConfig.brandName}`,
    alternates: { canonical: "/articles" },
    // Filtered and paged views are for people; keep the clean URL as the indexed one.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const query = parseArticleQuery(await searchParams);
  const { articles } = await getPublishedArticles();

  const results = queryArticles(articles, query);
  const groups = buildCategoryIndex(articles);
  const uncategorizedArticles = articles.filter((article) => !articleCategory(article));
  const filtered = Boolean(query.q || query.category);

  const first = results.total === 0 ? 0 : (results.page - 1) * ARTICLES_PAGE_SIZE + 1;
  const last = first + results.items.length - (results.total === 0 ? 0 : 1);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <ArticleSidePanel groups={groups} uncategorizedArticles={uncategorizedArticles} total={articles.length} query={query} />

      <div className="flex min-w-0 flex-col gap-5">
        <ArticleTopControls groups={groups} uncategorizedArticles={uncategorizedArticles} total={articles.length} query={query} />

        <ActiveFilters query={query} />

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.total === 0
            ? "No matching articles"
            : `Showing ${first}–${last} of ${results.total} ${results.total === 1 ? "article" : "articles"}`}
        </p>

        {results.total === 0 ? (
          <EmptyState
            title={filtered ? "No articles match these filters" : "No articles published yet"}
            description={filtered ? "Try a different keyword or remove a filter." : undefined}
          >
            {filtered && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/articles">Clear filters</Link>
              </Button>
            )}
          </EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.items.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={results.page}
          pages={results.pages}
          hrefFor={(page) => articlesHref({ ...query, page })}
        />
      </div>
    </div>
  );
}
