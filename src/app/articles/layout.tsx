import type { ReactNode } from "react";

import ArticleLibrary from "@/components/articles/ArticleLibrary";
import { getPublishedArticles } from "@/lib/articles";

export default async function ArticlesLayout({ children }: { children: ReactNode }) {
  const { articles } = await getPublishedArticles(200);

  return (
    <div className="page-stack page-fill articles-index-page">
      <ArticleLibrary articles={articles}>{children}</ArticleLibrary>
    </div>
  );
}
