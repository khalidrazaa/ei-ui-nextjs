import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleQuery } from "@/lib/article-query";

/** Plain GET form: works without JavaScript and keeps the other filters. */
export default function ArticleSearchForm({ query }: { query: ArticleQuery }) {
  return (
    <form action="/articles" method="get" role="search" className="relative">
      {query.category && <input type="hidden" name="category" value={query.category} />}
      {query.category && query.subcategory && <input type="hidden" name="sub" value={query.subcategory} />}
      {query.sort !== "newest" && <input type="hidden" name="sort" value={query.sort} />}

      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        name="q"
        defaultValue={query.q}
        placeholder="Search articles"
        aria-label="Search articles"
        className="bg-card pl-9 pr-10"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
        aria-label="Search"
      >
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  );
}
