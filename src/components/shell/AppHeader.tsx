"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLockup from "@/components/common/BrandLockup";
import Container from "@/components/common/Container";
import ActivePill from "@/components/motion/ActivePill";
import { Button } from "@/components/ui/button";
import { ctaNavItem, primaryNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/80">
      <Container className="flex h-(--header-height) items-center justify-between gap-4">
        <BrandLockup />

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            {primaryNavItems.map((item) => {
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

          {ctaNavItem && (
            <Button asChild size="sm">
              <Link href={ctaNavItem.href}>{ctaNavItem.label}</Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
