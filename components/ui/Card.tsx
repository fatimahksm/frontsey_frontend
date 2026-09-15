import type { ReactNode } from "react";

/**
 * A panel of related content.
 *
 * It no longer lifts on hover. A card is a container, not a control: making
 * every panel on a page react to the pointer means the page is never still,
 * and it teaches nothing, because the ones you *can* click look the same.
 */
export function Card({
  title,
  description,
  action,
  children,
  padded = true,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Off for a card whose content is a full-bleed list or table. */
  padded?: boolean;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-line bg-surface shadow-soft ${className}`}>
      {(title || action) && (
        <div
          className={`flex flex-wrap items-start justify-between gap-3 ${
 padded ? "px-5 pb-4 pt-5" : "border-b border-line px-5 py-4"
          }`}
        >
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? `px-5 pb-5 ${title || action ? "" : "pt-5"}` : ""}>{children}</div>
    </section>
  );
}
