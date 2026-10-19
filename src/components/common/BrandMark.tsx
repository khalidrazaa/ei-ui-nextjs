import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Compact monogram used in the header and footer. */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {siteConfig.brandName.charAt(0)}
    </span>
  );
}
