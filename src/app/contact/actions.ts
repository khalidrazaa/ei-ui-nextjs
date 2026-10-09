"use server";

import { CONTACT_SEND_ERROR, sendContactMessage } from "@/lib/contact";
import { ApiError } from "@/lib/public-api";

type ContactSubmissionResult =
  | { status: true; message: string }
  | { status: false; detail: string };

export async function submitContactAction(payload: unknown): Promise<ContactSubmissionResult> {
  try {
    return await sendContactMessage(payload);
  } catch (error) {
    return {
      status: false,
      detail: error instanceof ApiError ? error.message : CONTACT_SEND_ERROR,
    };
  }
}
