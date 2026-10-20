import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { articlePath } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";

type Neighbour = Pick<Article, "slug" | "title" | "category">;

type ArticleNavProps = {
  newer?: Neighbour | null;
  older?: Neighbour | null;
};

function NavCard({ article, direction }: { article: Neighbour; direction: "newer" | "older" }) {
  const isOlder = direction === "older";

  return (
    <Link
      href={articlePath(article)}
      className={cn(
        "group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40",
        isOlder ? "items-start text-left" : "items-end text-right sm:col-start-2",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {isOlder && <ArrowLeft className="size-3.5" aria-hidden="true" />}
        {isOlder ? "Older" : "Newer"}
        {!isOlder && <ArrowRight className="size-3.5" aria-hidden="true" />}
      </span>
      <span className="font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
        {article.title}
      </span>
      {article.category && <span className="text-xs text-muted-foreground">{article.category}</span>}
    </Link>
  );
}

/** Previous / next article, by publish date. */
export default function ArticleNav({ newer, older }: ArticleNavProps) {
  if (!newer && !older) return null;

  return (
    <nav aria-label="More articles" className="grid gap-3 sm:grid-cols-2">
      {older && <NavCard article={older} direction="older" />}
      {newer && <NavCard article={newer} direction="newer" />}
    </nav>
  );
}
