"use client";

import { useState } from "react";

import { DEFAULT_DIAL_CODE, PHONE_COUNTRIES, joinPhoneValue, splitPhoneValue } from "@/lib/phone-countries";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange(value: string): void;
}

/** A dial-code dropdown + local-number input, composed into a single "+<dialCode><number>" string. */
export function PhoneField({ id, label, value, onChange }: Props) {
  const initial = splitPhoneValue(value);
  const [dialCode, setDialCode] = useState(initial.dialCode || DEFAULT_DIAL_CODE);
  const [localNumber, setLocalNumber] = useState(initial.localNumber);

  function update(nextDialCode: string, nextLocalNumber: string) {
    setDialCode(nextDialCode);
    setLocalNumber(nextLocalNumber);
    onChange(joinPhoneValue(nextDialCode, nextLocalNumber));
  }

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex gap-2">
        <select
          aria-label={`${label} country code`}
          value={dialCode}
          onChange={(e) => update(e.target.value, localNumber)}
          className="h-11 w-28 shrink-0 rounded-xl border border-black/[.12] bg-surface px-2 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16]"
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={`${country.iso}-${country.dialCode}`} value={country.dialCode}>
              +{country.dialCode} {country.iso}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          value={localNumber}
          onChange={(e) => update(dialCode, e.target.value)}
          placeholder="70 123 456"
          className="h-11 flex-1 rounded-xl border border-black/[.12] bg-surface px-3.5 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16]"
        />
      </div>
    </label>
  );
}
