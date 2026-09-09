import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Layout classes for the wrapper - `flex-1`, a width, a span. See below. */
  wrapperClassName?: string;
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
export function TextField({ label, id, className = "", wrapperClassName = "", ...props }: TextFieldProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 text-sm ${wrapperClassName}`}>
      <span className="font-medium text-foreground">{label}</span>
      <input
        id={id}
        className={`h-11 rounded-xl border border-black/[.12] bg-surface px-3.5 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16] ${className}`}
        {...props}
      />
    </label>
  );
}
