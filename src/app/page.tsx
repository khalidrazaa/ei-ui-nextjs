import ArticleFeed from "@/components/articles/ArticleFeed";
import HeroBanner from "@/components/articles/HeroBanner";
import { getPublishedArticles } from "@/lib/articles";

export default async function HomePage() {
  const { articles } = await getPublishedArticles(120);
  const categoryCount = new Set(articles.map((article) => article.category).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-7">
      <HeroBanner articleCount={articles.length} categoryCount={categoryCount} />
      <ArticleFeed articles={articles} title="Latest articles" />
    </div>
  );
}
