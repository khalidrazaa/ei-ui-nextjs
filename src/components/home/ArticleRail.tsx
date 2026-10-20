"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ArticleCard from "@/components/articles/ArticleCard";
import { Carousel, CarouselArrows, CarouselContent } from "@/components/carousel/Carousel";
import { Article } from "@/types/article";

type ArticleRailProps = {
  id: string;
  title: string;
  description?: string;
  articles: Article[];
  action?: { href: string; label: string };
};

/** A titled, swipeable row of article cards. */
export default function ArticleRail({ id, title, description, articles, action }: ArticleRailProps) {
  if (!articles.length) return null;

  return (
    <section aria-labelledby={id}>
      <Carousel label={title} options={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id={id}>{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>

          <div className="flex items-center gap-4">
            {action && (
              <Link
                href={action.href}
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
              >
                {action.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
            <CarouselArrows />
          </div>
        </div>

        <CarouselContent className="-ml-4" slideClassName="pl-4 basis-[82%] sm:basis-1/2 lg:basis-1/3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
