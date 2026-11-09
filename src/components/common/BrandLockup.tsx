import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import { siteConfig } from "@/config/site";

type BrandLockupProps = {
  showDescription?: boolean;
};

/** Brand logo with an optional description for the footer. */
export default function BrandLockup({
  showDescription = false,
}: BrandLockupProps) {
  return (
    <Link
      href="/"
      className="inline-flex max-w-full flex-col items-center gap-2"
      aria-label={`${siteConfig.brandName} home`}
    >
      <BrandMark className={showDescription ? undefined : "size-8"} />
      {showDescription && (
        <span className="max-w-72 text-center text-xs leading-relaxed text-muted-foreground">
          {siteConfig.footerTagline}
        </span>
      )}
    </Link>
  );
}
