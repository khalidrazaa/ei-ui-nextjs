"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import ArticleCover from "@/components/articles/ArticleCover";
import ArticleMeta from "@/components/common/ArticleMeta";
import {
  Carousel,
  CarouselArrows,
  CarouselContent,
  CarouselDots,
  CarouselPlayToggle,
} from "@/components/carousel/Carousel";
import { Button } from "@/components/ui/button";
import { articlePath, formatDate, formatReadingTime, summarizeText } from "@/lib/format";
import { CAROUSEL_AUTOPLAY_MS } from "@/lib/motion";
import { Article } from "@/types/article";

const EXCERPT_LIMIT = 170;

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

type HeroSlideProps = {
  article: Article;
  index: number;
  total: number;
};

function HeroSlide({ article, index, total }: HeroSlideProps) {
  const excerpt = summarizeText(article.excerpt || article.meta_description, EXCERPT_LIMIT);

  return (
    <article className="grid min-h-[22rem] overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1.05fr_1fr]">
      <div className="order-2 flex flex-col justify-center gap-4 p-6 sm:p-10 md:order-1">
        <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span className="tabular-nums text-primary">{padNumber(index + 1)}</span>
          <span className="h-px w-8 bg-border" aria-hidden="true" />
          <span>{article.category || "Article"}</span>
          <span className="tabular-nums text-muted-foreground/70">/ {padNumber(total)}</span>
        </p>

        <h2 className="text-balance font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          <Link href={articlePath(article)} className="transition-colors hover:text-primary">
            {article.title}
          </Link>
        </h2>

        {excerpt && <p className="max-w-md text-muted-foreground">{excerpt}</p>}

        <ArticleMeta
          className="text-sm text-muted-foreground"
          date={formatDate(article.published_at || article.created_at)}
          readingTime={formatReadingTime(article.reading_time)}
        />

        <Button asChild className="mt-1 self-start">
          <Link href={articlePath(article)}>
            Read story
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="relative order-1 min-h-44 md:order-2 md:min-h-full">
        <ArticleCover article={article} className="absolute inset-0 aspect-auto h-full" />
      </div>
    </article>
  );
}

/** Full-width carousel of the lead stories. */
export default function HeroCarousel({ articles }: { articles: Article[] }) {
  return (
    <Carousel label="Featured stories" options={{ loop: true }} autoplayMs={CAROUSEL_AUTOPLAY_MS}>
      <CarouselContent>
        {articles.map((article, index) => (
          <HeroSlide key={article.id} article={article} index={index} total={articles.length} />
        ))}
      </CarouselContent>

      <div className="mt-4 flex items-center justify-between gap-4">
        <CarouselDots />
        <div className="flex items-center gap-1.5">
          <CarouselPlayToggle />
          <CarouselArrows />
        </div>
      </div>
    </Carousel>
  );
}
