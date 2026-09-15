import type { TextareaHTMLAttributes } from "react";

import { FIELD_BASE, FIELD_LABEL } from "@/components/ui/field-styles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wrapperClassName?: string;
  hint?: string;
}

export function Textarea({ label, id, hint, className = "", wrapperClassName = "", ...props }: TextareaProps) {
  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 ${wrapperClassName}`}>
      {label && <span className={FIELD_LABEL}>{label}</span>}
      {/* The shared field styling minus its fixed height, which a textarea sets for itself. */}
      <textarea
        id={id}
        className={`${FIELD_BASE.replace("h-10 ", "")} min-h-24 py-2.5 leading-relaxed ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
