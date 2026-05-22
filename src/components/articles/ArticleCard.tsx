import Link from "next/link";

import { Article } from "@/types/article";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";

type ArticleCardProps = {
  article: Article;
  priority?: boolean;
  variant?: "default" | "spotlight" | "compact";
};

export default function ArticleCard({
  article,
  priority = false,
  variant = "default",
}: ArticleCardProps) {
  const excerptLimit =
    variant === "spotlight" ? 240 : variant === "compact" ? 110 : priority ? 220 : 160;
  const excerpt = summarizeText(article.excerpt || article.meta_description, excerptLimit);
  const cardClassName = [
    "article-card",
    priority ? "article-card-priority" : "",
    variant === "spotlight" ? "article-card-spotlight" : "",
    variant === "compact" ? "article-card-compact" : "",
    "animate-rise",
  ]
    .filter(Boolean)
    .join(" ");
  const visibleTags = variant === "compact" ? 2 : 3;

  return (
    <article className={cardClassName}>
      <div className="article-card-meta">
        <span className="chip chip-muted">{article.category || "Insight"}</span>
        <span>{formatDate(article.published_at || article.created_at)}</span>
        <span>{formatReadingTime(article.reading_time)}</span>
      </div>

      <h3 className="article-card-title">
        <Link href={articlePath(article)}>{article.title}</Link>
      </h3>

      <p className="article-card-excerpt">{excerpt}</p>

      <div className="article-card-footer">
        <div className="article-card-tags">
          {(article.tags || []).slice(0, visibleTags).map((tag) => (
            <span key={`${article.id}-${tag}`} className="chip chip-soft">
              {tag}
            </span>
          ))}
        </div>

        <Link className="read-link" href={articlePath(article)}>
          {variant === "compact" ? "Open story" : "Read article"}
        </Link>
      </div>
    </article>
  );
}
