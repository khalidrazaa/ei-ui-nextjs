const ATTRIBUTION_STORAGE_KEY = "explainit.contact-attribution";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type ContactAttribution = Partial<Record<"landing_page" | "referrer" | typeof UTM_FIELDS[number], string>>;

export function normalizeOptionalContactText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("Invalid contact metadata");
  }
  return value.trim() || undefined;
}

function normalizeAttributionUrl(value: unknown): string | undefined {
  const text = normalizeOptionalContactText(value, 2048);
  if (!text) return undefined;
  if (text.includes("\\") || /[\s\u0085]/.test(text)) {
    throw new Error("Invalid contact source URL");
  }
  const url = new URL(text);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Invalid contact source URL");
  }
  url.search = "";
  url.hash = "";
  const sanitized = url.toString();
  if (sanitized.length > 2048) throw new Error("Contact source URL is too long");
  return sanitized;
}

export function normalizeContactAttribution(fields: Record<string, unknown>): ContactAttribution {
  const attribution: ContactAttribution = {};
  for (const field of ["landing_page", "referrer"] as const) {
    const value = normalizeAttributionUrl(fields[field]);
    if (value) attribution[field] = value;
  }
  for (const field of UTM_FIELDS) {
    const value = normalizeOptionalContactText(fields[field], 200);
    if (value) attribution[field] = value;
  }
  return attribution;
}

let capturedAttribution: ContactAttribution | undefined;

export function getContactAttribution(): ContactAttribution {
  if (typeof window === "undefined") return {};
  if (capturedAttribution) return capturedAttribution;

  try {
    const saved = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (saved && saved.length <= 10_000) {
      const parsed: unknown = JSON.parse(saved);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        capturedAttribution = normalizeContactAttribution(parsed as Record<string, unknown>);
        return capturedAttribution;
      }
    }
  } catch {
    // Storage may be unavailable or contain stale data; capture the current visit.
  }

  const current = new URL(window.location.href);
  const attribution: ContactAttribution = {};
  for (const [field, value] of [
    ["landing_page", `${current.origin}${current.pathname}`],
    ["referrer", document.referrer],
  ] as const) {
    try {
      const sanitized = normalizeAttributionUrl(value);
      if (sanitized) attribution[field] = sanitized;
    } catch {
      // Unusable source URLs must not prevent a visitor from making an enquiry.
    }
  }
  for (const field of UTM_FIELDS) {
    try {
      const value = normalizeOptionalContactText(current.searchParams.get(field), 200);
      if (value) attribution[field] = value;
    } catch {
      // Ignore malformed campaign parameters from an incoming link.
    }
  }

  capturedAttribution = attribution;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Keep the first source in memory when browser storage is disabled.
  }
  return attribution;
}
