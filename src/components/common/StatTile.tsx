type StatTileProps = {
  label: string;
  value: number | string;
};

export default function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex min-w-24 flex-col rounded-lg border border-border bg-card px-3.5 py-2">
      <span className="text-xl font-semibold tabular-nums leading-tight">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
