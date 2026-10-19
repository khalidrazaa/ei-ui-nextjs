import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: number | string;
  /** "inverse" is for tiles placed on a primary-coloured surface. */
  tone?: "default" | "inverse";
};

export default function StatTile({ label, value, tone = "default" }: StatTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-28 flex-col rounded-xl border px-4 py-2.5",
        tone === "inverse"
          ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
          : "border-border bg-card",
      )}
    >
      <span className="text-2xl font-semibold tabular-nums leading-tight">{value}</span>
      <span
        className={cn("text-xs", tone === "inverse" ? "text-primary-foreground/80" : "text-muted-foreground")}
      >
        {label}
      </span>
    </div>
  );
}
