/**
 * The one set of classes every typed-into or chosen-from control wears.
 *
 * Kept here rather than repeated per component because they drifted when they
 * were: the text field and the select agreed on a height and disagreed on
 * everything else, and a `<select>` rendered the operating system's own arrow
 * at the operating system's own metrics beside a field that had been styled by
 * hand. Side by side in the same toolbar, they did not look like one product.
 */
export const FIELD_BASE =
  "focus-ring h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-foreground transition-colors duration-150 placeholder:text-faint hover:border-line-strong/70 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted";

/** The label above a field, and the same text used for a group heading in a form. */
export const FIELD_LABEL = "text-[13px] font-medium text-foreground";
