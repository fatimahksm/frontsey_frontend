import { useState } from "react";

import type { PublicMenuItem } from "@/lib/api/types";
import { parseBound, sortItems, withinPrice, type SortOrder } from "@/lib/site/item-query";
import { usePaging } from "@/lib/site/paging";

/**
 * The visitor's own view of a list - how it is ordered, what price range they
 * will look at, and how much of it has been rendered so far.
 *
 * One hook rather than three pieces of state in seven components, and one
 * reset rule: changing the sort, the bounds, the chosen category or the search
 * text all make it a different list, so the rendered count starts again. That
 * last part is the easy thing to get wrong - sort a list you had scrolled 90
 * rows into and, without this, you keep 90 rows of a different order and the
 * page silently lies about what is at the top of it.
 *
 * `resetKey` is whatever else narrows the list in the calling template.
 */
export function useListControls(resetKey: string) {
  const [order, setOrder] = useState<SortOrder>("DEFAULT");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const { limit, showMore } = usePaging(`${resetKey}|${order}|${min}|${max}`);

  return {
    limit,
    showMore,
    /** Everything the ListControls row needs, so a caller spreads it in. */
    controlProps: {
      order,
      onOrderChange: setOrder,
      min,
      max,
      onMinChange: setMin,
      onMaxChange: setMax,
    },
    /** Price bounds then sort order, in that order: filtering first keeps the sort off items nobody asked to see. */
    refine(items: PublicMenuItem[]): PublicMenuItem[] {
      const bounds = { min: parseBound(min), max: parseBound(max) };
      return sortItems(items.filter((item) => withinPrice(item, bounds.min, bounds.max)), order);
    },
  };
}
