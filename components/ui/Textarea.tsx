import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, className = "", ...props }: TextareaProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <textarea
        id={id}
        className={`min-h-24 rounded-lg border border-black/[.12] bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground dark:border-white/[.18] ${className}`}
        {...props}
      />
    </label>
  );
}
