"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import type { SortOrder } from "@/lib/site/item-query";

/**
 * Sort order and a price range, in one row, for every template that lists
 * priced items.
 *
 * Deliberately unstyled beyond the theme's own variables: it is dropped into a
 * fine-dining menu, a bistro, a shop front and a hardware catalogue, and each
 * of those paints its own background. Anything keyed to black-on-white here
 * would disappear on half of them.
 *
 * The caller decides whether to render it at all - see CONTROLS_THRESHOLD. A
 * short list does not need sorting, and the row costs the screen it takes.
 */
export function ListControls({
  order,
  onOrderChange,
  min,
  max,
  onMinChange,
  onMaxChange,
  currency,
}: {
  order: SortOrder;
  onOrderChange(order: SortOrder): void;
  min: string;
  max: string;
  onMinChange(value: string): void;
  onMaxChange(value: string): void;
  currency: string;
}) {
  const { t } = useLocale();

  const field =
    "h-9 rounded-lg border border-[var(--theme-border)] bg-surface px-2 text-sm text-foreground outline-none focus:border-[var(--accent-solid)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="sr-only">{t.filter.sort}</span>
        <select
          value={order}
          onChange={(event) => onOrderChange(event.target.value as SortOrder)}
          className={`${field} pe-6`}
        >
          <option value="DEFAULT">{t.filter.sortDefault}</option>
          <option value="PRICE_ASC">{t.filter.sortPriceAsc}</option>
          <option value="PRICE_DESC">{t.filter.sortPriceDesc}</option>
        </select>
      </label>

      <div className="flex items-center gap-1.5">
        {/*
          inputMode numeric rather than type="number": the spinner arrows are
          useless for a price and, on a phone, type=number still opens a
          keyboard with no decimal point on some Androids. A bad value parses
          to "no bound" rather than to an empty list.
        */}
        <input
          value={min}
          onChange={(event) => onMinChange(event.target.value)}
          inputMode="decimal"
          placeholder={t.filter.priceFrom}
          aria-label={`${t.filter.priceFrom} (${currency})`}
          className={`${field} w-20`}
        />
        <span aria-hidden className="text-[var(--theme-text-muted)]">–</span>
        <input
          value={max}
          onChange={(event) => onMaxChange(event.target.value)}
          inputMode="decimal"
          placeholder={t.filter.priceTo}
          aria-label={`${t.filter.priceTo} (${currency})`}
          className={`${field} w-20`}
        />
      </div>
    </div>
  );
}
