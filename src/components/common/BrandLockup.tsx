import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import { siteConfig } from "@/config/site";

/** Monogram with the brand name stacked over the tagline. */
export default function BrandLockup() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brandName} home`}>
      <BrandMark className="size-8" />
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
        <span className="mt-1 text-[0.7rem] text-muted-foreground">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}
