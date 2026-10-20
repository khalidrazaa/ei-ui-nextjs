import Link from "next/link";

import ArticleCover from "@/components/articles/ArticleCover";
import ArticleMeta from "@/components/common/ArticleMeta";
import Pressable from "@/components/motion/Pressable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Article } from "@/types/article";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";
import { cn } from "@/lib/utils";

const EXCERPT_LIMIT = 150;
const FEATURED_EXCERPT_LIMIT = 220;
const VISIBLE_TAGS = 3;

type ArticleCardProps = {
  article: Article;
  /** Larger presentation used for the lead article. */
  featured?: boolean;
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const excerpt = summarizeText(
    article.excerpt || article.meta_description,
    featured ? FEATURED_EXCERPT_LIMIT : EXCERPT_LIMIT,
  );

  return (
    <Pressable className="h-full">
      <Card className="group relative h-full gap-0 overflow-hidden py-0 shadow-none transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-md">
        <ArticleCover article={article} className={featured ? "aspect-[16/9]" : "aspect-[2/1]"} />

        <CardContent className={cn("flex h-full flex-col gap-2 p-4", featured && "gap-2.5 p-5")}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {featured && <Badge>Featured</Badge>}
            {article.category && <Badge variant="secondary">{article.category}</Badge>}
            <ArticleMeta
              date={formatDate(article.published_at || article.created_at)}
              readingTime={formatReadingTime(article.reading_time)}
            />
          </div>

          <h3 className={featured ? "text-xl" : "text-base"}>
            {/* Stretched link makes the whole card the hit target. */}
            <Link href={articlePath(article)} className="after:absolute after:inset-0 after:content-['']">
              {article.title}
            </Link>
          </h3>

          {excerpt && (
            <p className="line-clamp-3 text-sm leading-normal text-muted-foreground">{excerpt}</p>
          )}

          {(article.tags || []).length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-0.5">
              {(article.tags || []).slice(0, VISIBLE_TAGS).map((tag) => (
                <Badge key={`${article.id}-${tag}`} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}
