"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import type { PublicDeliveryArea } from "@/lib/api/types";
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
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const deliveryArea = deliveryAreas.find((a) => a.id === deliveryAreaId) ?? null;
  const deliveryFee = deliveryArea
    ? deliveryArea.freeThreshold != null && subtotal >= deliveryArea.freeThreshold
      ? 0
      : deliveryArea.fee
    : 0;

  function handleCheckout() {
    setError(null);
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (deliveryArea && subtotal < deliveryArea.minimumOrder) {
      setError(`Minimum order for ${deliveryArea.name} is ${formatMoney(deliveryArea.minimumOrder, currency)}.`);
      return;
    }
    onCheckout({ name: name.trim(), phone: phone.trim(), address: address.trim() }, deliveryArea, deliveryFee);
  }

  if (lines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-dashed border-black/[.12] p-6 text-center text-sm text-zinc-500 dark:border-white/[.18]"
      >
        Your cart is empty. Add items from the menu to get started.
      </motion.div>
    );
  }

  return (
    <motion.div layout className="flex flex-col gap-4 rounded-xl border border-black/[.08] bg-surface p-4 shadow-lift dark:border-white/[.145]">
      <h3 className="text-sm font-semibold">Your order</h3>
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
              className="flex items-start justify-between gap-2 overflow-hidden text-sm"
            >
              <div>
                <p>
                  {line.quantity}x {line.itemName}
                  {line.variantLabel && ` (${line.variantLabel})`}
                </p>
                {line.addons.length > 0 && (
                  <p className="text-xs text-zinc-500">+ {line.addons.map((a) => a.name).join(", ")}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>{formatMoney(lineTotal(line), currency)}</span>
                <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => onRemove(line.key)}>
                  Remove
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {deliveryAreas.length > 0 && (
        <label htmlFor="deliveryArea" className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Delivery area</span>
          <select
            id="deliveryArea"
            value={deliveryAreaId}
            onChange={(e) => setDeliveryAreaId(e.target.value)}
            className="h-10 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
          >
            <option value="">Pickup / not selected</option>
            {deliveryAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} - {formatMoney(area.fee, currency)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        {deliveryArea && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatMoney(deliveryFee, currency)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatMoney(subtotal + deliveryFee, currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/[.06] pt-3 dark:border-white/[.1]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="h-10 rounded-lg border border-black/[.12] bg-transparent px-3 text-sm outline-none dark:border-white/[.18]"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="h-10 rounded-lg border border-black/[.12] bg-transparent px-3 text-sm outline-none dark:border-white/[.18]"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery address (optional)"
          className="h-10 rounded-lg border border-black/[.12] bg-transparent px-3 text-sm outline-none dark:border-white/[.18]"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleCheckout}
          className="h-11 rounded-full bg-emerald-600 text-sm font-medium text-white shadow-soft hover:bg-emerald-700 hover:shadow-lift"
        >
          Order via WhatsApp
        </motion.button>
      </div>
    </motion.div>
  );
}
