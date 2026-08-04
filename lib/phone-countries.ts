export interface PhoneCountry {
  name: string;
  iso: string;
  dialCode: string;
}

/** A practical subset (not exhaustive ISO 3166), Lebanon first since it's this platform's primary market. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: "Lebanon", iso: "LB", dialCode: "961" },
  { name: "United Arab Emirates", iso: "AE", dialCode: "971" },
  { name: "Saudi Arabia", iso: "SA", dialCode: "966" },
  { name: "Qatar", iso: "QA", dialCode: "974" },
  { name: "Kuwait", iso: "KW", dialCode: "965" },
  { name: "Bahrain", iso: "BH", dialCode: "973" },
  { name: "Oman", iso: "OM", dialCode: "968" },
  { name: "Jordan", iso: "JO", dialCode: "962" },
  { name: "Egypt", iso: "EG", dialCode: "20" },
  { name: "Iraq", iso: "IQ", dialCode: "964" },
  { name: "Syria", iso: "SY", dialCode: "963" },
  { name: "Turkey", iso: "TR", dialCode: "90" },
  { name: "United States", iso: "US", dialCode: "1" },
  { name: "Canada", iso: "CA", dialCode: "1" },
  { name: "United Kingdom", iso: "GB", dialCode: "44" },
  { name: "France", iso: "FR", dialCode: "33" },
  { name: "Germany", iso: "DE", dialCode: "49" },
  { name: "Cyprus", iso: "CY", dialCode: "357" },
  { name: "Greece", iso: "GR", dialCode: "30" },
  { name: "Italy", iso: "IT", dialCode: "39" },
  { name: "Spain", iso: "ES", dialCode: "34" },
  { name: "India", iso: "IN", dialCode: "91" },
  { name: "Pakistan", iso: "PK", dialCode: "92" },
  { name: "Australia", iso: "AU", dialCode: "61" },
];

export const DEFAULT_DIAL_CODE = PHONE_COUNTRIES[0].dialCode;

/** Splits a stored "+<dialCode><number>" string into its parts, defaulting to Lebanon for anything unrecognized (including plain local numbers with no "+"). */
export function splitPhoneValue(value: string): { dialCode: string; localNumber: string } {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) {
    return { dialCode: DEFAULT_DIAL_CODE, localNumber: trimmed };
  }
  const digits = trimmed.slice(1);
  const match = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => digits.startsWith(c.dialCode));
  if (!match) {
    return { dialCode: DEFAULT_DIAL_CODE, localNumber: digits };
  }
  return { dialCode: match.dialCode, localNumber: digits.slice(match.dialCode.length) };
}

export function joinPhoneValue(dialCode: string, localNumber: string): string {
  const digitsOnly = localNumber.replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return `+${dialCode}${digitsOnly}`;
}
