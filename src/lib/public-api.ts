import "server-only";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_URL ||
  ""
).replace(/\/$/, "");
const PUBLIC_APP_KEY = (process.env.PUBLIC_APP_KEY || "").trim();

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
  return Boolean(API_BASE && PUBLIC_APP_KEY);
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

