import Link from "next/link";

import { ArticleQuery, CategoryGroup, articlesHref } from "@/lib/article-query";
import { articlePath } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type CategoryNavProps = {
  groups: CategoryGroup[];
  uncategorizedArticles: Pick<Article, "slug" | "title">[];
  total: number;
  query: ArticleQuery;
};

function hrefFor(query: ArticleQuery, category: string | null, subcategory: string | null = null) {
  return articlesHref({ ...query, category, subcategory, page: 1 });
}

function Count({ value }: { value: number }) {
  return <span className="ml-auto pl-2 text-xs tabular-nums text-muted-foreground">{value}</span>;
}

const rowClass =
  "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent/60";

/** Categories with subcategories, plus direct links to uncategorized articles. */
export function CategoryList({ groups, uncategorizedArticles, total, query }: CategoryNavProps) {
  return (
    <nav aria-label="Browse articles" className="flex flex-col gap-0.5">
      <Link
        href={hrefFor(query, null)}
        aria-current={!query.category ? "page" : undefined}
        className={cn(rowClass, !query.category && "bg-accent font-medium text-accent-foreground")}
      >
        All articles
        <Count value={total} />
      </Link>

      {groups.map((group) => {
        const active = query.category === group.category;

        return (
          <div key={group.category} className="flex flex-col">
            <Link
              href={hrefFor(query, group.category)}
              aria-current={active && !query.subcategory ? "page" : undefined}
              className={cn(
                rowClass,
                "font-medium",
                active && !query.subcategory && "bg-accent text-accent-foreground",
              )}
            >
              {group.category}
              <Count value={group.count} />
            </Link>

            {active && (
              <ul className="ml-3 flex flex-col border-l border-border pl-2">
                {group.branches.map((branch) => {
                  const branchActive = query.subcategory === branch.subcategory;

                  return (
                    <li key={branch.subcategory}>
                      <Link
                        href={hrefFor(query, group.category, branch.subcategory)}
                        aria-current={branchActive ? "page" : undefined}
                        className={cn(
                          rowClass,
                          "text-muted-foreground",
                          branchActive && "bg-accent font-medium text-accent-foreground",
                        )}
                      >
                        {branch.subcategory}
                        <Count value={branch.count} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {uncategorizedArticles.map((article) => (
        <Link key={article.slug} href={articlePath(article)} className={cn(rowClass, "leading-snug")}>
          {article.title}
        </Link>
      ))}
    </nav>
  );
}

const chipClass =
  "shrink-0 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent";
const chipActiveClass = "border-primary bg-primary text-primary-foreground hover:bg-primary";

/** Mobile: scrollable categories and article titles, plus active subcategories. */
export function CategoryChips({ groups, uncategorizedArticles, query }: CategoryNavProps) {
  const active = groups.find((group) => group.category === query.category);

  return (
    <div className="flex min-w-0 flex-col gap-2 lg:hidden">
      <nav aria-label="Browse articles" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        <Link href={hrefFor(query, null)} className={cn(chipClass, !query.category && chipActiveClass)}>
          All
        </Link>
        {groups.map((group) => (
          <Link
            key={group.category}
            href={hrefFor(query, group.category)}
            className={cn(chipClass, query.category === group.category && chipActiveClass)}
          >
            {group.category}
          </Link>
        ))}
        {uncategorizedArticles.map((article) => (
          <Link
            key={article.slug}
            href={articlePath(article)}
            title={article.title}
            className={cn(chipClass, "max-w-72 truncate")}
          >
            {article.title}
          </Link>
        ))}
      </nav>

      {active && active.branches.length > 1 && (
        <nav aria-label="Subcategories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {active.branches.map((branch) => (
            <Link
              key={branch.subcategory}
              href={hrefFor(query, active.category, branch.subcategory)}
              className={cn(
                chipClass,
                "px-2.5 py-0.5 text-xs",
                query.subcategory === branch.subcategory && chipActiveClass,
              )}
            >
              {branch.subcategory}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

