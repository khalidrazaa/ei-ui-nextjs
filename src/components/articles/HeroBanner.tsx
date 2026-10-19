import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HeroBanner({ articleCount }: { articleCount: number }) {
  return (
    <section className="flex flex-col items-start gap-4 py-4 md:py-8" aria-labelledby="hero-title">
      <h1 id="hero-title" className="max-w-2xl text-4xl sm:text-5xl">
        {siteConfig.tagline}.
      </h1>
      <p className="max-w-xl text-base text-muted-foreground sm:text-lg">{siteConfig.description}</p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/articles">
          Browse {articleCount} {articleCount === 1 ? "article" : "articles"}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
