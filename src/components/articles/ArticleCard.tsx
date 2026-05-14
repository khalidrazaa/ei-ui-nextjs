import Link from "next/link";

import { Article } from "@/types/article";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";

type ArticleCardProps = {
  article: Article;
  priority?: boolean;
};

export default function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const excerpt = summarizeText(article.excerpt || article.meta_description, priority ? 220 : 160);

  return (
    <article className={`article-card ${priority ? "article-card-priority" : ""} animate-rise`}>
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
          {(article.tags || []).slice(0, 3).map((tag) => (
            <span key={`${article.id}-${tag}`} className="chip chip-soft">
              {tag}
            </span>
          ))}
        </div>

        <Link className="read-link" href={articlePath(article)}>
          Read article
        </Link>
      </div>
    </article>
  );
}
