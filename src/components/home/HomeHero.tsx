import Link from "next/link";

import ArticleCard from "@/components/articles/ArticleCard";
import SearchField from "@/components/common/SearchField";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Topic, topicHref } from "@/lib/topics";
import { Article } from "@/types/article";

const POPULAR_TOPIC_LIMIT = 4;

type HomeHeroProps = {
  featured?: Article;
  topics: Topic[];
};

/** Headline, search and popular topics beside the featured article. */
export default function HomeHero({ featured, topics }: HomeHeroProps) {
  const popular = topics.slice(0, POPULAR_TOPIC_LIMIT);

  return (
    <section
      className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12"
      aria-labelledby="home-title"
    >
      <div className="flex flex-col gap-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{siteConfig.domain}</p>

        <div className="flex flex-col gap-3">
          <h1 id="home-title" className="text-balance text-4xl sm:text-5xl">
            Technology, made <span className="text-primary">readable</span>.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">{siteConfig.description}</p>
        </div>

        <form action="/articles" method="get" role="search" className="flex max-w-lg gap-2">
          <SearchField
            name="q"
            label="Search articles"
            placeholder="Search articles, topics, tags"
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        {popular.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Popular:</span>
            {popular.map((topic) => (
              <Link
                key={topic.name}
                href={topicHref(topic.name)}
                className={cn(badgeVariants({ variant: "outline" }), "bg-card")}
              >
                {topic.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {featured && <ArticleCard article={featured} featured />}
    </section>
  );
}
