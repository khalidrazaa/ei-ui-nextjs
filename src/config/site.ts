export type SiteConfig = {
  brandName: string;
  domain: string;
  hostSite: string;
  description: string;
  tagline: string;
  heroLabel: string;
  heroHighlight: string;
  aboutSummary: string;
  navItems: Array<{ href: string; label: string }>;
  contentPillars: string[];
};

export const siteConfig: SiteConfig = {
  brandName: "Explainit.tech",
  domain: "explainit.tech",
  hostSite: "explainit.tech",
  description:
    "Explainit.tech turns fast-moving technology shifts into clear, practical stories for real people.",
  tagline: "Technology made readable",
  heroLabel: "Daily Tech Brief",
  heroHighlight: "Medium depth, LinkedIn clarity",
  aboutSummary:
    "Explainit.tech publishes mobile-first explainers, analysis, and trend breakdowns so you can understand what matters without digging through technical noise.",
  navItems: [
    { href: "/", label: "Home" },
    { href: "/articles", label: "Articles" },
    { href: "/about", label: "About" },
  ],
  contentPillars: ["AI", "Product", "Startups", "Developer Tools", "Future of Work"],
};
