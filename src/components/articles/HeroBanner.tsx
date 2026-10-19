import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import StatTile from "@/components/common/StatTile";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

type HeroBannerProps = {
  articleCount: number;
  categoryCount: number;
};

export default function HeroBanner({ articleCount, categoryCount }: HeroBannerProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary/75 px-6 py-8 text-primary-foreground sm:px-10 sm:py-10"
      aria-labelledby="hero-title"
    >
      <BookOpen
        className="pointer-events-none absolute -bottom-10 -right-6 size-64 text-primary-foreground/10"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl flex-col items-start gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
            {siteConfig.domain}
          </p>
          <h1 id="hero-title" className="text-3xl sm:text-4xl">
            {siteConfig.tagline}.
          </h1>
          <p className="text-primary-foreground/90">{siteConfig.description}</p>
          <Button asChild variant="secondary" className="mt-1">
            <Link href="/articles">
              Browse articles
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="flex gap-3">
          <StatTile tone="inverse" label={articleCount === 1 ? "Article" : "Articles"} value={articleCount} />
          <StatTile tone="inverse" label={categoryCount === 1 ? "Topic" : "Topics"} value={categoryCount} />
        </div>
      </div>
    </section>
  );
}
