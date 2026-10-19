import { Mail } from "lucide-react";
import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import Container from "@/components/common/Container";
import { navItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
};

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="flex flex-col gap-1.5 text-sm">{children}</ul>
    </nav>
  );
}

const linkClass = "text-foreground/80 transition-colors hover:text-primary";

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-card/40 pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))] md:pb-0">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brandName} home`}>
            <BrandMark />
            <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.footerTagline}</p>
        </div>

        <FooterColumn title="Explore">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Connect">
          <li>
            <a href={`mailto:${siteConfig.contactEmail}`} className={`${linkClass} inline-flex items-center gap-1.5`}>
              <Mail className="size-3.5" aria-hidden="true" />
              {siteConfig.contactEmail}
            </a>
          </li>
          {siteConfig.socialLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} (opens in a new tab)`}
                className={linkClass}
              >
                {link.label}
              </a>
            </li>
          ))}
        </FooterColumn>
      </Container>

      <div className="border-t border-border">
        <Container className="py-3 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
