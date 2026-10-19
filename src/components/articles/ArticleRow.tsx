import Link from "next/link";

import ArticleCover from "@/components/articles/ArticleCover";
import ArticleMeta from "@/components/common/ArticleMeta";
import { Badge } from "@/components/ui/badge";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";
import { Article } from "@/types/article";

const EXCERPT_LIMIT = 150;
const VISIBLE_TAGS = 3;

/** Horizontal list item: thumbnail, meta, title, excerpt and tags. */
export default function ArticleRow({ article }: { article: Article }) {
  const excerpt = summarizeText(article.excerpt || article.meta_description, EXCERPT_LIMIT);

  return (
    <article className="group relative flex gap-4 p-3 transition-colors hover:bg-accent/40 sm:p-4">
      <ArticleCover
        article={article}
        compact
        className="aspect-[4/3] w-28 shrink-0 rounded-lg sm:aspect-[16/10] sm:w-44"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {article.category && <Badge variant="secondary">{article.category}</Badge>}
          <ArticleMeta
            date={formatDate(article.published_at || article.created_at)}
            readingTime={formatReadingTime(article.reading_time)}
          />
        </div>

        <h3 className="text-base">
          <Link href={articlePath(article)} className="after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </h3>

        {excerpt && (
          <p className="hidden line-clamp-2 text-sm text-muted-foreground sm:block">{excerpt}</p>
        )}

        {(article.tags || []).length > 0 && (
          <div className="mt-auto hidden flex-wrap gap-1.5 sm:flex">
            {(article.tags || []).slice(0, VISIBLE_TAGS).map((tag) => (
              <Badge key={`${article.id}-${tag}`} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
