import { useState } from "react";

/** How many items a list renders before asking. */
export const PAGE_SIZE = 30;

/**
 * How much of a long list to render.
 *
 * A shop's page shipped every product it had. Measured on a 300-product
 * catalogue that is 301 images and a page 35,000px tall - forty phone screens
 * of stock, all of it fetched and laid out before the visitor has scrolled
 * past the first row. A menu of thirty dishes never made that visible; a shop
 * with real stock levels does immediately.
 *
 * `resetKey` is whatever narrows the list - the chosen collection, the search
 * text. When it changes the list is a different list, and showing the 90 rows
 * you had reached in the previous one would be wrong; the count resets. It is
 * compared during render rather than synced in an effect, so the first paint
 * after a filter change is already correct instead of flashing the old count.
 */
export function usePaging(resetKey: string, pageSize: number = PAGE_SIZE) {
  const [state, setState] = useState({ key: resetKey, limit: pageSize });
  const limit = state.key === resetKey ? state.limit : pageSize;

  return {
    limit,
    showMore: () => setState({ key: resetKey, limit: limit + pageSize }),
  };
}
