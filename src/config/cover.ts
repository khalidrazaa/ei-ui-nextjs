/**
 * Fallback cover surfaces, built only from palette tokens. Soft tints keep the
 * hero as the single saturated block on a page. Class names are written out in
 * full so Tailwind can detect them.
 */
export const coverGradients = [
  "bg-linear-to-br from-accent to-secondary",
  "bg-linear-to-br from-secondary to-warning/30",
  "bg-linear-to-br from-accent to-primary/25",
  "bg-linear-to-br from-secondary to-success/25",
] as const;
