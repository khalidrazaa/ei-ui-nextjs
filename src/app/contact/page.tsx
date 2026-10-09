import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import ContactForm from "./ContactForm";
import styles from "../info-pages.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.brandName} for questions, feedback, projects or collaboration.`,
  alternates: { canonical: "/contact" },
};

const enquiries = [
  "Article ideas or feedback",
  "Data and analytics projects",
  "Dashboard and reporting automation",
  "Collaboration",
  "General enquiries",
];

export default function ContactPage() {
  return (
    <div className={`${styles.page} page-fill`}>
      <section className={`${styles.panel} ${styles.contactCard}`} aria-labelledby="contact-title">
        <header>
          <h1 id="contact-title" className={styles.title}>Contact</h1>
          <p className={styles.copy}>
            Have a question, suggestion or project you&apos;d like to discuss?
          </p>
          <p className={styles.copy}>Use the form below or reach out at:</p>
          <a href="mailto:core@explainit.tech" className={styles.email}>
            <strong>core@explainit.tech</strong>
          </a>
        </header>

        <div className={styles.contactBody}>
          <div>
            <h2 className={styles.contactLabel}>You can contact me about:</h2>
            <ul className={styles.enquiries}>
              {enquiries.map((enquiry) => (
                <li key={enquiry}>{enquiry}</li>
              ))}
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
