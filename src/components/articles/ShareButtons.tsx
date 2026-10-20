import { Linkedin, Twitter } from "lucide-react";

import CopyLinkButton from "@/components/common/CopyLinkButton";
import { articleUrl, shareHref } from "@/lib/share";
import { cn } from "@/lib/utils";

type ShareButtonsProps = {
  slug: string;
  title: string;
  /** "column" is the sticky desktop rail; "row" sits inline. */
  direction?: "row" | "column";
  className?: string;
};

const linkClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground";

export default function ShareButtons({ slug, title, direction = "row", className }: ShareButtonsProps) {
  const url = articleUrl(slug);

  return (
    <div
      role="group"
      aria-label="Share this article"
      className={cn("flex items-center gap-2", direction === "column" && "flex-col", className)}
    >
      <a
        href={shareHref("linkedin", url, title)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on LinkedIn (opens in a new tab)"
        title="Share on LinkedIn"
      >
        <Linkedin className="size-4" aria-hidden="true" />
      </a>
      <a
        href={shareHref("x", url, title)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on X (opens in a new tab)"
        title="Share on X"
      >
        <Twitter className="size-4" aria-hidden="true" />
      </a>
      <CopyLinkButton iconOnly />
    </div>
  );
}
