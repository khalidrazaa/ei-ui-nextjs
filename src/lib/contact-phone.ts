import { parsePhoneNumberFromString } from "libphonenumber-js/max";

const PHONE_ERROR = "Enter a valid phone number for the selected country code.";
const DIGITS_ERROR = "Use digits only for the phone number.";

export function normalizeContactPhone(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.length > 40 || !/^[+0-9 ()-]*$/.test(value)) {
    throw new Error(PHONE_ERROR);
  }
  const raw = value.trim();
  if (!raw) return null;
  if (!raw.startsWith("+")) throw new Error(PHONE_ERROR);

  const phone = raw.replace(/[ ()-]/g, "");
  if (!/^\+[1-9][0-9]{1,14}$/.test(phone)) throw new Error(PHONE_ERROR);
  try {
    const parsed = parsePhoneNumberFromString(phone, { extract: false });
    if (!parsed?.isValid()) throw new Error(PHONE_ERROR);
    return parsed.number;
  } catch {
    throw new Error(PHONE_ERROR);
  }
}

export function combineContactPhone(countryCode: string, number: string): string | null {
  const raw = number.trim();
  if (!raw) return normalizeContactPhone(number);
  const code = countryCode.trim();
  if (!/^\+[1-9][0-9]{0,2}$/.test(code)) {
    throw new Error("Enter a valid country code, such as +91.");
  }
  const callingCode = code.slice(1);
  if (raw.startsWith("+")) {
    const international = normalizeContactPhone(number);
    const parsed = international ? parsePhoneNumberFromString(international, { extract: false }) : undefined;
    if (parsed?.countryCallingCode !== callingCode) throw new Error(PHONE_ERROR);
    return parsed.number;
  }
  if (!/^[0-9]+$/.test(number) || number.length > 15) throw new Error(DIGITS_ERROR);
  try {
    const parsed = parsePhoneNumberFromString(number, { defaultCallingCode: callingCode, extract: false });
    if (!parsed?.isValid() || parsed.countryCallingCode !== callingCode || parsed.number.length > 16) {
      throw new Error(PHONE_ERROR);
    }
    return parsed.number;
  } catch {
    throw new Error(PHONE_ERROR);
  }
}

// Formatted pastes become digits; arbitrary text is never converted into a number.
export function contactPhoneInputDigits(countryCode: string, value: string): string {
  if (value.length > 40 || !/^[+0-9 ()-]*$/.test(value)) throw new Error(DIGITS_ERROR);
  const digits = value.replace(/[ ()-]/g, "");
  if (digits.startsWith("+")) {
    const international = combineContactPhone(countryCode, value);
    const parsed = international ? parsePhoneNumberFromString(international, { extract: false }) : undefined;
    if (!parsed) throw new Error(PHONE_ERROR);
    return parsed.nationalNumber;
  }
  if (!/^[0-9]*$/.test(digits) || digits.length > 15 || (value.trim() && !digits)) {
    throw new Error(DIGITS_ERROR);
  }
  return digits;
}
