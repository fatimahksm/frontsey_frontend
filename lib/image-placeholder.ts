/**
 * The picture shown in place of an image that fails to load.
 *
 * Owner-supplied image URLs are remote and outside our control: a business
 * deletes a photo, a host expires a link, a phone is offline. The browser's
 * default for that is a broken-image glyph and the element collapsing to its
 * alt text, which makes a published website look defective rather than merely
 * missing a picture.
 *
 * Drawn as inline SVG so the fallback itself can never be the thing that fails
 * to load: no network request, no font dependency (nothing here renders text
 * or emoji, which vary per device inside an <img>), nothing to license. It is
 * deliberately a neutral, quiet frame rather than a themed illustration, since
 * it stands in for menu dishes, salon services, logos, and covers alike.
 *
 * The glyph occupies about a fifth of a deliberately oversized canvas. Callers
 * render this with `object-cover` at every size from a 40px avatar to a
 * full-bleed hero, and the image scales with its box - so a glyph drawn to fill
 * its canvas would appear as a huge icon across the top of a cover photo. Small
 * on a large canvas keeps it looking like a quiet placeholder at any size.
 */
const PLACEHOLDER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#efece7"/>
        <stop offset="1" stop-color="#ddd8d0"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <g fill="none" stroke="#b4ada4" stroke-width="7" stroke-linejoin="round">
      <rect x="156" y="164" width="88" height="72" rx="9"/>
      <path d="M156 214l23-22 18 16 15-13 32 29"/>
    </g>
    <circle cx="188" cy="188" r="8" fill="#b4ada4"/>
  </svg>`;

export const IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  PLACEHOLDER_SVG.replace(/\s+/g, " ").trim(),
)}`;
