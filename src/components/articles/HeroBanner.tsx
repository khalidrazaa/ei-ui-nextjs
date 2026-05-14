import { Bolt, Flame, Smartphone } from "lucide-react";

import { siteConfig } from "@/config/site";

type HeroBannerProps = {
  articleCount: number;
};

export default function HeroBanner({ articleCount }: HeroBannerProps) {
  return (
    <section className="hero-grid animate-float">
      <article className="hero-card hero-main">
        <p className="hero-label">{siteConfig.heroLabel}</p>
        <h1>
          {siteConfig.tagline}
          <span>{siteConfig.heroHighlight}</span>
        </h1>
        <p>{siteConfig.aboutSummary}</p>

        <div className="hero-stats">
          <div>
            <strong>{articleCount}</strong>
            <span>Published stories</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Mobile optimized</span>
          </div>
        </div>
      </article>

      <article className="hero-card">
        <h2>Why this feed feels different</h2>
        <ul>
          <li>
            <Flame size={18} />
            <span>Editorial clarity inspired by Medium reading depth.</span>
          </li>
          <li>
            <Bolt size={18} />
            <span>LinkedIn-style scannable structure for quick updates.</span>
          </li>
          <li>
            <Smartphone size={18} />
            <span>Touch-first interactions built for phone usage patterns.</span>
          </li>
        </ul>
      </article>
    </section>
  );
}
