import ArticleFeed from "@/components/articles/ArticleFeed";
import HeroBanner from "@/components/articles/HeroBanner";
import { getPublishedArticles } from "@/lib/articles";

export default async function HomePage() {
  const { articles } = await getPublishedArticles(120);

  return (
    <div className="page-stack">
      <HeroBanner articleCount={articles.length} />
      <ArticleFeed
        articles={articles}
        title="Latest Articles"
        subtitle="Browse the latest published stories."
      />
    </div>
  );
}
