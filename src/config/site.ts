import { Github, Linkedin, type LucideIcon } from "lucide-react";
import publicContent from "./public-content.json";

export type SiteConfig = {
  brandName: string;
  domain: string;
  hostSite: string;
  googleAnalyticsId: string;
  description: string;
  tagline: string;
  footerTagline: string;
  contactEmail: string;
  /** Mirrors the --background token in globals.css (browser UI colour). */
  themeColor: string;
  socialLinks: Array<{ href: string; label: string; icon: LucideIcon }>;
  enquiries: string[];
  footerCta: { title: string; description: string; label: string };
  author: { name: string; bio: string };
};

export const siteConfig: SiteConfig = {
  brandName: "explainit",
  domain: "explainit.tech",
  hostSite: publicContent.hostSite,
  googleAnalyticsId: "G-RNF5N3S8K8",
  description:
    "explainit builds, hosts and runs websites, Power BI and Superset dashboards, and automated reports for growing businesses.",
  tagline: "Websites, dashboards and report automation",
  footerTagline: "Practical explanations for data, analytics and technology.",
  contactEmail: "core@explainit.tech",
  themeColor: "#e9eef8",
  socialLinks: [
    { href: "https://www.linkedin.com/in/khalidrazaa/", label: "LinkedIn", icon: Linkedin },
    { href: "https://github.com/khalidrazaa", label: "GitHub", icon: Github },
  ],
  footerCta: {
    title: "Have a question or an idea?",
    description: "Reach out about articles, projects or collaboration.",
    label: "Get in touch",
  },
  author: {
    name: "Khalid Raza",
    bio: "A technology professional working across data, analytics, software and automation, sharing practical ideas and lessons from real-world projects.",
  },
  enquiries: [
    "Article ideas or feedback",
    "Data and analytics projects",
    "Dashboard and reporting automation",
    "Collaboration",
    "General enquiries",
  ],
};
