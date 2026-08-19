"use client";

import { LOCALES } from "@/lib/i18n/translations";
import { useLocale } from "@/lib/i18n/LocaleContext";

/**
 * Fixed-position language pill, present on every public layout regardless
 * of that layout's own header design - some layouts (Elegant, Classic)
 * have no header nav slot to tuck a switcher into, so a consistent
 * floating control avoids reworking 8 different header designs while
 * still being reachable from anywhere on the page.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fixed bottom-4 left-4 z-40 flex gap-0.5 rounded-full border border-black/[.08] bg-surface/95 p-1 text-xs font-medium shadow-lift backdrop-blur dark:border-white/[.145]">
      {LOCALES.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === option.value
              ? "bg-[var(--accent-solid)] text-[var(--accent-contrast)]"
              : "text-[var(--theme-text-muted)] hover:text-foreground"
          }`}
        >
          {option.value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
