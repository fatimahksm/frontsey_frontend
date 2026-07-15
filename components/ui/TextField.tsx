import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, className = "", ...props }: TextFieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        id={id}
        className={`h-11 rounded-lg border border-black/[.12] bg-transparent px-3.5 text-sm outline-none transition-colors focus:border-foreground dark:border-white/[.18] ${className}`}
        {...props}
      />
    </label>
  );
}
