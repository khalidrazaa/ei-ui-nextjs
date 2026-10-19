import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Monogram with the brand name stacked over the tagline. */
type BrandLockupProps = {
  /** "inverse" is for the dark chrome surfaces. */
  tone?: "default" | "inverse";
};

export default function BrandLockup({ tone = "default" }: BrandLockupProps) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brandName} home`}>
      <BrandMark className="size-8" />
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
        <span
          className={cn("mt-1 text-[0.7rem]", tone === "inverse" ? "text-chrome-foreground/70" : "text-muted-foreground")}
        >
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}
