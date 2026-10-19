import Image from "next/image";
import { BookOpen } from "lucide-react";

import { coverGradients } from "@/config/cover";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type ArticleCoverProps = {
  article: Pick<Article, "slug" | "title" | "category" | "featured_image_url" | "image_alt_text">;
  className?: string;
};

/** Stable index so an article always gets the same fallback gradient. */
function hashIndex(value: string, size: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % size;
}

export default function ArticleCover({ article, className }: ArticleCoverProps) {
  const frame = cn("relative aspect-video w-full overflow-hidden", className);

  if (article.featured_image_url) {
    return (
      <div className={frame}>
        <Image
          src={article.featured_image_url}
          alt={article.image_alt_text || article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  const gradient = coverGradients[hashIndex(article.slug || article.title, coverGradients.length)];

  return (
    <div className={cn(frame, gradient)} role="img" aria-label={article.image_alt_text || article.title}>
      <BookOpen
        className="absolute -bottom-3 -right-3 size-24 text-primary-foreground/25"
        strokeWidth={1.25}
        aria-hidden="true"
      />
      {article.category && (
        <span className="absolute bottom-3 left-4 text-sm font-semibold text-primary-foreground">
          {article.category}
        </span>
      )}
    </div>
  );
}
