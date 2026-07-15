import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function Select({ label, id, className = "", children, ...props }: SelectProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select
        id={id}
        className={`h-11 rounded-lg border border-black/[.12] bg-transparent px-3.5 text-sm outline-none transition-colors focus:border-foreground dark:border-white/[.18] ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
