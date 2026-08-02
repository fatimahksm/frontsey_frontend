"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import type { PublicDeliveryArea } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { cartSubtotal, lineTotal, type CartLine } from "@/lib/site/cart";
import { formatMoney } from "@/lib/format";
import type { Customer } from "@/lib/site/whatsapp";

interface Props {
  lines: CartLine[];
  currency: string;
  deliveryAreas: PublicDeliveryArea[];
  onRemove(key: string): void;
  onCheckout(customer: Customer, deliveryArea: PublicDeliveryArea | null, deliveryFee: number): void;
}

export function CartPanel({ lines, currency, deliveryAreas, onRemove, onCheckout }: Props) {
  const { t } = useLocale();
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const deliveryArea = deliveryAreas.find((a) => a.id === deliveryAreaId) ?? null;
  const deliveryFee = deliveryArea
    ? deliveryArea.freeThreshold != null && subtotal >= deliveryArea.freeThreshold
      ? 0
      : deliveryArea.fee
    : 0;

  function handleCheckout() {
    setError(null);
    if (lines.length === 0) {
      setError(t.cart.cartIsEmpty);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError(t.cart.pleaseEnterNamePhone);
      return;
    }
    if (deliveryArea && subtotal < deliveryArea.minimumOrder) {
      setError(t.cart.minimumOrderFor(deliveryArea.name, formatMoney(deliveryArea.minimumOrder, currency)));
      return;
    }
    onCheckout({ name: name.trim(), phone: phone.trim(), address: address.trim() }, deliveryArea, deliveryFee);
  }

  if (lines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/[.12] p-8 text-center dark:border-white/[.18]"
      >
        <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-solid)]/10 text-2xl">
          🛒
        </span>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.cart.cartIsEmptyBody}</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="flex flex-col gap-5 rounded-2xl border border-black/[.08] bg-surface p-5 shadow-lift dark:border-white/[.145]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">{t.cart.yourOrder}</h3>
        <span className="rounded-full bg-[var(--accent-solid)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent-solid)]">
          {itemCount} {itemCount === 1 ? t.cart.itemSingular : t.cart.itemsPlural}
        </span>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.li
              key={line.key}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-3 rounded-xl bg-black/[.02] p-3 dark:bg-white/[.04]">
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-solid)] text-xs font-semibold text-white"
                >
                  {line.quantity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {line.itemName}
                    {line.variantLabel && <span className="font-normal text-zinc-500"> ({line.variantLabel})</span>}
                  </p>
                  {line.addons.length > 0 && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">+ {line.addons.map((a) => a.name).join(", ")}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-medium">{formatMoney(lineTotal(line), currency)}</span>
                  <button
                    type="button"
                    aria-label={t.cart.removeAria(line.itemName)}
                    className="text-xs text-zinc-400 hover:text-red-600"
                    onClick={() => onRemove(line.key)}
                  >
                    {t.cart.remove}
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {deliveryAreas.length > 0 && (
        <Select id="deliveryArea" label={t.cart.deliveryArea} value={deliveryAreaId} onChange={(e) => setDeliveryAreaId(e.target.value)}>
          <option value="">{t.cart.pickupNotSelected}</option>
          {deliveryAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name} - {formatMoney(area.fee, currency)}
            </option>
          ))}
        </Select>
      )}

      <div className="flex flex-col gap-1.5 rounded-xl bg-[var(--accent-solid)]/5 p-3.5 text-sm">
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>{t.cart.subtotal}</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        {deliveryArea && (
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>{t.cart.delivery}</span>
            <span>{formatMoney(deliveryFee, currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--accent-solid)]/15 pt-1.5 text-base font-semibold">
          <span>{t.cart.total}</span>
          <span>{formatMoney(subtotal + deliveryFee, currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/[.06] pt-4 dark:border-white/[.1]">
        <TextField id="customerName" label={t.cart.yourName} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        <TextField id="customerPhone" label={t.cart.phoneNumber} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 70 123 456" />
        <TextField
          id="customerAddress"
          label={t.cart.deliveryAddressOptional}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t.cart.streetBuildingFloor}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleCheckout}
          style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
          className="flex h-12 items-center justify-center gap-2 bg-emerald-600 text-sm font-semibold text-white shadow-soft hover:bg-emerald-700 hover:shadow-lift"
        >
          <span aria-hidden>💬</span>
          {t.cart.orderViaWhatsApp}
        </motion.button>
      </div>
    </motion.div>
  );
}
