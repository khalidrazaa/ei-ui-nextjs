"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { articlePath, formatDate } from "@/lib/format";
import { Article } from "@/types/article";

type ArticleLibraryProps = {
  articles: Article[];
};

type ArticleIndexItem = Pick<Article, "id" | "slug" | "title" | "published_at" | "created_at" | "category" | "subcategory">;

type ArticleIndexBranch = {
  subcategory: string;
  articles: ArticleIndexItem[];
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
  const grouped = new Map<string, Map<string, ArticleIndexItem[]>>();

  for (const article of articles) {
    const category = articleCategory(article);
    const subcategory = articleSubcategory(article);

    if (!grouped.has(category)) {
      grouped.set(category, new Map<string, ArticleIndexItem[]>());
    }

    const subcategoryMap = grouped.get(category);
    if (!subcategoryMap) {
      continue;
    }

    if (!subcategoryMap.has(subcategory)) {
      subcategoryMap.set(subcategory, []);
    }

    subcategoryMap.get(subcategory)?.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      published_at: article.published_at,
      created_at: article.created_at,
      category: article.category,
      subcategory: article.subcategory,
    });
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, subcategoryMap]) => ({
      category,
      branches: Array.from(subcategoryMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([subcategory, items]) => ({
          subcategory,
          articles: [...items].sort((left, right) => parsePublishedTime(right) - parsePublishedTime(left)),
        })),
    }));
}

export default function ArticleLibrary({ articles }: ArticleLibraryProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
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
    ? `${selectedCategory} > ${selectedSubcategory}`
    : selectedCategory || "All categories";

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const resetFilter = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  return (
    <div className="articles-page-layout">
      <aside className="article-index-sidebar" aria-label="Category and subcategory navigation">
        <div className="article-index-header">
          <p className="article-index-kicker">Category Index</p>
          <button type="button" className="article-index-reset" onClick={resetFilter}>
            Show all
          </button>
        </div>

        <nav className="article-index-nav">
          {indexGroups.map((group) => {
            const isExpanded = expandedCategories[group.category] !== false;
            const isActiveCategory = selectedCategory === group.category && !selectedSubcategory;

            return (
              <section key={group.category} className="article-index-group">
                <button
                  type="button"
                  className={`article-index-category-toggle ${isActiveCategory ? "article-index-category-toggle-active" : ""}`}
                  onClick={() => toggleCategory(group.category)}
                >
                  <span>{group.category}</span>
                  <span aria-hidden>{isExpanded ? "-" : "+"}</span>
                </button>

                {isExpanded && (
                  <ul className="article-index-subcategory-list">
                    <li>
                      <button
                        type="button"
                        className={`article-index-subcategory-button ${isActiveCategory ? "article-index-subcategory-button-active" : ""}`}
                        onClick={() => {
                          setSelectedCategory(group.category);
                          setSelectedSubcategory(null);
                        }}
                      >
                        <span>All in {group.category}</span>
                      </button>
                    </li>

                    {group.branches.map((branch) => {
                      const isActiveSubcategory =
                        selectedCategory === group.category && selectedSubcategory === branch.subcategory;

                      return (
                        <li key={`${group.category}-${branch.subcategory}`}>
                          <button
                            type="button"
                            className={`article-index-subcategory-button ${isActiveSubcategory ? "article-index-subcategory-button-active" : ""}`}
                            onClick={() => {
                              setSelectedCategory(group.category);
                              setSelectedSubcategory(branch.subcategory);
                            }}
                          >
                            <span>{branch.subcategory}</span>
                            <small>{branch.articles.length}</small>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>
      </aside>

      <section className="article-library-content">
        <div className="article-library-topbar">
          <div className="article-library-meta">
            <h2>Published Titles</h2>
            <p>
              {activeFilterLabel} | {filteredArticles.length} results
            </p>
          </div>

          <label className="article-library-search" htmlFor="article-library-search">
            <span>Search</span>
            <input
              id="article-library-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find title, category, subcategory"
              aria-label="Search articles"
            />
          </label>
        </div>



        {!filteredArticles.length ? (
          <div className="empty-state">
            <h3>{articles.length ? "No titles match this view" : "No articles published yet"}</h3>
            {articles.length > 0 && <p>Try another search or select a different category.</p>}
          </div>
        ) : (
          <div className="article-title-list">
            {filteredArticles.map((article) => (
              <Link key={article.id} href={articlePath(article)} className="article-title-card">
                <h3>{article.title}</h3>
                <p>{formatDate(article.published_at || article.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
