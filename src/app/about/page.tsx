import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.brandName}`,
};

export default function AboutPage() {
  return (
    <section className="about-wrap">
      <p className="about-kicker">About {siteConfig.brandName}</p>
      <h1>Readable writing for fast-moving technology.</h1>
      <p>{siteConfig.aboutSummary}</p>

      <div className="about-grid">
        <article>
          <h2>What we publish</h2>
          <ul>
            {siteConfig.contentPillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>How we write</h2>
          <p>
            We combine trend intelligence from the FastAPI backend with clear narrative formatting. Every story is designed for scrolling and reading on phones first.
          </p>
          <p>Host site for this app: {siteConfig.hostSite}</p>
        </article>
      </div>
    </section>
  );
}
