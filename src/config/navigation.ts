import { BookOpenText, House, Info, Mail, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Single source of truth for header and mobile dock navigation. */
export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/articles", label: "Articles", icon: BookOpenText },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];
