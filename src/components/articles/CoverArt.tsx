import { COVER_LAYOUT_COUNT, coverThemes } from "@/config/cover";

/** Stable hash so an article always gets the same artwork. */
function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

export function coverThemeFor(seed: string) {
  return coverThemes[hash(seed) % coverThemes.length];
}

type ArtProps = { light: string; strong: string; accent: string; stroke: string };

/** Circle with a dot grid. */
function Orbit({ light, strong, accent }: ArtProps) {
  return (
    <>
      <circle cx="300" cy="100" r="130" className={light} />
      <circle cx="300" cy="100" r="76" className={strong} fillOpacity="0.9" />
      <circle cx="352" cy="52" r="15" className={accent} />
      {Array.from({ length: 20 }, (_, index) => (
        <circle
          key={index}
          cx={32 + (index % 5) * 18}
          cy={36 + Math.floor(index / 5) * 18}
          r="2.5"
          className={strong}
          fillOpacity="0.55"
        />
      ))}
    </>
  );
}

/** Rising bars, like a chart. */
function Bars({ light, strong, accent }: ArtProps) {
  const heights = [60, 95, 75, 130, 105, 160, 140];
  return (
    <>
      {heights.map((height, index) => (
        <rect
          key={index}
          x={160 + index * 32}
          y={200 - height}
          width="20"
          height={height}
          rx="10"
          className={index === 5 ? strong : light}
        />
      ))}
      <circle cx={160 + 5 * 32 + 10} cy="28" r="12" className={accent} />
    </>
  );
}

/** Concentric rings from the corner. */
function Rings({ strong, accent, stroke }: ArtProps) {
  return (
    <>
      {[50, 95, 140, 185, 230].map((radius) => (
        <circle key={radius} cx="400" cy="200" r={radius} fill="none" strokeWidth="2" className={stroke} />
      ))}
      <circle cx="400" cy="200" r="50" className={strong} fillOpacity="0.9" />
      <circle cx="318" cy="112" r="11" className={accent} />
    </>
  );
}

/** Overlapping rounded blocks. */
function Blocks({ light, strong, accent }: ArtProps) {
  return (
    <>
      <rect x="215" y="26" width="120" height="120" rx="26" transform="rotate(12 275 86)" className={light} />
      <rect x="268" y="62" width="104" height="104" rx="26" transform="rotate(-8 320 114)" className={strong} fillOpacity="0.9" />
      <circle cx="236" cy="168" r="16" className={accent} />
      <rect x="40" y="150" width="74" height="10" rx="5" className={strong} fillOpacity="0.5" />
      <rect x="40" y="170" width="46" height="10" rx="5" className={strong} fillOpacity="0.3" />
    </>
  );
}

const layouts = [Orbit, Bars, Rings, Blocks] as const;

export default function CoverArt({ seed }: { seed: string }) {
  const value = hash(seed);
  const theme = coverThemes[value % coverThemes.length];
  const Layout = layouts[Math.floor(value / coverThemes.length) % COVER_LAYOUT_COUNT];

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMaxYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <Layout light={theme.light} strong={theme.strong} accent={theme.accent} stroke={theme.stroke} />
    </svg>
  );
}
