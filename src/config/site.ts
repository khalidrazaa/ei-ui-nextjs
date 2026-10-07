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
};

export const siteConfig: SiteConfig = {
  brandName: "explainit",
  domain: "explainit.tech",
  hostSite: "explainit.tech",
  description:
    "explainit turns fast-moving technology shifts into clear, practical stories for real people.",
  tagline: "Technology made readable",
  heroLabel: "Daily Tech Brief",
  heroHighlight: "Medium depth, LinkedIn clarity",
  aboutSummary:
    "explainit publishes mobile-first explainers, analysis, and trend breakdowns so you can understand what matters without digging through technical noise.",
  navItems: [
    { href: "/", label: "Home" },
    { href: "/articles", label: "Articles" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
};
