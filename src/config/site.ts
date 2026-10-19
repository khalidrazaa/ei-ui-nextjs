import { Github, Linkedin, type LucideIcon } from "lucide-react";

export type SiteConfig = {
  brandName: string;
  domain: string;
  hostSite: string;
  description: string;
  tagline: string;
  footerTagline: string;
  contactEmail: string;
  /** Mirrors the --background token in globals.css (browser UI colour). */
  themeColor: string;
  socialLinks: Array<{ href: string; label: string; icon: LucideIcon }>;
  enquiries: string[];
};

export const siteConfig: SiteConfig = {
  brandName: "explainit",
  domain: "explainit.tech",
  hostSite: "explainit.tech",
  description:
    "explainit turns fast-moving technology shifts into clear, practical stories for real people.",
  tagline: "Technology made readable",
  footerTagline: "Practical explanations for data, analytics and technology.",
  contactEmail: "core@explainit.tech",
  themeColor: "#e9eef8",
  socialLinks: [
    { href: "https://www.linkedin.com/in/khalidrazaa/", label: "LinkedIn", icon: Linkedin },
    { href: "https://github.com/khalidrazaa", label: "GitHub", icon: Github },
  ],
  enquiries: [
    "Article ideas or feedback",
    "Data and analytics projects",
    "Dashboard and reporting automation",
    "Collaboration",
    "General enquiries",
  ],
};
