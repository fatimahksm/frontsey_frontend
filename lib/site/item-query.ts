import type { PublicMenuItem } from "@/lib/api/types";

/**
 * Narrowing and ordering a list of items, shared by every template that shows
 * one.
 *
 * Each template builds its list its own way - grouped by category, flattened,
 * nested one level - but what a visitor wants to do to that list is the same
 * everywhere: find a thing, put the cheap ones first, ignore what is over
 * their budget, and not have three hundred of them arrive at once. Keeping the
 * rules here rather than in seven components is what stops "cheapest first"
 * meaning something slightly different on the Bistro menu than on the shop.
 */

export type SortOrder = "DEFAULT" | "PRICE_ASC" | "PRICE_DESC";

/**
 * The number a visitor is comparing when they sort or filter by price.
 *
 * The discount if there is one, since that is the price they would pay. For an
 * item sold only in sizes the field on the item can be zero and the real
 * prices live on the sizes, so the smallest of those stands in - the "from"
 * price, which is what such an item shows anyway.
 */
export function effectivePrice(item: PublicMenuItem): number {
  if (item.discountPrice != null) return item.discountPrice;
  if (item.price > 0) return item.price;
  const options = [...item.sizes.map((size) => size.price), ...item.boxVariants.map((box) => box.price)];
  return options.length > 0 ? Math.min(...options) : item.price;
}

/**
 * Sorting never reorders in place: DEFAULT returns the very same array, so a
 * template that has not been sorted keeps the order its owner arranged - which
 * on a menu is the chef's order and is the whole point of it.
 */
export function sortItems(items: PublicMenuItem[], order: SortOrder): PublicMenuItem[] {
  if (order === "DEFAULT") return items;
  const direction = order === "PRICE_ASC" ? 1 : -1;
  return [...items].sort((a, b) => (effectivePrice(a) - effectivePrice(b)) * direction);
}

/**
 * A blank bound is no bound. An owner's prices are in one currency, so these
 * are plain numbers in it rather than anything formatted.
 */
export function withinPrice(item: PublicMenuItem, min: number | null, max: number | null): boolean {
  const price = effectivePrice(item);
  if (min != null && price < min) return false;
  if (max != null && price > max) return false;
  return true;
}

/** Parses a price box: blank, spaces, or nonsense all mean "no bound". */
export function parseBound(raw: string): number | null {
  const value = Number(raw.trim());
  return raw.trim() === "" || Number.isNaN(value) ? null : value;
}

export interface ItemGroup {
  items: PublicMenuItem[];
}

/**
 * The first `limit` items, cut through the groups rather than over a flat
 * array: fill each group in turn until the budget is spent and drop the ones
 * past it entirely, because a category heading with nothing under it reads as
 * a broken page rather than as a page with more to come.
 */
export function takeFromGroups<T extends ItemGroup>(groups: T[], limit: number): T[] {
  let budget = limit;
  const out: T[] = [];
  for (const group of groups) {
    if (budget <= 0) break;
    const items = group.items.slice(0, budget);
    budget -= items.length;
    out.push({ ...group, items });
  }
  return out;
}

export function countItems(groups: ItemGroup[]): number {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

/**
 * Whether a list is long enough to be worth giving the visitor controls for.
 *
 * A twelve-dish menu with a price filter over it looks like a site that does
 * not know how small it is, and the controls cost a row of the screen on the
 * phone where they help least. Below this the list is short enough to read.
 */
export const CONTROLS_THRESHOLD = 16;

/**
 * The per-section budget for a template that pages inside each category rather
 * than across them. Smaller than the whole-page one because it is spent once
 * per section, not once per page.
 */
export const PAGE_SIZE_BISTRO = 12;
