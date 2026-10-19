import Link from "next/link";

import ArticleMeta from "@/components/common/ArticleMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Article } from "@/types/article";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  const visibleTags = variant === "compact" ? 2 : 3;
  const href = articlePath(article);

  return (
    <Card
      className={cn(
        "group relative gap-0 py-0 shadow-none transition-[transform,box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.99]",
        variant === "spotlight" && "border-primary/30",
      )}
    >
      <CardContent className={cn("flex h-full flex-col gap-3 p-5", variant === "spotlight" && "p-6 sm:p-8")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {article.category && <Badge variant="secondary">{article.category}</Badge>}
          <ArticleMeta
            date={formatDate(article.published_at || article.created_at)}
            readingTime={formatReadingTime(article.reading_time)}
          />
        </div>

        <h3 className={cn(variant === "spotlight" ? "text-2xl sm:text-3xl" : "text-lg")}>
          {/* Stretched link makes the whole card the hit target. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </h3>

        {excerpt && <p className="text-sm leading-relaxed text-muted-foreground">{excerpt}</p>}

        {(article.tags || []).length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {(article.tags || []).slice(0, visibleTags).map((tag) => (
              <Badge key={`${article.id}-${tag}`} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
