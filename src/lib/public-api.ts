import "server-only";

import { connection } from "next/server";

function getApiConfig() {
  return {
    base: (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      ""
    ).trim().replace(/\/$/, ""),
    key: (process.env.PUBLIC_APP_KEY || "").trim(),
  };
}

type ApiFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export class ApiError extends Error {
  status: number;
  info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

export function isPublicApiConfigured(): boolean {
  const { base, key } = getApiConfig();
  return Boolean(base && key);
}

function joinEndpoint(endpoint: string): string {
  if (!endpoint.startsWith("/")) {
    return `/${endpoint}`;
  }
  return endpoint;
}

export async function fetchPublicApi<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  // Runtime configuration is required only when a request arrives, never during builds.
  await connection();
  const { base: API_BASE, key: PUBLIC_APP_KEY } = getApiConfig();

  if (!API_BASE) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL) or API_URL is missing.",
      500
    );
  }

  if (!PUBLIC_APP_KEY) {
    throw new ApiError("PUBLIC_APP_KEY is missing.", 500);
  }

  const res = await fetch(`${API_BASE}${joinEndpoint(endpoint)}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Public-App-Key": PUBLIC_APP_KEY,
      ...(options.headers || {}),
    },
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as Record<string, unknown>).detail === "string"
        ? ((data as Record<string, unknown>).detail as string)
        : res.statusText || "Request failed";

    throw new ApiError(detail, res.status, data);
  }

  return data as T;
}

