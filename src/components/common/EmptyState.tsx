import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <h3>{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
