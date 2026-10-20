import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = ComponentProps<"div"> & {
  as?: ElementType;
};

/** Centred, width-capped content column shared by header, main and footer. */
export default function Container({ as: Tag = "div", className, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-(--container-max) px-4 sm:px-6", className)}
      {...props}
    />
  );
}
