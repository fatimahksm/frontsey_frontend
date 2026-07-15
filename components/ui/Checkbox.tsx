import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        className={`h-4 w-4 rounded border-black/[.25] accent-[var(--accent-solid)] ${className}`}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
