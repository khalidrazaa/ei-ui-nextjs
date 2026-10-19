import { Mail, type LucideIcon } from "lucide-react";
import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import Container from "@/components/common/Container";
import { navItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  external?: boolean;
  label?: string;
};

function FooterLink({ href, children, icon: Icon, external, label }: FooterLinkProps) {
  const className =
    "inline-flex h-7 items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary";
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      {children}
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </nav>
  );
}

export default function AppFooter() {
  return (
    <footer className="border-t border-border pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))] md:pb-0">
      <Container className="flex flex-col gap-6 py-6 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-2.5">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brandName} home`}>
            <BrandMark className="size-8" />
            <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
          </Link>
          <p className="text-sm text-muted-foreground">{siteConfig.footerTagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 sm:gap-x-14">
          <FooterColumn title="Explore">
            {navItems.map((item) => (
              <li key={item.href}>
                <FooterLink href={item.href} icon={item.icon}>
                  {item.label}
                </FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Connect">
            <li>
              <FooterLink href={`mailto:${siteConfig.contactEmail}`} icon={Mail} external>
                Email
              </FooterLink>
            </li>
            {siteConfig.socialLinks.map((link) => (
              <li key={link.href}>
                <FooterLink
                  href={link.href}
                  icon={link.icon}
                  external
                  label={`${link.label} (opens in a new tab)`}
                >
                  {link.label}
                </FooterLink>
              </li>
            ))}
          </FooterColumn>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="py-3 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
