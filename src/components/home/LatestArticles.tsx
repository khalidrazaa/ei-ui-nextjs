import Link from "next/link";

import ArticleCard from "@/components/articles/ArticleCard";
import { Article } from "@/types/article";

import SectionHeading from "./SectionHeading";

/** Small "from our articles" strip; the full reading experience lives on /articles. */
export default function LatestArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section aria-labelledby="latest-title">
      <div className="flex flex-wrap items-end justify-between gap-x-4">
        <SectionHeading
          id="latest-title"
          title="From our articles"
          description="Practical explanations of data, analytics and technology."
        />
        <Link href="/articles" className="mb-6 text-sm font-medium text-primary hover:underline">
          Read all articles
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
