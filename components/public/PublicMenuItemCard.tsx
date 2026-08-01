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

/** Selectable pill used for size/box-variant (single-select) and addon (multi-select) options - replaces raw radio/checkbox rows with a tap-friendly, visually clearer control. */
function OptionPill({ selected, onClick, children }: { selected: boolean; onClick(): void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
      className={`border px-3 py-1.5 text-left text-xs font-medium transition-colors ${
        selected
          ? "border-transparent bg-[var(--accent-solid)] text-white"
          : "border-black/[.12] text-zinc-600 hover:border-[var(--accent-solid)]/50 dark:border-white/[.18] dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
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
      : `overflow-hidden transition-shadow duration-300 ${isUnavailable ? "opacity-60" : ""}`;

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
        <>
          {item.imageUrl && (
            <div className="aspect-[4/3] w-full overflow-hidden bg-black/[.04] dark:bg-white/[.06]">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL */}
              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <button type="button" onClick={handleExpand} className="flex w-full items-start justify-between gap-4 p-4 text-left">
            <div className="min-w-0">
              <p className="font-medium">{item.name}</p>
              {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>}
              <p className="mt-1.5 text-sm font-semibold">
                {formatMoney(item.discountPrice ?? item.price, currency)}
                {item.discountPrice != null && (
                  <span className="ml-2 text-xs font-normal text-zinc-400 line-through">{formatMoney(item.price, currency)}</span>
                )}
              </p>
            </div>
          </button>
        </>
      )}
      {variant === "elegant" && item.description && (
        <p className="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400">{item.description}</p>
      )}

      {isUnavailable && <p className={`text-xs font-medium text-amber-600 ${variant === "elegant" ? "mt-2" : "px-4 pb-3"}`}>Currently unavailable</p>}

      <AnimatePresence initial={false}>
      {expanded && !isUnavailable && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
        <div className={`flex flex-col gap-3 border-t border-black/[.06] pt-3 dark:border-white/[.1] ${variant === "elegant" ? "mt-3" : "mx-4 mb-4"}`}>
          {item.ingredients && <p className="text-xs text-zinc-500">{item.ingredients}</p>}

          {item.fixedBoxItem && item.boxVariants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.boxVariants.map((v) => (
                <OptionPill key={v.id} selected={boxVariantId === v.id} onClick={() => setBoxVariantId(v.id)}>
                  {v.label} ({v.unitCount}) · {formatMoney(v.price, currency)}
                </OptionPill>
              ))}
            </div>
          )}

          {!item.fixedBoxItem && item.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <OptionPill key={size.id} selected={sizeId === size.id} onClick={() => setSizeId(size.id)}>
                  {size.label} · {formatMoney(size.price, currency)}
                </OptionPill>
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
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <OptionPill
                      key={option.id}
                      selected={addonIds.has(option.id)}
                      onClick={() => toggleAddon(group.id, option.id, group.maxSelections)}
                    >
                      {option.name} (+{formatMoney(option.extraPrice, currency)})
                    </OptionPill>
                  ))}
                </div>
              </div>
            ))}

          {orderingEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center rounded-full border border-black/[.12] dark:border-white/[.18]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-9 items-center justify-center text-sm text-zinc-500 hover:text-foreground"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  className="flex h-full w-9 items-center justify-center text-sm text-zinc-500 hover:text-foreground"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={item.fixedBoxItem && item.boxVariants.length > 0 && !boxVariantId}
                style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              >
                <span aria-hidden>+</span>
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
