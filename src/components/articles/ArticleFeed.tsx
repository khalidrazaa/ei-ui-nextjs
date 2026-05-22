"use client";

import { useMemo, useState } from "react";

import { Article } from "@/types/article";
import { siteConfig } from "@/config/site";

import ArticleCard from "@/components/articles/ArticleCard";

type ArticleFeedProps = {
  articles: Article[];
  usedFallback?: boolean;
  title?: string;
  subtitle?: string;
};

export default function ArticleFeed({
  articles,
  usedFallback = false,
  title = "Latest Stories",
  subtitle = "Swipe-friendly deep reads designed for phones and tablets.",
}: ArticleFeedProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const pool = articles
      .map((article) => article.category)
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => value.trim());

    const merged = [...siteConfig.contentPillars, ...pool];
    return ["All", ...Array.from(new Set(merged))];
  }, [articles]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const inCategory = activeCategory === "All" || article.category === activeCategory;
      if (!inCategory) {
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
  const featuredRail = filtered.slice(1, 3);
  const remaining = filtered.slice(3);
  const gridArticles = lead ? remaining : filtered;
  const countLabel =
    filtered.length === articles.length
      ? `${articles.length} stories currently published`
      : `${filtered.length} stories match this view`;

  return (
    <section className="feed-section">
      <div className="feed-head">
        <div className="feed-head-copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <p className="feed-count">{countLabel}</p>
        </div>

        <label className="search-wrap">
          <span className="search-label">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search story, topic, tag"
            aria-label="Search stories"
          />
        </label>
      </div>

      <div className="chip-row" aria-label="Categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`chip-button ${activeCategory === category ? "chip-button-active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {usedFallback && (
        <p className="status-note">
          Live API data is unavailable right now, so sample published stories are shown for preview.
        </p>
      )}

      {!filtered.length ? (
        <div className="empty-state">
          <h3>No articles match this filter</h3>
          <p>Try another keyword or switch category.</p>
        </div>
      ) : (
        <>
          {lead && (
            <div className="feed-featured">
              <ArticleCard article={lead} priority variant="spotlight" />

              {!!featuredRail.length && (
                <div className="feed-featured-rail">
                  {featuredRail.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="feed-grid">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
