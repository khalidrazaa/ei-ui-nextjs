import ArticleCard from "@/components/articles/ArticleCard";
import SectionHeading from "@/components/common/SectionHeading";
import { Article } from "@/types/article";

const DEFAULT_LIMIT = 6;

type LatestArticlesProps = {
  articles: Article[];
  limit?: number;
};

export default function LatestArticles({ articles, limit = DEFAULT_LIMIT }: LatestArticlesProps) {
  if (!articles.length) return null;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="latest-title">
      <SectionHeading
        id="latest-title"
        title="Latest articles"
        action={{ href: "/articles", label: "View all" }}
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, limit).map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
