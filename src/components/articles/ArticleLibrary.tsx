"use client";

import { ChevronDown, ListFilter } from "lucide-react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import SearchField from "@/components/common/SearchField";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { articlePath, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type ArticleLibraryProps = {
  articles: Article[];
  children: ReactNode;
};

type ArticleIndexBranch = {
  subcategory: string;
};

type ArticleIndexGroup = {
  category: string;
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
  const grouped = new Map<string, Set<string>>();

  for (const article of articles) {
    const category = articleCategory(article);
    const subcategory = articleSubcategory(article);

    const subcategories = grouped.get(category) || new Set<string>();
    subcategories.add(subcategory);
    grouped.set(category, subcategories);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, subcategories]) => ({
      category,
      branches: Array.from(subcategories)
        .sort((left, right) => left.localeCompare(right))
        .map((subcategory) => ({ subcategory })),
    }));
}

export default function ArticleLibrary({ articles, children }: ArticleLibraryProps) {
  const router = useRouter();
  const isReadingArticle = useSelectedLayoutSegment() !== null;
  const categoryListPrefix = useId();
  const [query, setQuery] = useState("");
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

      const haystack = `${article.title} ${category} ${subcategory}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return [...selected].sort((left, right) => parsePublishedTime(right) - parsePublishedTime(left));
  }, [articles, query, selectedCategory, selectedSubcategory]);

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
    <nav aria-label="Category and subcategory navigation" className="flex flex-col gap-1">
      <Button
        type="button"
        variant={!selectedCategory ? "secondary" : "ghost"}
        size="sm"
        className="justify-start"
        aria-pressed={!selectedCategory}
        onClick={() => selectCategory(null, null)}
      >
        All categories
      </Button>

      {indexGroups.map((group) => {
        const isExpanded = expandedCategories[group.category] !== false;
        const isActiveCategory = selectedCategory === group.category && !selectedSubcategory;
        const subcategoryListId = `${categoryListPrefix}-${encodeURIComponent(group.category)}`;

        return (
          <div key={group.category} className="flex flex-col">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={isActiveCategory ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 justify-start font-semibold"
                aria-pressed={isActiveCategory}
                onClick={() => selectCategory(group.category, null)}
              >
                {group.category}
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
    <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)] flex flex-col gap-3">
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          {categoryIndex}
        </div>
      </aside>

      <section className="min-w-0">
        {isReadingArticle ? (
          children
        ) : (
          <>
            {children}
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl">{activeFilterLabel}</h2>
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                  {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
                </p>
              </div>

              <div className="flex gap-2">
                <SearchField
                  id="article-library-search"
                  label="Search articles"
                  placeholder="Search articles"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="flex-1 md:max-w-sm"
                />

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button type="button" variant="outline" className="lg:hidden">
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

            {!filteredArticles.length ? (
              <EmptyState
                title={articles.length ? "No titles match this view" : "No articles published yet"}
                description={articles.length ? "Try another search or category." : undefined}
              />
            ) : (
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {filteredArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={articlePath(article)}
                      className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-accent/60 active:bg-accent"
                    >
                      <span className="font-medium">{article.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
