import Image from "next/image";

import { cn } from "@/lib/utils";

/** SVG brand logo used in the header and footer. */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/explainit-icon-outline.svg"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      unoptimized
      className={cn("size-10 shrink-0 object-contain", className)}
    />
  );
}
