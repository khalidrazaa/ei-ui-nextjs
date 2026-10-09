"use client";

import { type ClipboardEvent, type FormEvent, useRef, useState } from "react";

import { combineContactPhone, contactPhoneInputDigits } from "@/lib/contact-phone";
import { getContactAttribution } from "@/lib/contact-attribution";

import styles from "../info-pages.module.css";
import CountryCodeInput from "./CountryCodeInput";

export default function ContactForm() {
  const submitting = useRef(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  function validatePhone(number: string, code: string = countryCode): string | null {
    try {
      combineContactPhone(code, number);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Please check your phone number.";
    }
  }

  function onPhonePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    try {
      const pasted = event.clipboardData.getData("text");
      const digits = contactPhoneInputDigits(countryCode, pasted);
      const start = event.currentTarget.selectionStart ?? 0;
      const end = event.currentTarget.selectionEnd ?? phoneNumber.length;
      const next = pasted.trim().startsWith("+")
        ? digits
        : phoneNumber.slice(0, start) + digits + phoneNumber.slice(end);
      if (next.length > 15) throw new Error("Please check the length of your phone number.");
      setPhoneNumber(next);
      setPhoneError(phoneTouched ? validatePhone(next) : null);
      setFeedback(null);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "Use digits only for the phone number.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const email = String(values.get("email") || "").trim();
    const message = String(values.get("message") || "").trim();
    const subject = String(values.get("subject") || "").trim();
    const website = String(values.get("website") || "");
    let phone: string | null;
    try {
      phone = combineContactPhone(
        countryCode,
        phoneNumber
      );
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "Please check your phone number.");
      setPhoneTouched(true);
      phoneRef.current?.focus();
      return;
    }
    setPhoneError(null);
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
        body: JSON.stringify({
          name, email, message,
          ...(phone ? { phone, country_code: countryCode } : {}),
          ...(subject ? { subject } : {}),
          website,
          ...getContactAttribution(),
        }),
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
      setPhoneNumber("");
      setPhoneError(null);
      setPhoneTouched(false);
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
              if (!/^\+?[0-9]{0,3}$/.test(value)) {
                setPhoneError("Use + followed by digits for the country code.");
                return;
              }
              setCountryCode(value);
              setPhoneError(phoneTouched ? validatePhone(phoneNumber, value) : null);
              setFeedback(null);
            }}
            disabled={isSubmitting}
          />
          <input
            ref={phoneRef}
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Phone number"
            pattern="[0-9]*"
            maxLength={15}
            value={phoneNumber}
            onChange={(event) => {
              const next = event.target.value;
              if (!/^[0-9]*$/.test(next)) {
                setPhoneError("Use digits only for the phone number.");
                return;
              }
              setPhoneNumber(next);
              setPhoneError(phoneTouched ? validatePhone(next) : null);
            }}
            onPaste={onPhonePaste}
            onBlur={() => {
              setPhoneTouched(true);
              setPhoneError(validatePhone(phoneNumber));
            }}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={`contact-phone-hint${phoneError ? " contact-phone-error" : ""}`}
            disabled={isSubmitting}
          />
        </div>
        <p id="contact-phone-hint" className={styles.fieldHint}>
          Enter the number for the selected country code.
        </p>
        {phoneError && (
          <p id="contact-phone-error" className={`${styles.formNote} ${styles.formError}`} role="alert">
            {phoneError}
          </p>
        )}
      </div>
      <label className={styles.field} htmlFor="contact-subject">
        <span>Subject (optional)</span>
        <input id="contact-subject" name="subject" maxLength={200} disabled={isSubmitting} />
      </label>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" maxLength={200} disabled={isSubmitting} />
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
