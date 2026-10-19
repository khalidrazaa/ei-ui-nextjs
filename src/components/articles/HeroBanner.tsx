import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      aria-labelledby="hero-title"
    >
      <div className="flex max-w-xl flex-col items-start gap-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{siteConfig.domain}</p>
        <h1 id="hero-title" className="text-3xl sm:text-4xl">
          {siteConfig.tagline}.
        </h1>
        <p className="text-muted-foreground">{siteConfig.description}</p>
        <Button asChild size="sm" className="mt-1">
          <Link href="/articles">
            Browse articles
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="flex gap-2.5">
        <StatTile label={articleCount === 1 ? "Article" : "Articles"} value={articleCount} />
        <StatTile label={categoryCount === 1 ? "Topic" : "Topics"} value={categoryCount} />
      </div>
    </section>
  );
}
