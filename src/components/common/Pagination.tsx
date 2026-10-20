import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
};

/** First, last, current and its neighbours; gaps become ellipses. */
function visiblePages(page: number, pages: number): Array<number | "gap"> {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pages));
  const sorted = Array.from(wanted).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("gap");
    result.push(value);
  });

  return result;
}

const itemClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-card px-2.5 text-sm font-medium transition-colors";

export default function Pagination({ page, pages, hrefFor }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(itemClass, "gap-1 hover:bg-accent")} aria-label="Previous page">
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className={cn(itemClass, "gap-1 opacity-50")} aria-hidden="true">
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {visiblePages(page, pages).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-current={entry === page ? "page" : undefined}
            aria-label={`Page ${entry}`}
            className={cn(
              itemClass,
              entry === page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {entry}
          </Link>
        ),
      )}

      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={cn(itemClass, "gap-1 hover:bg-accent")} aria-label="Next page">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(itemClass, "gap-1 opacity-50")} aria-hidden="true">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
