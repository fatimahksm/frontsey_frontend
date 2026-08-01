"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import type { PublicMenuItem } from "@/lib/api/types";
import type { CartLine } from "@/lib/site/cart";
import { formatMoney } from "@/lib/format";
import { themeCardStyle } from "@/lib/website/theme-config";

interface Props {
  item: PublicMenuItem;
  currency: string;
  orderingEnabled: boolean;
  onAddToCart(line: CartLine): void;
  onFirstView(itemId: string): void;
  /** "card" (default) is the bordered/shadowed presentation used by Classic and Grid. "elegant" is a plain list row with a dotted price leader, used by the Elegant layout - same interactive logic either way. */
  variant?: "card" | "elegant";
}

export function PublicMenuItemCard({ item, currency, orderingEnabled, onAddToCart, onFirstView, variant = "card" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sizeId, setSizeId] = useState<string>(item.sizes[0]?.id ?? "");
  const [boxVariantId, setBoxVariantId] = useState<string>(item.boxVariants[0]?.id ?? "");
  const [addonIds, setAddonIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  const isUnavailable = item.availability === "UNAVAILABLE";

  function handleExpand() {
    setExpanded((v) => !v);
    if (!hasBeenViewed) {
      onFirstView(item.id);
      setHasBeenViewed(true);
    }
  }

  function toggleAddon(groupId: string, addonId: string, maxSelections: number | null) {
    setAddonIds((prev) => {
      const groupSelected = item.addonGroups
        .find((g) => g.id === groupId)
        ?.options.map((o) => o.id)
        .filter((id) => prev.has(id)) ?? [];

      const next = new Set(prev);
      if (next.has(addonId)) {
        next.delete(addonId);
        return next;
      }
      if (maxSelections != null && groupSelected.length >= maxSelections) {
        // Selection limit reached - replace the first previously-selected option in this group.
        next.delete(groupSelected[0]);
      }
      next.add(addonId);
      return next;
    });
  }

  function selectedAddons() {
    return item.addonGroups
      .flatMap((g) => g.options)
      .filter((option) => addonIds.has(option.id))
      .map((option) => ({ name: option.name, extraPrice: option.extraPrice }));
  }

  function basePrice(): number {
    if (item.fixedBoxItem) {
      return item.boxVariants.find((v) => v.id === boxVariantId)?.price ?? item.price;
    }
    const size = item.sizes.find((s) => s.id === sizeId);
    return size ? size.price : item.discountPrice ?? item.price;
  }

  function variantLabel(): string | null {
    if (item.fixedBoxItem) {
      return item.boxVariants.find((v) => v.id === boxVariantId)?.label ?? null;
    }
    return item.sizes.find((s) => s.id === sizeId)?.label ?? null;
  }

  function handleAddToCart() {
    if (item.fixedBoxItem && item.boxVariants.length > 0 && !boxVariantId) return;
    onAddToCart({
      key: `${item.id}:${sizeId}:${boxVariantId}:${[...addonIds].sort().join(",")}`,
      itemId: item.id,
      itemName: item.name,
      variantLabel: variantLabel(),
      unitPrice: basePrice(),
      addons: selectedAddons(),
      quantity,
    });
    setQuantity(1);
  }

  const maxQuantity = item.maxOrderQuantity ?? 20;

  const containerClassName =
    variant === "elegant"
      ? `border-b border-black/[.06] py-4 dark:border-white/[.1] ${isUnavailable ? "opacity-60" : ""}`
      : `p-4 transition-shadow duration-300 ${isUnavailable ? "opacity-60" : ""}`;

  return (
    <motion.div
      layout
      whileHover={isUnavailable || variant === "elegant" ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className={containerClassName}
      style={variant === "elegant" ? undefined : themeCardStyle()}
    >
      {variant === "elegant" ? (
        <button type="button" onClick={handleExpand} className="flex w-full items-baseline gap-3 text-left">
          <span className="font-medium">{item.name}</span>
          <span className="h-px flex-1 border-b border-dotted border-black/[.2] dark:border-white/[.25]" aria-hidden />
          <span className="shrink-0 font-medium">
            {formatMoney(item.discountPrice ?? item.price, currency)}
            {item.discountPrice != null && (
              <span className="ml-2 text-zinc-400 line-through">{formatMoney(item.price, currency)}</span>
            )}
          </span>
        </button>
      ) : (
        <button type="button" onClick={handleExpand} className="flex w-full items-start justify-between gap-4 text-left">
          <div>
            <p className="font-medium">{item.name}</p>
            {item.description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>}
            <p className="mt-1 text-sm font-medium">
              {formatMoney(item.discountPrice ?? item.price, currency)}
              {item.discountPrice != null && (
                <span className="ml-2 text-zinc-400 line-through">{formatMoney(item.price, currency)}</span>
              )}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.imageUrl && <img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
        </button>
      )}
      {variant === "elegant" && item.description && (
        <p className="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400">{item.description}</p>
      )}

      {isUnavailable && <p className="mt-2 text-xs font-medium text-amber-600">Currently unavailable</p>}

      <AnimatePresence initial={false}>
      {expanded && !isUnavailable && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
        <div className="mt-3 flex flex-col gap-3 border-t border-black/[.06] pt-3 dark:border-white/[.1]">
          {item.ingredients && <p className="text-xs text-zinc-500">{item.ingredients}</p>}

          {item.fixedBoxItem && item.boxVariants.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {item.boxVariants.map((variant) => (
                <label key={variant.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`box-${item.id}`}
                    checked={boxVariantId === variant.id}
                    onChange={() => setBoxVariantId(variant.id)}
                  />
                  {variant.label} ({variant.unitCount} units) - {formatMoney(variant.price, currency)}
                </label>
              ))}
            </div>
          )}

          {!item.fixedBoxItem && item.sizes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {item.sizes.map((size) => (
                <label key={size.id} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={`size-${item.id}`} checked={sizeId === size.id} onChange={() => setSizeId(size.id)} />
                  {size.label} - {formatMoney(size.price, currency)}
                </label>
              ))}
            </div>
          )}

          {!item.fixedBoxItem &&
            item.addonGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-zinc-500">
                  {group.name}
                  {group.maxSelections != null && ` (up to ${group.maxSelections})`}
                </p>
                {group.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={addonIds.has(option.id)}
                      onChange={() => toggleAddon(group.id, option.id, group.maxSelections)}
                    />
                    {option.name} (+{formatMoney(option.extraPrice, currency)})
                  </label>
                ))}
              </div>
            ))}

          {orderingEnabled && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))}
                className="h-9 w-16 rounded-lg border border-black/[.12] bg-transparent px-2 text-sm outline-none dark:border-white/[.18]"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={item.fixedBoxItem && item.boxVariants.length > 0 && !boxVariantId}
                style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                className="h-9 bg-foreground px-4 text-sm font-medium text-background disabled:opacity-40"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
