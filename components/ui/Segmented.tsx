"use client";

import { motion } from "framer-motion";

/**
 * One control for "which of these am I looking at" - a date range, active
 * versus trash, a view switch.
 *
 * There were three of these, invented separately: a black pill, a gradient
 * pill, and a row of underlined links. They sat on different pages of the same
 * console doing the same job, which is the kind of thing nobody can name but
 * everybody reads as unfinished.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange(next: T): void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`no-scrollbar inline-flex max-w-full shrink-0 items-center gap-0.5 overflow-x-auto rounded-control bg-surface-muted p-0.5 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`focus-ring relative rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
 isActive ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`segmented-${ariaLabel}`}
                className="absolute inset-0 rounded-[7px] bg-surface shadow-soft"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
