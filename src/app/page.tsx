import ArticleFeed from "@/components/articles/ArticleFeed";
import HeroBanner from "@/components/articles/HeroBanner";
import { getPublishedArticles } from "@/lib/articles";

export default async function HomePage() {
  const { articles } = await getPublishedArticles(120);

  return (
    <div className="flex flex-col gap-10">
      <HeroBanner articleCount={articles.length} />
      <ArticleFeed
        articles={articles}
        title="Latest articles"
      />
    </div>
  );
}
