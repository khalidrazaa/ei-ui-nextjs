import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import { normalizeContactAttribution, normalizeOptionalContactText } from "@/lib/contact-attribution";
import { combineContactPhone, normalizeContactPhone } from "@/lib/contact-phone";
import { ApiError, fetchPublicApi } from "@/lib/public-api";

const MAX_BODY_BYTES = 24_000;
const SEND_ERROR = "Unable to send your message. Please try again or email core@explainit.tech.";

async function readPayload(request: NextRequest): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Request body is too large");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ detail: "Send the form as JSON." }, { status: 415 });
  }

  let payload: unknown;
  try {
    payload = await readPayload(request);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof RangeError ? "Your message is too large." : "Invalid form data." },
      { status: error instanceof RangeError ? 413 : 400 }
    );
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ detail: "Invalid form data." }, { status: 400 });
  }

  const fields = payload as Record<string, unknown>;
  if (typeof fields.name !== "string" || typeof fields.email !== "string" || typeof fields.message !== "string") {
    return NextResponse.json({ detail: "Name, email and message are required." }, { status: 422 });
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
    return NextResponse.json({ detail: "Please check your form details." }, { status: 422 });
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
    return NextResponse.json(
      { detail: "Enter a valid phone number for the selected country code." },
      { status: 422 }
    );
  }
  if (
    !name || name.length > 80 || /[\r\n\u0000]/.test(name) ||
    email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message || message.length > 5000 || message.includes("\u0000")
  ) {
    return NextResponse.json(
      { detail: "Please check your name, email and message." },
      { status: 422 }
    );
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
      return NextResponse.json({ detail: SEND_ERROR }, { status: 502 });
    }
    return NextResponse.json({ status: true, message: "Your message has been submitted." });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          { detail: "Too many messages. Please wait a little before trying again." },
          { status: 429 }
        );
      }
      if (error.status === 400 || error.status === 422) {
        return NextResponse.json({ detail: "Please check your name, email and message." }, { status: 422 });
      }
      const status = error.status === 504 ? 504 : [401, 403, 500, 503].includes(error.status) ? 503 : 502;
      return NextResponse.json({ detail: SEND_ERROR }, { status });
    }
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json({ detail: SEND_ERROR }, { status: timedOut ? 504 : 502 });
  }
}
