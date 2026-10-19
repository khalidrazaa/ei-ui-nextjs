"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandMark from "@/components/common/BrandMark";
import Container from "@/components/common/Container";
import ActivePill from "@/components/motion/ActivePill";
import { navItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/80">
      <Container className="flex h-(--header-height) items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${siteConfig.brandName} home`}
        >
          <BrandMark />
          <span className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
            <span className="hidden text-xs text-muted-foreground lg:inline">{siteConfig.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-accent-foreground hover:text-accent-foreground",
                )}
              >
                {active && <ActivePill layoutId="header-nav-pill" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
