import "server-only";

import { siteConfig } from "@/config/site";
import { normalizeContactAttribution, normalizeOptionalContactText } from "@/lib/contact-attribution";
import { combineContactPhone, normalizeContactPhone } from "@/lib/contact-phone";
import { ApiError, fetchPublicApi } from "@/lib/public-api";

export const MAX_CONTACT_BODY_BYTES = 24_000;
export const CONTACT_SEND_ERROR = "Unable to send your message. Please try again or email core@explainit.tech.";

export async function sendContactMessage(payload: unknown): Promise<{ status: true; message: string }> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new ApiError("Invalid form data.", 400);
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(payload);
  } catch {
    throw new ApiError("Invalid form data.", 400);
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_CONTACT_BODY_BYTES) {
    throw new ApiError("Your message is too large.", 413);
  }

  const fields = payload as Record<string, unknown>;
  if (typeof fields.name !== "string" || typeof fields.email !== "string" || typeof fields.message !== "string") {
    throw new ApiError("Name, email and message are required.", 422);
  }

  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  let metadata: Record<string, string>;
  try {
    const subject = normalizeOptionalContactText(fields.subject, 200);
    if (fields.website !== undefined && fields.website !== null && fields.website !== "") {
      throw new Error("Invalid form data");
    }
    metadata = { ...normalizeContactAttribution(fields), ...(subject ? { subject } : {}) };
  } catch {
    throw new ApiError("Please check your form details.", 422);
  }

  let phone: string | null;
  try {
    if (fields.country_code !== undefined && typeof fields.country_code !== "string") {
      throw new Error("Invalid country code");
    }
    phone = typeof fields.country_code === "string" && typeof fields.phone === "string"
      ? combineContactPhone(fields.country_code, fields.phone)
      : normalizeContactPhone(fields.phone);
  } catch {
    throw new ApiError("Enter a valid phone number for the selected country code.", 422);
  }

  if (
    !name || name.length > 80 || /[\r\n\u0000]/.test(name) ||
    email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message || message.length > 5000 || message.includes("\u0000")
  ) {
    throw new ApiError("Please check your name, email and message.", 422);
  }

  try {
    const result = await fetchPublicApi<{ status?: boolean }>(
      `/public/contact?host_site=${encodeURIComponent(siteConfig.hostSite)}`,
      {
        method: "POST",
        body: JSON.stringify({ name, email, message, ...(phone ? { phone } : {}), ...metadata }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }
    );
    if (result?.status !== true) {
      throw new ApiError(CONTACT_SEND_ERROR, 502);
    }
    return { status: true, message: "Your message has been submitted." };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        throw new ApiError("Too many messages. Please wait a little before trying again.", 429);
      }
      if (error.status === 400 || error.status === 422) {
        throw new ApiError("Please check your name, email and message.", 422);
      }
      const status = error.status === 504 ? 504 : [401, 403, 500, 503].includes(error.status) ? 503 : 502;
      throw new ApiError(CONTACT_SEND_ERROR, status);
    }
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new ApiError(CONTACT_SEND_ERROR, timedOut ? 504 : 502);
  }
}
