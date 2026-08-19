"use client";

import { SafeImage } from "@/components/public/SafeImage";
import { motion } from "framer-motion";
import { useEffect } from "react";

import type { PublicMenuItem } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";

/**
 * One row of a read-only menu: square thumbnail, name and description, and
 * the price as an accent pill on the right.
 *
 * Used by display-only layouts, where there is no cart - so, unlike
 * PublicMenuItemCard, it has no quantity stepper, no Add to cart, and
 * nothing to expand. Priced sizes/box variants and paid add-ons are part of
 * the price list itself, so they are listed outright rather than hidden
 * behind a "choose options" step.
 *
 * Every colour comes from the website's theme (--theme-*), so the same row
 * reads correctly on a light or a dark palette without branching.
 */
export function PublicMenuListItem({
  item,
  currency,
  onFirstView,
}: {
  item: PublicMenuItem;
  currency: string;
  onFirstView(itemId: string): void;
}) {
  const { t } = useLocale();
  const isUnavailable = item.availability === "UNAVAILABLE";

  // Nothing here expands, so the item counts as viewed once it is rendered.
  useEffect(() => {
    onFirstView(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report once per mounted item
  }, []);

  const variants = item.fixedBoxItem
    ? item.boxVariants.map((variant) => ({
        id: variant.id,
        label: `${variant.label} (${variant.unitCount})`,
        price: variant.price,
      }))
    : item.sizes.map((size) => ({ id: size.id, label: size.label, price: size.price }));
  const addons = item.fixedBoxItem ? [] : item.addonGroups.flatMap((group) => group.options);

  function pricePill(label: string) {
    return (
      <span
        className="inline-block whitespace-nowrap px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)]"
        style={{ background: "var(--accent-solid)", borderRadius: "var(--theme-button-radius, 9999px)" }}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-4 py-5 ${isUnavailable ? "opacity-50" : ""}`}
    >
      {item.imageUrl && (
        <div
          className="h-[88px] w-[88px] shrink-0 overflow-hidden"
          style={{ borderRadius: "var(--theme-radius)", background: "var(--theme-surface)" }}
        >
          <SafeImage src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold leading-tight">{item.name}</p>
        {item.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--theme-text-muted)]">{item.description}</p>
        )}
        {item.ingredients && <p className="mt-1 text-xs text-[var(--theme-text-muted)]">{item.ingredients}</p>}

        {/* Priced variants read as their own mini price list under the item. */}
        {variants.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <li key={variant.id} className="text-sm">
                <span className="text-[var(--theme-text-muted)]">{variant.label}</span>{" "}
                {pricePill(formatMoney(variant.price, currency))}
              </li>
            ))}
          </ul>
        )}

        {addons.length > 0 && (
          <p className="mt-2 text-xs text-[var(--theme-text-muted)]">
            {addons.map((addon) => `${addon.name} +${formatMoney(addon.extraPrice, currency)}`).join(" · ")}
          </p>
        )}

        {isUnavailable && <p className="mt-2 text-xs font-medium text-[color-mix(in_srgb,#f59e0b_55%,var(--foreground))]">{t.item.currentlyUnavailable}</p>}
      </div>

      {/* A single headline price only when there are no per-variant prices to show instead. */}
      {variants.length === 0 && (
        <div className="shrink-0 text-right">
          {pricePill(formatMoney(item.discountPrice ?? item.price, currency))}
          {item.discountPrice != null && (
            <p className="mt-1 text-xs text-[var(--theme-text-muted)] line-through">
              {formatMoney(item.price, currency)}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
