import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Articles",
  description: `Published stories on ${siteConfig.brandName}`,
};

/** The visible heading and list are rendered by ArticleLibrary in the segment layout. */
export default function ArticlesPage() {
  return null;
}
