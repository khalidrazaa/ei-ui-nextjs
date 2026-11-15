import { servicesContent } from "@/config/services";

import SectionHeading from "./SectionHeading";

/** Services as divided rows: what it is on the left, what's included on the right. */
export default function ServiceGrid() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-24">
      <SectionHeading
        id="services-title"
        title="What we set up and run for you"
        description="Pick one, or combine them into a single monthly plan."
      />

      <ul className="divide-y divide-border border-y border-border">
        {servicesContent.services.map((service) => {
          const Icon = service.icon;

          return (
            <li
              key={service.id}
              id={service.id}
              className="grid scroll-mt-24 gap-4 py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10"
            >
              <div className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl">{service.title}</h3>
                  <p className="mt-1 max-w-[46ch] text-muted-foreground">{service.summary}</p>
                </div>
              </div>

              <ul className="grid content-start gap-x-6 gap-y-2 text-sm sm:grid-cols-2 md:pt-1">
                {service.points.map((point) => (
                  <li key={point} className="flex items-baseline gap-2">
                    <span className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
