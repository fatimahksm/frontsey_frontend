import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/85 disabled:bg-foreground/40",
  secondary:
    "border border-black/[.12] dark:border-white/[.18] hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
