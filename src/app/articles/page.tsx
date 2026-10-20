import type { Metadata } from "next";
import Link from "next/link";

import ActiveFilters from "@/components/articles/ActiveFilters";
import ArticleCard from "@/components/articles/ArticleCard";
import CategoryNav from "@/components/articles/CategoryNav";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import SearchField from "@/components/common/SearchField";
import SegmentedLinks from "@/components/common/SegmentedLinks";
import { Button } from "@/components/ui/button";
import { ARTICLES_FETCH_LIMIT, ARTICLES_PAGE_SIZE, sortOptions } from "@/config/listing";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/articles";
import { articlesHref, buildCategoryIndex, parseArticleQuery, queryArticles } from "@/lib/article-query";

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
  const { articles } = await getPublishedArticles(ARTICLES_FETCH_LIMIT);

  const results = queryArticles(articles, query);
  const groups = buildCategoryIndex(articles);
  const filtered = Boolean(query.q || query.category);

  const first = results.total === 0 ? 0 : (results.page - 1) * ARTICLES_PAGE_SIZE + 1;
  const last = first + results.items.length - (results.total === 0 ? 0 : 1);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1>Articles</h1>
        <p className="text-muted-foreground">
          {articles.length} {articles.length === 1 ? "article" : "articles"} across {groups.length}{" "}
          {groups.length === 1 ? "topic" : "topics"}.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <CategoryNav groups={groups} total={articles.length} query={query} />

        <section className="flex min-w-0 flex-col gap-5" aria-label="Article results">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form action="/articles" method="get" role="search" className="flex flex-1 gap-2 md:max-w-md">
              {query.category && <input type="hidden" name="category" value={query.category} />}
              {query.category && query.subcategory && <input type="hidden" name="sub" value={query.subcategory} />}
              {query.sort !== "newest" && <input type="hidden" name="sort" value={query.sort} />}
              <SearchField
                name="q"
                label="Search articles"
                placeholder="Search title, topic or tag"
                defaultValue={query.q}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <SegmentedLinks
              label="Sort order"
              options={sortOptions.map((option) => ({
                label: option.label,
                href: articlesHref({ ...query, sort: option.value, page: 1 }),
                active: query.sort === option.value,
              }))}
            />
          </div>

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
        </section>
      </div>
    </div>
  );
}
