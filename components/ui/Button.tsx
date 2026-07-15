"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

// framer-motion's drag/animation event handlers have incompatible signatures
// with React's native ones of the same name - omit them since this button
// never uses drag gestures anyway.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: Variant;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-gradient-accent text-white shadow-soft hover:shadow-lift disabled:opacity-40 disabled:shadow-none",
  secondary:
    "border border-black/[.12] bg-surface hover:bg-black/[.03] dark:border-white/[.16] dark:hover:bg-white/[.06] disabled:opacity-50",
  ghost: "text-foreground hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.015 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      disabled={isDisabled}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,box-shadow,opacity] duration-200 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {isLoading ? "Please wait…" : children}
    </motion.button>
  );
}
