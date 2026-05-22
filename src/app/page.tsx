import ArticleFeed from "@/components/articles/ArticleFeed";
import HeroBanner from "@/components/articles/HeroBanner";
import { getPublishedArticles } from "@/lib/articles";

export default async function HomePage() {
  const { articles, usedFallback } = await getPublishedArticles(120);

  return (
    <div className="page-stack">
      <HeroBanner articleCount={articles.length} />
      <ArticleFeed
        articles={articles}
        usedFallback={usedFallback}
        title="Insights and Automation Playbooks"
        subtitle="Practical breakdowns on data automation, workflow systems, and delivery acceleration."
      />
    </div>
  );
}
