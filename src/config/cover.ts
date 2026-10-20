/**
 * Fallback cover themes, built only from palette tokens. Each theme has a flat
 * surface plus three tones used by the artwork. Class names are written out in
 * full so Tailwind can detect them.
 */
export type CoverTheme = {
  surface: string;
  /** Large background shapes. */
  light: string;
  /** Foreground shapes. */
  strong: string;
  /** Single accent mark. */
  accent: string;
  /** Outline-only shapes. */
  stroke: string;
};

export const coverThemes: CoverTheme[] = [
  {
    surface: "bg-primary",
    light: "fill-primary-foreground/15",
    strong: "fill-primary-foreground",
    accent: "fill-warning",
    stroke: "stroke-primary-foreground/30",
  },
  {
    surface: "bg-warning",
    light: "fill-foreground/10",
    strong: "fill-foreground",
    accent: "fill-primary-foreground",
    stroke: "stroke-foreground/25",
  },
  {
    surface: "bg-success",
    light: "fill-success-foreground/15",
    strong: "fill-success-foreground",
    accent: "fill-warning",
    stroke: "stroke-success-foreground/30",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--primary)_68%,var(--foreground))]",
    light: "fill-primary-foreground/10",
    strong: "fill-primary-foreground",
    accent: "fill-warning",
    stroke: "stroke-primary-foreground/25",
  },
];

/** Number of distinct artwork compositions in CoverArt. */
export const COVER_LAYOUT_COUNT = 4;
