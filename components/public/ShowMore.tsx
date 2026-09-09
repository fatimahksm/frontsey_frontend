"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

/**
 * The end of a part-rendered list.
 *
 * It says how far through the list you are, not just that there is more:
 * "Showing 30 of 300" is the difference between a visitor pressing it twice
 * and a visitor deciding to search instead, which on a shop with real stock is
 * the better outcome for both of them.
 *
 * Renders nothing when everything already fits, so a caller can mount it
 * unconditionally.
 */
export function ShowMore({
  shown,
  total,
  onShowMore,
  shape = "pill",
}: {
  shown: number;
  total: number;
  onShowMore(): void;
  /** Match the template's own buttons; nothing else about it changes. */
  shape?: "pill" | "square";
}) {
  const { t } = useLocale();
  if (shown >= total) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <p className="text-xs text-[var(--theme-text-muted)]">{t.filter.showingOf(shown, total)}</p>
      <button
        type="button"
        onClick={onShowMore}
        className={`border border-[var(--theme-border)] bg-surface px-6 py-2.5 text-sm font-medium transition-colors hover:border-[var(--accent-solid)] ${
          shape === "pill" ? "rounded-full" : "rounded-lg"
        }`}
      >
        {t.filter.showMore}
      </button>
    </div>
  );
}
