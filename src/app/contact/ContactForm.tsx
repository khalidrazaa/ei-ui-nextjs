"use client";

import { type FormEvent, useRef, useState } from "react";

import { combineContactPhone } from "@/lib/contact-phone";

import styles from "../info-pages.module.css";
import CountryCodeInput from "./CountryCodeInput";

export default function ContactForm() {
  const submitting = useRef(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const email = String(values.get("email") || "").trim();
    const message = String(values.get("message") || "").trim();
    let phone: string | null;
    try {
      phone = combineContactPhone(
        countryCode,
        String(values.get("phone") || "")
      );
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Please check your phone number." });
      return;
    }
    if (!name || !email || !message) {
      setFeedback({ kind: "error", message: "Please enter your name, email and message." });
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, ...(phone ? { phone } : {}) }),
        signal: AbortSignal.timeout(25_000),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok || typeof data !== "object" || data === null || !("status" in data) || data.status !== true) {
        const detail = typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string"
          ? data.detail
          : "Unable to send your message. Please try again or email core@explainit.tech.";
        throw new Error(detail);
      }
      form.reset();
      setCountryCode("+91");
      setFeedback({ kind: "success", message: "Your message has been submitted. Thank you for getting in touch." });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error && error.name !== "TimeoutError" && error.name !== "AbortError" && error.name !== "TypeError"
          ? error.message
          : "Unable to send your message. Please try again or email core@explainit.tech.",
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.form}
      aria-label="Send a message"
      aria-describedby={feedback ? "contact-form-feedback" : undefined}
      aria-busy={isSubmitting}
      onSubmit={onSubmit}
      onChange={() => setFeedback(null)}
    >
      <div className={styles.formRow}>
        <label className={styles.field} htmlFor="contact-name">
          <span>Name</span>
          <input id="contact-name" name="name" autoComplete="name" maxLength={80} disabled={isSubmitting} required />
        </label>
        <label className={styles.field} htmlFor="contact-email">
          <span>Email</span>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} disabled={isSubmitting} required />
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-phone"><span>Phone</span></label>
        <div className={styles.phoneRow}>
          <CountryCodeInput
            value={countryCode}
            onChange={(value) => {
              setCountryCode(value);
              setFeedback(null);
            }}
            disabled={isSubmitting}
          />
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="Phone number"
            maxLength={40}
            aria-describedby="contact-phone-hint"
            disabled={isSubmitting}
          />
        </div>
        <p id="contact-phone-hint" className={styles.fieldHint}>
          You can also paste a full number beginning with +.
        </p>
      </div>
      <label className={styles.field} htmlFor="contact-message">
        <span>Message</span>
        <textarea id="contact-message" name="message" rows={4} maxLength={5000} disabled={isSubmitting} required />
      </label>
      {feedback && (
        <p
          id="contact-form-feedback"
          className={`${styles.formNote} ${feedback.kind === "error" ? styles.formError : styles.formSuccess}`}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
      <button className={styles.sendButton} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
