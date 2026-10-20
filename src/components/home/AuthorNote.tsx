import Link from "next/link";

import AuthorAvatar from "@/components/common/AuthorAvatar";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/** Short personal note that closes the home page. */
export default function AuthorNote() {
  const { author, brandName } = siteConfig;

  return (
    <section
      className="grid items-center gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]"
      aria-labelledby="author-title"
    >
      <AuthorAvatar name={author.name} className="size-14 text-lg" />

      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Behind {brandName}</p>
        <h2 id="author-title" className="mt-1 font-serif text-2xl">
          Written by {author.name}
        </h2>
        <p className="mt-2 text-muted-foreground">{author.bio}</p>
      </div>

      <Button asChild variant="outline" className="justify-self-start md:justify-self-end">
        <Link href="/about">About the author</Link>
      </Button>
    </section>
  );
}
