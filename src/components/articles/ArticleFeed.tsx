"use client";

import { useMemo, useState } from "react";

import ArticleCard from "@/components/articles/ArticleCard";
import EmptyState from "@/components/common/EmptyState";
import Pressable from "@/components/motion/Pressable";
import SearchField from "@/components/common/SearchField";
import { Button } from "@/components/ui/button";
import { Article } from "@/types/article";

type ArticleFeedProps = {
  articles: Article[];
  title?: string;
};

export default function ArticleFeed({
  articles,
  title = "Latest articles",
}: ArticleFeedProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const pool = articles
      .map((article) => article.category)
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => value.trim());

    return ["All", ...Array.from(new Set(pool))];
  }, [articles]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      if (activeCategory !== "All" && article.category !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        article.title,
        article.excerpt,
        article.meta_description,
        ...(article.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, articles, query]);

  const lead = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="feed-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="feed-title">{title}</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length === articles.length
            ? `${articles.length} ${articles.length === 1 ? "article" : "articles"}`
            : `${filtered.length} of ${articles.length} match`}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0"
          role="group"
          aria-label="Categories"
        >
          {categories.map((category) => (
            <Pressable key={category} className="shrink-0">
              <Button
                type="button"
                size="sm"
                variant={activeCategory === category ? "default" : "outline"}
                aria-pressed={activeCategory === category}
                className="rounded-full"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            </Pressable>
          ))}
        </div>

        <SearchField
          label="Search articles"
          placeholder="Search articles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="md:max-w-xs"
        />
      </div>

      {!filtered.length ? (
        <EmptyState
          title={articles.length ? "No articles match this filter" : "No articles published yet"}
          description={articles.length ? "Try another keyword or category." : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {lead && <ArticleCard article={lead} priority variant="spotlight" />}
          {rest.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
