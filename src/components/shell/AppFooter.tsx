import Link from "next/link";

import { siteConfig } from "@/config/site";

import styles from "./AppFooter.module.css";

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`app-shell ${styles.inner}`}>
        <p className={styles.copy}>
          <strong>{siteConfig.brandName} © 2026</strong>
          <span>Practical explanations for data, analytics and technology.</span>
        </p>
        <nav className={styles.links} aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <a
            href="https://www.linkedin.com/in/khalidrazaa/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn (opens in a new tab)"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/khalidrazaa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in a new tab)"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
