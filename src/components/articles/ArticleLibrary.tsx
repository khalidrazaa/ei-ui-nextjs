"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";

import { articlePath, formatDate } from "@/lib/format";
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

  const showArticleList = () => {
    if (isReadingArticle) {
      setQuery("");
      router.push("/articles", { scroll: false });
    }
  };

  const resetFilter = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    showArticleList();
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
            const subcategoryListId = `${categoryListPrefix}-${encodeURIComponent(group.category)}`;

            return (
              <section key={group.category} className="article-index-group">
                <div className="article-index-category-header">
                  <button
                    type="button"
                    className={`article-index-category-button ${isActiveCategory ? "article-index-category-button-active" : ""}`}
                    aria-pressed={isActiveCategory}
                    onClick={() => {
                      setSelectedCategory(group.category);
                      setSelectedSubcategory(null);
                      showArticleList();
                    }}
                  >
                    {group.category}
                  </button>
                  <button
                    type="button"
                    className="article-index-category-toggle"
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.category}`}
                    aria-expanded={isExpanded}
                    aria-controls={subcategoryListId}
                    onClick={() => toggleCategory(group.category)}
                  >
                    <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
                  </button>
                </div>

                <ul id={subcategoryListId} className="article-index-subcategory-list" hidden={!isExpanded}>
                  {group.branches.map((branch) => {
                    const isActiveSubcategory =
                      selectedCategory === group.category && selectedSubcategory === branch.subcategory;

                    return (
                      <li key={`${group.category}-${branch.subcategory}`}>
                        <button
                          type="button"
                          className={`article-index-subcategory-button ${isActiveSubcategory ? "article-index-subcategory-button-active" : ""}`}
                          aria-pressed={isActiveSubcategory}
                          onClick={() => {
                            setSelectedCategory(group.category);
                            setSelectedSubcategory(branch.subcategory);
                            showArticleList();
                          }}
                        >
                          {branch.subcategory}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>
      </aside>

      <section className={`article-library-content${isReadingArticle ? " article-library-detail" : ""}`}>
        {isReadingArticle ? (
          children
        ) : (
          <>
            {children}
            <div className="article-library-topbar">
              <div className="article-library-meta">
                <p>{activeFilterLabel}</p>
              </div>

              <div className="article-library-search">
                <input
                  id="article-library-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find title, category, subcategory"
                  aria-label="Search articles"
                />
              </div>
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
          </>
        )}
      </section>
    </div>
  );
}
