import type { PublicCategory, PublicMenuItem } from "@/lib/api/types";

/**
 * Every item under a category, including those filed in its sub-categories.
 *
 * The public payload nests sub-categories one level deep. The Classic layout
 * renders that nesting as labelled sections; the flat-list layouts (Grid,
 * Elegant, Bistro) fold it away with this helper, so sub-category items are
 * never silently dropped from a menu just because of how it is organized.
 */
export function itemsUnder(category: PublicCategory): PublicMenuItem[] {
  return [...category.items, ...category.subcategories.flatMap((sub) => sub.items)];
}
