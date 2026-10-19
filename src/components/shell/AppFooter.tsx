import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function AppFooter() {
  return (
    <footer className="border-t border-border pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">
            {siteConfig.brandName} © {new Date().getFullYear()}
          </span>
          <span className="block md:ml-2 md:inline">{siteConfig.footerTagline}</span>
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Footer navigation">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label} (opens in a new tab)`}
              className="hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
