"use client";

import { useEffect, useState } from "react";

import { Heading } from "@/lib/headings";
import { cn } from "@/lib/utils";

type TableOfContentsProps = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) {
          setActiveId(visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0].target.id);
        }
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">On this page</p>
      <ul className="flex flex-col border-l border-border">
        {headings.map((heading) => {
          const active = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  heading.level === 3 && "pl-5",
                  active && "border-primary font-medium text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
