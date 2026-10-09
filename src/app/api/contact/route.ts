import { NextRequest, NextResponse } from "next/server";

import { CONTACT_SEND_ERROR, MAX_CONTACT_BODY_BYTES, sendContactMessage } from "@/lib/contact";
import { ApiError } from "@/lib/public-api";

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
      if (size > MAX_CONTACT_BODY_BYTES) {
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

  try {
    return NextResponse.json(await sendContactMessage(payload));
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: CONTACT_SEND_ERROR }, { status: 502 });
  }
}
