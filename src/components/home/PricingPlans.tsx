import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { servicesContent } from "@/config/services";
import { cn } from "@/lib/utils";

import SectionHeading from "./SectionHeading";

/** Monthly plan cards; the featured plan gets the accent border and primary button. */
export default function PricingPlans() {
  const { plans, closing } = servicesContent;

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24">
      <SectionHeading
        id="pricing-title"
        title="Monthly plans"
        description="Start small and move up when you need more."
      />

      <ul className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.name}
            className={cn(
              "relative flex flex-col gap-5 rounded-2xl border border-border bg-card/60 p-6",
              plan.featured && "border-2 border-primary bg-card md:-my-3 md:py-9",
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg">{plan.name}</h3>
                {plan.featured && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.summary}</p>
            </div>

            <ul className="flex flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild variant={plan.featured ? "default" : "outline"} className="mt-auto">
              <Link href={closing.cta.href}>Get a quote</Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
