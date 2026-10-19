"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/config/navigation";
import ActivePill from "@/components/motion/ActivePill";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/80">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex flex-col leading-none"
          aria-label={`${siteConfig.brandName} home`}
        >
          <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
          <span className="mt-1 text-xs text-muted-foreground">{siteConfig.tagline}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-accent-foreground hover:text-accent-foreground",
                )}
              >
                {active && <ActivePill layoutId="header-nav-pill" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
