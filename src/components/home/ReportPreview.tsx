import { Mail } from "lucide-react";

import { servicesContent } from "@/config/services";

/** Example of an automated weekly report: shows the product doing its job. */
export default function ReportPreview() {
  const { report } = servicesContent.hero;
  const peak = Math.max(...report.days.map((day) => day.value));

  return (
    <figure className="rounded-2xl border border-border bg-background p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/20 text-foreground">
          <Mail className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-medium">{report.subject}</p>
          <p className="text-muted-foreground">{report.sentAt}</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 py-4">
        {report.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-xs text-muted-foreground">{metric.label}</dt>
            <dd className="mt-0.5 font-serif text-2xl font-semibold tabular-nums tracking-tight">{metric.value}</dd>
            {metric.change && <dd className="text-xs font-medium text-success">{metric.change}</dd>}
          </div>
        ))}
      </dl>

      <div
        className="flex h-32 items-end gap-2"
        role="img"
        aria-label={`Daily sales this week, highest on ${report.days.find((day) => day.value === peak)?.label}`}
      >
        {report.days.map((day, index) => (
          <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className="report-bar w-full rounded-t-md bg-primary data-[peak=true]:bg-warning"
              data-peak={day.value === peak}
              style={{ height: `${(day.value / peak) * 100}%`, animationDelay: `${index * 70}ms` }}
            />
            <span className="text-[11px] text-muted-foreground">{day.label}</span>
          </div>
        ))}
      </div>

      <figcaption className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        {report.caption}
      </figcaption>
    </figure>
  );
}
