"use client";

import { SafeImage } from "@/components/public/SafeImage";

/**
 * The site's mark in a portfolio header: the owner's logo, then their name.
 *
 * None of the four portfolio templates rendered the logo at all. An owner
 * uploaded one in their business profile, saw it in the console sidebar, and
 * then found no trace of it on their actual site - the header showed the
 * business name as text and nothing else. (Services touched logoUrl, but only
 * as a last-resort fill for the big portrait photo, which is not what a logo
 * is for and looks wrong at that size.)
 *
 * The name stays either way. A logo is often a symbol with no words in it, and
 * dropping the name for one would leave a visitor unsure whose site they are
 * on - so this is a mark plus a wordmark, not one or the other. Each template
 * keeps its own typography by passing its own class and style.
 */
export function PortfolioWordmark({
  logoUrl,
  name,
  className,
  style,
  /** Square edge length, in Tailwind sizing units, to suit each header's scale. */
  size = "h-8 w-8",
  /** Rounding, so the square-cornered templates stay square. */
  rounding = "rounded-lg",
}: {
  logoUrl: string | null;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: string;
  rounding?: string;
}) {
  return (
    <a href="#top" className="flex min-w-0 items-center gap-2.5">
      {logoUrl && (
        <SafeImage src={logoUrl} alt="" className={`${size} ${rounding} shrink-0 object-cover`} />
      )}
      <span className={`min-w-0 truncate ${className ?? ""}`} style={style}>
        {name}
      </span>
    </a>
  );
}
