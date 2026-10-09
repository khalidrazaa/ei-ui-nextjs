import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Articles",
  description: `Published stories on ${siteConfig.brandName}`,
};

export default function ArticlesPage() {
  return <h1 className="sr-only">Articles</h1>;
}
