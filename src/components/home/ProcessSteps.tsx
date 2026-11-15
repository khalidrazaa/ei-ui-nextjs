import { servicesContent } from "@/config/services";

import SectionHeading from "./SectionHeading";

/** Three-step "how it works" strip. */
export default function ProcessSteps() {
  return (
    <section aria-labelledby="process-title">
      <SectionHeading id="process-title" title="From first call to running in a week" />

      <ol className="grid gap-4 md:grid-cols-3">
        {servicesContent.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6">
            <span className="font-serif text-3xl font-semibold tabular-nums text-primary" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-base">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
