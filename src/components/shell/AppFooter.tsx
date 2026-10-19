import { ArrowUp, Mail, type LucideIcon } from "lucide-react";
import Link from "next/link";

import BrandMark from "@/components/common/BrandMark";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { ctaNavItem, navItems } from "@/config/navigation";
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
    "inline-flex h-7 items-center gap-2 text-sm text-chrome-foreground/75 transition-colors hover:text-chrome-foreground";
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
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-chrome-foreground/60">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </nav>
  );
}

export default function AppFooter() {
  const { footerCta } = siteConfig;

  return (
    <footer className="bg-chrome text-chrome-foreground pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))] md:pb-0">
      <Container className="pt-8">
        <div className="flex flex-col gap-4 rounded-xl border border-chrome-foreground/15 bg-chrome-foreground/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg">{footerCta.title}</h2>
            <p className="mt-1 text-sm text-chrome-foreground/70">{footerCta.description}</p>
          </div>
          {ctaNavItem && (
            <Button asChild variant="warm" className="self-start sm:self-auto">
              <Link href={ctaNavItem.href}>{footerCta.label}</Link>
            </Button>
          )}
        </div>
      </Container>

      <Container className="grid gap-8 py-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brandName} home`}>
            <BrandMark className="size-8" />
            <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
          </Link>
          <p className="text-sm text-chrome-foreground/70">{siteConfig.footerTagline}</p>
        </div>

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
              {siteConfig.contactEmail}
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
      </Container>

      <div className="border-t border-chrome-foreground/10">
        <Container className="flex items-center justify-between gap-4 py-3 text-xs text-chrome-foreground/60">
          <p>
            © {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1 transition-colors hover:text-chrome-foreground"
          >
            Back to top
            <ArrowUp className="size-3" aria-hidden="true" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
