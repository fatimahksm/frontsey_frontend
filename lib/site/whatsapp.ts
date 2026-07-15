import type { CartLine } from "@/lib/site/cart";
import { cartSubtotal, lineTotal } from "@/lib/site/cart";
import { formatMoney } from "@/lib/format";

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

/** BR-ORD-001/002: a plain-text order summary handed off to WhatsApp - there is no server-side order record in this MVP. */
export function buildWhatsAppMessage(
  businessName: string,
  lines: CartLine[],
  currency: string,
  deliveryAreaName: string | null,
  deliveryFee: number,
  customer: Customer,
): string {
  const rows = lines.map((line) => {
    const parts = [`${line.quantity}x ${line.itemName}`];
    if (line.variantLabel) parts.push(`(${line.variantLabel})`);
    if (line.addons.length > 0) parts.push(`+ ${line.addons.map((a) => a.name).join(", ")}`);
    return `${parts.join(" ")} - ${formatMoney(lineTotal(line), currency)}`;
  });

  const subtotal = cartSubtotal(lines);
  const total = subtotal + deliveryFee;

  const sections = [
    `New order for ${businessName}`,
    "",
    ...rows,
    "",
    `Subtotal: ${formatMoney(subtotal, currency)}`,
  ];
  if (deliveryAreaName) {
    sections.push(`Delivery (${deliveryAreaName}): ${formatMoney(deliveryFee, currency)}`);
  }
  sections.push(`Total: ${formatMoney(total, currency)}`, "", `Name: ${customer.name}`, `Phone: ${customer.phone}`);
  if (customer.address) sections.push(`Address: ${customer.address}`);

  return sections.join("\n");
}

export function whatsappUrl(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
