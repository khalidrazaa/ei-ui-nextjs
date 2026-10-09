"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="app-shell app-header-inner">
        <Link href="/" className="brand-block" aria-label={`${siteConfig.brandName} home`}>
          <span className="brand-title">{siteConfig.brandName}</span>
          <span className="brand-subtitle">{siteConfig.tagline}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteConfig.navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
