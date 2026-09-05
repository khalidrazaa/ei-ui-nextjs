import type { Metadata } from "next";

import { getPublishedArticles } from "@/lib/articles";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.brandName}`,
};

export default async function AboutPage() {
  const { articles } = await getPublishedArticles(500);
  const categories = Array.from(new Set(articles.map((article) => article.category).filter(Boolean)));

  return (
    <section className="about-wrap">
      <p className="about-kicker">About {siteConfig.brandName}</p>
      <h1>Readable writing for fast-moving technology.</h1>
      <p>{siteConfig.aboutSummary}</p>

      <div className="about-grid">
        <article>
          <h2>What we publish</h2>
          <ul>
            {categories.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>How we write</h2>
          <p>
            Browse published articles from the home page or explore the article library by topic.
          </p>
        </article>
      </div>
    </section>
  );
}
