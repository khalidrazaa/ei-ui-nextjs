import Link from "next/link";

import AuthorAvatar from "@/components/common/AuthorAvatar";
import { siteConfig } from "@/config/site";

/** Compact author card shown after the article. */
export default function AuthorBox() {
  const { author } = siteConfig;

  return (
    <aside
      aria-label="About the author"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
    >
      <AuthorAvatar name={author.name} className="size-14 text-lg" />
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Written by</p>
        <p className="font-serif text-xl font-semibold">{author.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
      </div>
      <Link href="/about" className="shrink-0 text-sm font-medium text-primary hover:underline">
        About the author →
      </Link>
    </aside>
  );
}
