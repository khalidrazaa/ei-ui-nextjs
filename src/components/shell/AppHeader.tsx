import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-shell app-header-inner">
        <Link href="/" className="brand-block" aria-label={`${siteConfig.brandName} home`}>
          <span className="brand-title">{siteConfig.brandName}</span>
          <span className="brand-subtitle">{siteConfig.tagline}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteConfig.navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
