"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ActivePill from "@/components/motion/ActivePill";
import Pressable from "@/components/motion/Pressable";
import { navItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav";

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/80 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex h-[var(--dock-height)] max-w-md items-stretch justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.href} className="flex-1">
              <Pressable className="h-full">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                    active && "text-primary",
                  )}
                >
                  <span className="relative isolate flex h-7 w-14 items-center justify-center">
                    {active && <ActivePill layoutId="dock-nav-pill" />}
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </Pressable>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
