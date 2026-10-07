import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";

import styles from "../info-pages.module.css";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.brandName} makes data, analytics and technology easier to understand.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={`${styles.panel} ${styles.aboutCard}`} aria-labelledby="about-title">
        <h1 id="about-title" className={styles.title}>About {siteConfig.brandName}</h1>
        <p className={styles.lead}>
          <strong>{siteConfig.brandName} makes data, analytics and technology easier to understand.</strong>
        </p>
        <p className={styles.copy}>
          We focus on practical explanations, real-world use cases, architecture,
          automation, tools and cost considerations — without unnecessary jargon.
        </p>
        <p className={styles.copy}>
          Topics include data platforms, BigQuery, Power BI, Microsoft Fabric,
          APIs, reporting, dashboards and workflow automation.
        </p>

        <section className={styles.aboutSection} aria-labelledby="behind-title">
          <h2 id="behind-title" className={styles.subtitle}>Behind {siteConfig.brandName}</h2>
          <p className={styles.copy}>
            I&apos;m Khalid Raza, a technology professional working across data,
            analytics, software and automation.
          </p>
          <p className={styles.copy}>
            {siteConfig.brandName} is where I share practical ideas, solution patterns and
            lessons from working with technology in real-world environments.
          </p>
        </section>

        <div className={styles.aboutContact}>
          <p className={styles.contactPrompt}><strong>Have a question or an idea?</strong></p>
          <Link href="/contact" className={styles.textLink}>
            Get in touch <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
