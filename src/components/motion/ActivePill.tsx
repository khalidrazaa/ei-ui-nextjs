"use client";

import { motion } from "motion/react";

import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ActivePillProps = {
  /** Shared layout id: the pill glides between items that render it. */
  layoutId: string;
  className?: string;
};

/** Spring-animated active indicator that moves between navigation items. */
export default function ActivePill({ layoutId, className }: ActivePillProps) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={springs.smooth}
      className={cn("absolute inset-0 -z-10 rounded-full bg-accent", className)}
      aria-hidden="true"
    />
  );
}
