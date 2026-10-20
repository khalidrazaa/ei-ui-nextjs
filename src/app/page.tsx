import EmptyState from "@/components/common/EmptyState";
import AuthorNote from "@/components/home/AuthorNote";
import ArticleRail from "@/components/home/ArticleRail";
import HeroCarousel from "@/components/home/HeroCarousel";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/articles";
import { getTopics, topicHref } from "@/lib/topics";

const HERO_SLIDES = 4;
const TOPIC_RAILS = 2;
const MIN_TOPIC_RAIL_SIZE = 3;

export default async function HomePage() {
  const { articles } = await getPublishedArticles(120);

  if (!articles.length) {
    return <EmptyState title="No articles published yet" description="Check back soon." />;
  }

  // Lead stories: editor-featured first, then newest.
  const leads = [...articles]
    .sort((left, right) => Number(Boolean(right.is_featured)) - Number(Boolean(left.is_featured)))
    .slice(0, HERO_SLIDES);
  const leadIds = new Set(leads.map((article) => article.id));
  const latest = articles.filter((article) => !leadIds.has(article.id));

  const topicRails = getTopics(articles)
    .filter((topic) => topic.count >= MIN_TOPIC_RAIL_SIZE)
    .slice(0, TOPIC_RAILS);

  return (
    <div className="flex flex-col gap-12">
      <h1 className="sr-only">
        {siteConfig.brandName}: {siteConfig.tagline}
      </h1>

      <HeroCarousel articles={leads} />

      <ArticleRail
        id="latest-title"
        title="Latest articles"
        description="Fresh explanations, newest first."
        articles={latest}
        action={{ href: "/articles", label: "View all" }}
      />

      {topicRails.map((topic) => (
        <ArticleRail
          key={topic.name}
          id={`topic-${topic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          title={topic.name}
          articles={articles.filter((article) => article.category === topic.name)}
          action={{ href: topicHref(topic.name), label: `All ${topic.name}` }}
        />
      ))}

      <AuthorNote />
    </div>
  );
}
