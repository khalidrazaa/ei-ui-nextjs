import type { Metadata } from "next";

import ArticleLibrary from "@/components/articles/ArticleLibrary";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles",
  description: `Published stories on ${siteConfig.brandName}`,
};

export default async function ArticlesPage() {
  const { articles, usedFallback } = await getPublishedArticles(200);

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p>Published from host: {siteConfig.hostSite}</p>
        <h1>All Published Articles</h1>
      </section>

      <ArticleLibrary articles={articles} usedFallback={usedFallback} />
    </div>
  );
}
