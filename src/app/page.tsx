import EmptyState from "@/components/common/EmptyState";
import HomeHero from "@/components/home/HomeHero";
import LatestArticles from "@/components/home/LatestArticles";
import TopicGrid from "@/components/home/TopicGrid";
import { getPublishedArticles } from "@/lib/articles";
import { getTopics } from "@/lib/topics";

export default async function HomePage() {
  const { articles } = await getPublishedArticles(120);
  const [featured, ...rest] = articles;
  const topics = getTopics(articles);

  if (!featured) {
    return <EmptyState title="No articles published yet" description="Check back soon." />;
  }

  return (
    <div className="flex flex-col gap-12">
      <HomeHero featured={featured} topics={topics} />
      <TopicGrid topics={topics} />
      <LatestArticles articles={rest} />
    </div>
  );
}
