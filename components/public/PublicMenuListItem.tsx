"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import type { PublicMenuItem } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { themeCardStyle } from "@/lib/website/theme-config";

/**
 * A read-only menu entry: what the item is and what it costs. Used by
 * display-only layouts, where there is no cart, so - unlike
 * PublicMenuItemCard - it has no quantity stepper, no Add to cart, and
 * nothing to expand. Priced sizes/box variants and paid add-ons are part of
 * the price list itself, so they are shown outright rather than hidden behind
 * a "choose options" step.
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

  // Nothing here expands, so the item counts as viewed once it is rendered -
  // the same point at which an always-expanded card reports itself.
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

  return (
    <motion.div
      layout
      whileHover={isUnavailable ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className={`overflow-hidden transition-shadow duration-300 ${isUnavailable ? "opacity-60" : ""}`}
      style={themeCardStyle()}
    >
      {item.imageUrl && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-black/[.04] dark:bg-white/[.06]">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL */}
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-medium">{item.name}</p>
          {/* With priced variants the per-variant list below is the real price, so no single headline price is shown. */}
          {variants.length === 0 && (
            <p className="shrink-0 text-sm font-semibold">
              {formatMoney(item.discountPrice ?? item.price, currency)}
              {item.discountPrice != null && (
                <span className="ml-2 text-xs font-normal text-zinc-400 line-through">
                  {formatMoney(item.price, currency)}
                </span>
              )}
            </p>
          )}
        </div>

        {item.description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>}
        {item.ingredients && <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.ingredients}</p>}

        {variants.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1">
            {variants.map((variant) => (
              <li key={variant.id} className="flex items-baseline gap-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">{variant.label}</span>
                <span className="h-px flex-1 border-b border-dotted border-black/[.2] dark:border-white/[.25]" aria-hidden />
                <span className="shrink-0 font-medium">{formatMoney(variant.price, currency)}</span>
              </li>
            ))}
          </ul>
        )}

        {addons.length > 0 && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {addons
              .map((addon) => `${addon.name} +${formatMoney(addon.extraPrice, currency)}`)
              .join(" · ")}
          </p>
        )}

        {isUnavailable && <p className="mt-1 text-xs font-medium text-amber-600">{t.item.currentlyUnavailable}</p>}
      </div>
    </motion.div>
  );
}
