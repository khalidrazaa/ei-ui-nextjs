import type { Transition } from "motion/react";

/**
 * Spring presets. Defaults are critically damped (no overshoot); only
 * gestures that carry momentum (a press release) get a little bounce.
 */
export const springs = {
  /** Default UI motion: smooth settle, no overshoot. */
  smooth: { type: "spring", bounce: 0, duration: 0.4 },
  /** Press feedback: quick and slightly lively on release. */
  press: { type: "spring", bounce: 0.2, duration: 0.3 },
} as const satisfies Record<string, Transition>;

/** Scale applied while an element is pressed. */
export const PRESS_SCALE = 0.97;

/** Delay between slides in autoplaying carousels. */
export const CAROUSEL_AUTOPLAY_MS = 6000;
