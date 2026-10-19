import type { ReactNode } from "react";

import ArticleLibrary from "@/components/articles/ArticleLibrary";
import { getPublishedArticles } from "@/lib/articles";

export default async function ArticlesLayout({ children }: { children: ReactNode }) {
  const { articles } = await getPublishedArticles(200);

  return (
    <div className="flex flex-col">
      <ArticleLibrary articles={articles}>{children}</ArticleLibrary>
    </div>
  );
}
