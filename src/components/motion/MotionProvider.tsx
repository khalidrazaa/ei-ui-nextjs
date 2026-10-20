"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Honours prefers-reduced-motion for every motion component in the tree. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
      {children}
    </MotionConfig>
  );
}
