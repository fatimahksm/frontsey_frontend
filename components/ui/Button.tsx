"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

// framer-motion's drag/animation event handlers have incompatible signatures
// with React's native ones of the same name - omit them since this button
// never uses drag gestures anyway.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  /** Fills its container. For a form's submit button and the empty state's call to action - not for a toolbar. */
  block?: boolean;
}

/**
 * One button, four jobs, and a default that does not have to be argued with.
 *
 * It used to default to a full-width gradient, so every button on every screen
 * was the loudest thing there unless its caller fought it - which 92 of them
 * did, by hand, with `w-auto`. The result was a filter's Apply button styled
 * exactly like Publish, and a screen with no primary action because everything
 * was one.
 *
 * So: auto width by default, `block` when it genuinely fills a form, and the
 * gradient reserved for `primary` - which should appear once per screen. A
 * screen with two primaries has none.
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-gradient-accent text-white shadow-soft hover:shadow-lift disabled:opacity-40 disabled:shadow-none",
  secondary:
    "border border-line-strong bg-surface text-foreground hover:bg-surface-muted disabled:opacity-50",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground disabled:opacity-50",
  danger: "border border-danger/30 bg-danger-quiet text-danger hover:bg-danger/15 disabled:opacity-50",
};

/** 36px for a toolbar, 40px for a form. Both are comfortably past the 24px touch-target floor. */
const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  block = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <motion.button
      // A press responds; a hover does not grow. Buttons that scale on hover
      // nudge the row around them, which reads as a toy rather than a tool.
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      disabled={isDisabled}
      className={`focus-ring inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-medium transition-[background-color,box-shadow,opacity,color] duration-150 disabled:cursor-not-allowed ${
 block ? "w-full" : ""
      } ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {isLoading ? "Please wait…" : children}
    </motion.button>
  );
}
