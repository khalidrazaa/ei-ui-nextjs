import Link from "next/link";

import { cn } from "@/lib/utils";

type SegmentedLinksProps = {
  label: string;
  options: Array<{ label: string; href: string; active: boolean }>;
  className?: string;
  /** Stretch to the container width with equal-width segments. */
  fill?: boolean;
};

/** Segmented control made of links, so it works without client JavaScript. */
export default function SegmentedLinks({ label, options, className, fill }: SegmentedLinksProps) {
  return (
    <nav
      aria-label={label}
      className={cn("inline-flex rounded-lg border border-border bg-card p-0.5", fill && "flex w-full", className)}
    >
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          aria-current={option.active ? "true" : undefined}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            fill && "flex-1 text-center",
            option.active && "bg-accent text-accent-foreground hover:text-accent-foreground",
          )}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
