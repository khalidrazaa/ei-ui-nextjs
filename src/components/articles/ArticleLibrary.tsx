"use client";

import { ChevronDown, ListFilter } from "lucide-react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";

import ArticleRow from "@/components/articles/ArticleRow";
import EmptyState from "@/components/common/EmptyState";
import SearchField from "@/components/common/SearchField";
import SegmentedControl from "@/components/common/SegmentedControl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type ArticleLibraryProps = {
  articles: Article[];
  children: ReactNode;
};

type SortOrder = "newest" | "oldest";

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type ArticleIndexBranch = {
  subcategory: string;
  count: number;
};

type ArticleIndexGroup = {
  category: string;
  count: number;
  branches: ArticleIndexBranch[];
};

function normalizeLabel(value: string | null | undefined, fallback: string): string {
  const label = (value || "").trim();
  return label.length > 0 ? label : fallback;
}

function articleCategory(article: Pick<Article, "category">): string {
  return normalizeLabel(article.category, "Uncategorized");
}

function articleSubcategory(article: Pick<Article, "subcategory">): string {
  return normalizeLabel(article.subcategory, "General");
}

function parsePublishedTime(article: Pick<Article, "published_at" | "created_at">): number {
  return new Date(article.published_at || article.created_at || "").getTime() || 0;
}

function buildArticleIndex(articles: Article[]): ArticleIndexGroup[] {
  const grouped = new Map<string, Map<string, number>>();

  for (const article of articles) {
    const category = articleCategory(article);
    const subcategory = articleSubcategory(article);

    const subcategories = grouped.get(category) || new Map<string, number>();
    subcategories.set(subcategory, (subcategories.get(subcategory) || 0) + 1);
    grouped.set(category, subcategories);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, subcategories]) => ({
      category,
      count: Array.from(subcategories.values()).reduce((total, value) => total + value, 0),
      branches: Array.from(subcategories.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([subcategory, count]) => ({ subcategory, count })),
    }));
}

function CountLabel({ value }: { value: number }) {
  return <span className="ml-auto pl-2 text-xs tabular-nums text-muted-foreground">{value}</span>;
}

export default function ArticleLibrary({ articles, children }: ArticleLibraryProps) {
  const router = useRouter();
  const isReadingArticle = useSelectedLayoutSegment() !== null;
  const categoryListPrefix = useId();
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const indexGroups = useMemo(() => buildArticleIndex(articles), [articles]);

  useEffect(() => {
    setExpandedCategories((current) => {
      const next = { ...current };
      let changed = false;

      for (const group of indexGroups) {
        if (!(group.category in next)) {
          next[group.category] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [indexGroups]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const selected = articles.filter((article) => {
      const category = articleCategory(article);
      const subcategory = articleSubcategory(article);

      if (selectedCategory && category !== selectedCategory) {
        return false;
      }

      if (selectedSubcategory && subcategory !== selectedSubcategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [article.title, category, subcategory, article.excerpt, ...(article.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    const direction = sortOrder === "newest" ? -1 : 1;
    return [...selected].sort(
      (left, right) => direction * (parsePublishedTime(left) - parsePublishedTime(right)),
    );
  }, [articles, query, selectedCategory, selectedSubcategory, sortOrder]);

  const activeFilterLabel = selectedSubcategory
    ? `${selectedCategory} › ${selectedSubcategory}`
    : selectedCategory || "All articles";

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const showArticleList = () => {
    if (isReadingArticle) {
      setQuery("");
      router.push("/articles", { scroll: false });
    }
  };

  const selectCategory = (category: string | null, subcategory: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSheetOpen(false);
    showArticleList();
  };

  const categoryIndex = (
    <nav aria-label="Category and subcategory navigation" className="flex flex-col gap-0.5">
      <Button
        type="button"
        variant={!selectedCategory ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start"
        aria-pressed={!selectedCategory}
        onClick={() => selectCategory(null, null)}
      >
        All categories
        <CountLabel value={articles.length} />
      </Button>

      {indexGroups.map((group) => {
        const isExpanded = expandedCategories[group.category] !== false;
        const isActiveCategory = selectedCategory === group.category && !selectedSubcategory;
        const subcategoryListId = `${categoryListPrefix}-${encodeURIComponent(group.category)}`;

        return (
          <div key={group.category} className="flex flex-col">
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={isActiveCategory ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 justify-start font-semibold"
                aria-pressed={isActiveCategory}
                onClick={() => selectCategory(group.category, null)}
              >
                {group.category}
                <CountLabel value={group.count} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.category}`}
                aria-expanded={isExpanded}
                aria-controls={subcategoryListId}
                onClick={() => toggleCategory(group.category)}
              >
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", !isExpanded && "-rotate-90")}
                  aria-hidden="true"
                />
              </Button>
            </div>

            <ul
              id={subcategoryListId}
              className="ml-3 flex flex-col border-l border-border pl-2"
              hidden={!isExpanded}
            >
              {group.branches.map((branch) => {
                const isActiveSubcategory =
                  selectedCategory === group.category && selectedSubcategory === branch.subcategory;

                return (
                  <li key={`${group.category}-${branch.subcategory}`}>
                    <Button
                      type="button"
                      variant={isActiveSubcategory ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start font-normal",
                        !isActiveSubcategory && "text-muted-foreground",
                      )}
                      aria-pressed={isActiveSubcategory}
                      onClick={() => selectCategory(group.category, branch.subcategory)}
                    >
                      {branch.subcategory}
                      <CountLabel value={branch.count} />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  if (isReadingArticle) {
    return <div className="min-w-0">{children}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {children}

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl">Articles</h1>
        <p className="text-muted-foreground">
          Practical explanations across {indexGroups.length}{" "}
          {indexGroups.length === 1 ? "topic" : "topics"}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+1.25rem)] flex flex-col gap-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Categories
            </p>
            {categoryIndex}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4" aria-label="Article list">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <SearchField
              id="article-library-search"
              label="Search articles"
              placeholder="Search title, topic or tag"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="md:max-w-sm"
            />

            <div className="flex items-center gap-2 md:ml-auto">
              <SegmentedControl
                label="Sort order"
                options={sortOptions}
                value={sortOrder}
                onChange={setSortOrder}
              />

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="lg:hidden">
                    <ListFilter aria-hidden="true" />
                    Categories
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Categories</SheetTitle>
                    <SheetDescription>Filter articles by topic.</SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-6">{categoryIndex}</div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">{activeFilterLabel}</span>
            {" · "}
            {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
          </p>

          {!filteredArticles.length ? (
            <EmptyState
              title={articles.length ? "No articles match this view" : "No articles published yet"}
              description={articles.length ? "Try another search or category." : undefined}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {filteredArticles.map((article) => (
                <li key={article.id}>
                  <ArticleRow article={article} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
