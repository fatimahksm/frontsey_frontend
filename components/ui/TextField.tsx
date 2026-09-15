import type { InputHTMLAttributes } from "react";

import { FIELD_BASE, FIELD_LABEL } from "@/components/ui/field-styles";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Layout classes for the wrapper - `flex-1`, a width, a grid span. See below. */
  wrapperClassName?: string;
  /** A line under the field explaining what belongs in it. */
  hint?: string;
}

/**
 * `className` styles the input, which is what almost every caller wants and
 * what none of them can tell from the outside. A caller that needs the field
 * to take part in its parent's layout - to grow inside a flex row, say - has
 * to reach the wrapper instead, hence wrapperClassName: passing `flex-1` as
 * `className` silently styled the input inside a label that did not grow, and
 * the button beside it was pushed off a 320px screen.
 *
 * min-w-0 is unconditional. A text field should never be the reason its
 * container cannot fit the screen, and a flex or grid child keeps its
 * content's width unless it is told it may shrink.
 */
export function TextField({
  label,
  id,
  hint,
  className = "",
  wrapperClassName = "",
  ...props
}: TextFieldProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 ${wrapperClassName}`}>
      {label && <span className={FIELD_LABEL}>{label}</span>}
      <input id={id} className={`${FIELD_BASE} ${className}`} {...props} />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
