import { ChevronDown } from "lucide-react";

import { Heading } from "@/lib/headings";
import { cn } from "@/lib/utils";

/** Collapsible "On this page" for screens without the sticky contents rail. */
export default function InlineContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null;

  return (
    <details className="group rounded-xl border border-border bg-card px-4 py-3 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        On this page
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
                heading.level === 3 && "pl-4",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
