"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { PRESS_SCALE, springs } from "@/lib/motion";

type PressableProps = HTMLMotionProps<"div">;

/**
 * Wraps content with spring press feedback. The spring starts from the live
 * scale value, so a press can be released or re-pressed mid-animation.
 */
export default function Pressable({ children, ...props }: PressableProps) {
  return (
    <motion.div whileTap={{ scale: PRESS_SCALE }} transition={springs.press} {...props}>
      {children}
    </motion.div>
  );
}
