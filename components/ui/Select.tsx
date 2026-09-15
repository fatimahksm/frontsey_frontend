import type { SelectHTMLAttributes } from "react";

import { FIELD_BASE, FIELD_LABEL } from "@/components/ui/field-styles";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Empty renders no label, for a select that sits inside a labelled toolbar. */
  label: string;
  /** Layout classes for the wrapper - a width, `flex-1`, a grid span. */
  wrapperClassName?: string;
}

/**
 * Matches TextField exactly, down to the chevron - which is drawn rather than
 * left to the platform, because the native one is a different shape, colour
 * and inset on every operating system and made a filter row look assembled
 * from parts.
 */
export function Select({ label, id, className = "", wrapperClassName = "", children, ...props }: SelectProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 ${wrapperClassName}`}>
      {label && <span className={FIELD_LABEL}>{label}</span>}
      <select id={id} className={`${FIELD_BASE} select-chevron ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}
