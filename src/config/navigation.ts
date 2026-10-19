import { BookOpenText, House, Info, Mail, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rendered as the header call-to-action button instead of a nav link. */
  cta?: boolean;
};

/** Single source of truth for header, footer and mobile dock navigation. */
export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/articles", label: "Articles", icon: BookOpenText },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail, cta: true },
];

export const primaryNavItems = navItems.filter((item) => !item.cta);
export const ctaNavItem = navItems.find((item) => item.cta);
