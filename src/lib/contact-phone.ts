const PHONE_ERROR = "Enter a phone number with its country code and 7–15 digits in total.";

export function normalizeContactPhone(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.length > 40 || !/^[+0-9 ()-]*$/.test(value)) {
    throw new Error(PHONE_ERROR);
  }
  const raw = value.trim();
  if (!raw) return null;
  if (!raw.startsWith("+")) throw new Error(PHONE_ERROR);

  const phone = raw.replace(/[ ()-]/g, "");
  if (!/^\+[1-9][0-9]{6,14}$/.test(phone)) throw new Error(PHONE_ERROR);
  return phone;
}

export function combineContactPhone(countryCode: string, number: string): string | null {
  const raw = number.trim();
  if (!raw) return normalizeContactPhone(number);
  // A pasted international number already contains its country code.
  if (raw.startsWith("+")) return normalizeContactPhone(number);
  const code = countryCode.trim();
  if (!/^\+[1-9][0-9]{0,2}$/.test(code)) throw new Error(PHONE_ERROR);
  return normalizeContactPhone(`${code}${number}`);
}
