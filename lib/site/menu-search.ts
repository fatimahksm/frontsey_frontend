import type { PublicMenuItem } from "@/lib/api/types";

/** Case-insensitive substring match against an item's owner-entered name/description - used to power the public menu's search box. */
export function itemMatchesQuery(item: PublicMenuItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return item.name.toLowerCase().includes(q) || (item.description?.toLowerCase().includes(q) ?? false);
}
