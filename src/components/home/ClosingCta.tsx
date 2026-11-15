import { Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { servicesContent } from "@/config/services";
import { siteConfig } from "@/config/site";

/** Final call to action before the footer. */
export default function ClosingCta() {
  const { closing } = servicesContent;

  return (
    <section
      aria-labelledby="closing-title"
      className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-accent/60 p-6 sm:p-10 md:flex-row md:items-center md:justify-between"
    >
      <div className="max-w-xl">
        <h2 id="closing-title" className="font-serif text-3xl">
          {closing.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{closing.description}</p>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <Button asChild size="lg">
          <Link href={closing.cta.href}>{closing.cta.label}</Link>
        </Button>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Mail className="size-4" aria-hidden="true" />
          {siteConfig.contactEmail}
        </a>
      </div>
    </section>
  );
}
