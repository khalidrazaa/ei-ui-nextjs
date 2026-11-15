import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { servicesContent } from "@/config/services";

import ReportPreview from "./ReportPreview";

/** Opening statement of the home page: the problem we remove and how to start. */
export default function ServicesHero() {
  const { hero } = servicesContent;

  return (
    <section
      aria-labelledby="hero-title"
      className="grid items-center gap-10 rounded-2xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14"
    >
      <div className="flex flex-col gap-6">
        <h1
          id="hero-title"
          className="max-w-[16ch] text-balance font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
        >
          {hero.title}
        </h1>

        <p className="max-w-[58ch] text-lg text-muted-foreground">{hero.description}</p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          {hero.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2">
              <Check className="size-4 text-primary" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <ReportPreview />
    </section>
  );
}
