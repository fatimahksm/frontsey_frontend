export interface CartLineAddon {
  name: string;
  extraPrice: number;
}

export interface CartLine {
  /** Unique per distinct selection so identical customizations can share one line. */
  key: string;
  itemId: string;
  itemName: string;
  variantLabel: string | null;
  unitPrice: number;
  addons: CartLineAddon[];
  quantity: number;
}

export function lineUnitTotal(line: CartLine): number {
  return line.unitPrice + line.addons.reduce((sum, addon) => sum + addon.extraPrice, 0);
}

export function lineTotal(line: CartLine): number {
  return lineUnitTotal(line) * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
