import Image from "next/image";

import CoverArt, { coverThemeFor } from "@/components/articles/CoverArt";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type ArticleCoverProps = {
  article: Pick<Article, "slug" | "title" | "category" | "featured_image_url" | "image_alt_text">;
  className?: string;
  /** Small thumbnail: no category label. */
  compact?: boolean;
};

/** Featured image when present, otherwise generated artwork from the palette. */
export default function ArticleCover({ article, className, compact = false }: ArticleCoverProps) {
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

  const seed = article.slug || article.title;
  const theme = coverThemeFor(seed);

  return (
    <div className={cn(frame, theme.surface)} role="img" aria-label={article.image_alt_text || article.title}>
      <CoverArt seed={seed} />
      {!compact && article.category && (
        <span className="absolute bottom-3 left-3 rounded-full bg-card/95 px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
          {article.category}
        </span>
      )}
    </div>
  );
}
