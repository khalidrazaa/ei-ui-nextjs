import ArticleSearchForm from "@/components/articles/ArticleSearchForm";
import { CategoryChips, CategoryList } from "@/components/articles/CategoryNav";
import SegmentedLinks from "@/components/common/SegmentedLinks";
import { sortOptions } from "@/config/listing";
import { ArticleQuery, CategoryGroup, articlesHref } from "@/lib/article-query";
import { Article } from "@/types/article";

type ArticleFilterPanelProps = {
  groups: CategoryGroup[];
  uncategorizedArticles: Pick<Article, "slug" | "title">[];
  total: number;
  query: ArticleQuery;
};

function Heading({ total, topics }: { total: number; topics: number }) {
  return (
    <header className="flex flex-col gap-0.5">
      <h1 className="text-2xl">Articles</h1>
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "article" : "articles"}
        {topics > 0 && <> · {topics} {topics === 1 ? "topic" : "topics"}</>}
      </p>
    </header>
  );
}

function SortLinks({ query }: { query: ArticleQuery }) {
  return (
    <SegmentedLinks
      label="Sort order"
      fill
      options={sortOptions.map((option) => ({
        label: option.label,
        href: articlesHref({ ...query, sort: option.value, page: 1 }),
        active: query.sort === option.value,
      }))}
    />
  );
}

/** Desktop: one sticky side panel holding the title, search, sort and categories. */
export function ArticleSidePanel({ groups, uncategorizedArticles, total, query }: ArticleFilterPanelProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(var(--header-height)+1.25rem)] flex max-h-[calc(100dvh-var(--header-height)-2.5rem)] flex-col gap-5">
        <Heading total={total} topics={groups.length} />
        <ArticleSearchForm query={query} />
        <SortLinks query={query} />

        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Browse articles</p>
          <CategoryList groups={groups} uncategorizedArticles={uncategorizedArticles} total={total} query={query} />
        </div>
      </div>
    </aside>
  );
}

/** Mobile: the same controls stacked above the results. */
export function ArticleTopControls({ groups, uncategorizedArticles, total, query }: ArticleFilterPanelProps) {
  return (
    <div className="flex flex-col gap-4 lg:hidden">
      <Heading total={total} topics={groups.length} />
      <ArticleSearchForm query={query} />
      <CategoryChips groups={groups} uncategorizedArticles={uncategorizedArticles} total={total} query={query} />
      <SortLinks query={query} />
    </div>
  );
}
