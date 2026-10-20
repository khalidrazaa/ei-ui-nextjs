import { X } from "lucide-react";
import Link from "next/link";

import { ArticleQuery, articlesHref } from "@/lib/article-query";

type ActiveFiltersProps = {
  query: ArticleQuery;
};

/** Removable chips for each applied filter, plus a clear-all link. */
export default function ActiveFilters({ query }: ActiveFiltersProps) {
  const filters: Array<{ label: string; href: string }> = [];

  if (query.q) {
    filters.push({ label: `“${query.q}”`, href: articlesHref({ ...query, q: "", page: 1 }) });
  }
  if (query.category) {
    filters.push({
      label: query.subcategory ? `${query.category} › ${query.subcategory}` : query.category,
      href: articlesHref({ ...query, category: null, subcategory: null, page: 1 }),
    });
  }

  if (!filters.length) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {filters.map((filter) => (
        <li key={filter.label}>
          <Link
            href={filter.href}
            aria-label={`Remove filter ${filter.label}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/70"
          >
            {filter.label}
            <X className="size-3" aria-hidden="true" />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={articlesHref({ sort: query.sort })}
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </Link>
      </li>
    </ul>
  );
}
