/**
 * Sample artwork for the preview/template gallery, drawn as inline SVG.
 *
 * The gallery has to look like a real, photographed menu for an owner to
 * judge a layout - but a preview must not depend on the network (there is
 * none at render time, and a broken <img> would misrepresent the design) and
 * must not ship someone else's photographs. So these are flat illustrations
 * built from shapes only: no external requests, no font dependency (nothing
 * here renders text or emoji, which vary per device inside an <img>), and
 * nothing to license.
 *
 * They are deliberately illustrations rather than fake photographs, so no
 * one mistakes sample data for a real business's content.
 */

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

/** Warm, food-friendly backdrops - one per dish so a menu page doesn't look monotone. */
const PLATE_TONES = {
  amber: ["#f6c453", "#e08b1e"],
  ember: ["#f0a05a", "#c2521f"],
  olive: ["#bcd67f", "#6f9a3a"],
  cocoa: ["#d8a273", "#8a5127"],
  cream: ["#f3ddb4", "#d1a35e"],
  berry: ["#f0999b", "#b93f52"],
} as const;

export type PlateTone = keyof typeof PLATE_TONES;

function plate(tone: PlateTone, art: string): string {
  const [from, to] = PLATE_TONES[tone];
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="l" cx="0.35" cy="0.28" r="0.75">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#g)"/>
      <rect width="120" height="120" fill="url(#l)"/>
      ${art}
    </svg>`);
}

// --- Dish illustrations, drawn on a 120x120 plate ---

const BURGER = `
  <path d="M28 46c0-16 14-26 32-26s32 10 32 26z" fill="#e8a75c"/>
  <circle cx="48" cy="34" r="2.4" fill="#fff3dd"/><circle cx="62" cy="29" r="2.4" fill="#fff3dd"/>
  <circle cx="75" cy="35" r="2.4" fill="#fff3dd"/>
  <rect x="26" y="46" width="68" height="9" rx="4.5" fill="#8fbf4d"/>
  <rect x="28" y="55" width="64" height="12" rx="5" fill="#7b4425"/>
  <rect x="26" y="67" width="68" height="8" rx="4" fill="#ffd166"/>
  <path d="M28 75h64c0 12-10 19-32 19s-32-7-32-19z" fill="#dd9a4e"/>`;

const FRIES = `
  <g fill="#ffd166">
    <rect x="45" y="26" width="7" height="44" rx="3"/><rect x="56" y="20" width="7" height="50" rx="3"/>
    <rect x="67" y="28" width="7" height="42" rx="3"/><rect x="35" y="34" width="7" height="36" rx="3"/>
    <rect x="77" y="36" width="7" height="34" rx="3"/>
  </g>
  <path d="M33 62h54l-6 34H39z" fill="#d9463c"/>
  <rect x="42" y="70" width="36" height="7" rx="3.5" fill="#f2f2f2" opacity="0.85"/>`;

const CHICKEN = `
  <g fill="#e8b465" stroke="#bd7f2e" stroke-width="2.5">
    <path d="M30 54c5-11 21-14 29-6 7 7 3 18-6 21-11 4-28-3-23-15z"/>
    <path d="M57 34c7-9 22-8 27 1 5 8-2 17-11 18-10 1-22-9-16-19z"/>
    <path d="M45 78c7-10 24-10 31-1 6 8-1 17-11 18-11 1-26-7-20-17z"/>
  </g>`;

const RINGS = `
  <g fill="none" stroke="#e8b465" stroke-width="9">
    <circle cx="47" cy="50" r="20"/><circle cx="74" cy="70" r="15"/>
  </g>
  <g fill="none" stroke="#c98a34" stroke-width="2">
    <circle cx="47" cy="50" r="24.5"/><circle cx="47" cy="50" r="15.5"/>
    <circle cx="74" cy="70" r="19.5"/><circle cx="74" cy="70" r="10.5"/>
  </g>`;

const STICKS = `
  <g transform="rotate(-24 60 60)">
    <rect x="30" y="38" width="60" height="15" rx="7.5" fill="#e8b465" stroke="#bd7f2e" stroke-width="2.5"/>
    <rect x="30" y="57" width="60" height="15" rx="7.5" fill="#e8b465" stroke="#bd7f2e" stroke-width="2.5"/>
    <rect x="30" y="76" width="60" height="15" rx="7.5" fill="#e8b465" stroke="#bd7f2e" stroke-width="2.5"/>
  </g>`;

const CUP = `
  <path d="M40 34h40l-5 54a6 6 0 0 1-6 5H51a6 6 0 0 1-6-5z" fill="#f6f1e7"/>
  <rect x="36" y="26" width="48" height="10" rx="5" fill="#c0562a"/>
  <path d="M80 46h8a10 10 0 0 1 0 20h-6" stroke="#f6f1e7" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="50" y="48" width="20" height="30" rx="4" fill="#c8a37a" opacity="0.6"/>`;

const SALAD = `
  <path d="M26 58h68a34 34 0 0 1-68 0z" fill="#f6f1e7"/>
  <circle cx="46" cy="50" r="12" fill="#8fbf4d"/><circle cx="66" cy="46" r="14" fill="#6f9a3a"/>
  <circle cx="80" cy="54" r="9" fill="#a9d162"/><circle cx="34" cy="54" r="8" fill="#a9d162"/>
  <circle cx="58" cy="56" r="6" fill="#d9463c"/>`;

const SWEET = `
  <circle cx="60" cy="60" r="30" fill="#d8a273"/>
  <circle cx="50" cy="52" r="5" fill="#5b3418"/><circle cx="70" cy="56" r="4.5" fill="#5b3418"/>
  <circle cx="58" cy="72" r="4.5" fill="#5b3418"/><circle cx="72" cy="72" r="3.5" fill="#5b3418"/>
  <circle cx="45" cy="68" r="3.5" fill="#5b3418"/>`;

const DISHES = {
  burger: BURGER,
  fries: FRIES,
  chicken: CHICKEN,
  rings: RINGS,
  sticks: STICKS,
  cup: CUP,
  salad: SALAD,
  sweet: SWEET,
} as const;

export type DishArt = keyof typeof DISHES;

/** A square sample photo for one menu item. */
export function sampleItemImage(dish: DishArt, tone: PlateTone): string {
  return plate(tone, DISHES[dish]);
}

/** One dish placed on the cover, centred on (x, y) at the given scale. */
function coverDish(art: string, x: number, y: number, scale: number, opacity: number, rotate = 0): string {
  return `<g opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-60 -60)">${art}</g>`;
}

/**
 * Wide, dark sample cover for the hero. Deliberately a scattered, low-contrast
 * backdrop rather than one big centred dish: the layout lays a headline and
 * logo over the middle of this, and a single large illustration there would
 * compete with them.
 */
export function sampleCoverImage(): string {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stop-color="#43290f"/><stop offset="1" stop-color="#0a0806"/>
        </linearGradient>
        <radialGradient id="vig" cx="0.5" cy="0.45" r="0.62">
          <stop offset="0" stop-color="#000000" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.05"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/>
      ${/* Kept within roughly x 380-820 and clear of the vertical middle: a
            portrait viewport object-covers this wide image down to its centre
            band, so dishes parked in the corners would never be seen on a
            phone, and anything mid-height would sit under the headline. */ ""}
      ${coverDish(BURGER, 415, 185, 2.1, 0.55, -12)}
      ${coverDish(FRIES, 795, 165, 1.8, 0.48, 10)}
      ${coverDish(CHICKEN, 785, 625, 2.0, 0.45, -8)}
      ${coverDish(CUP, 420, 640, 1.7, 0.45, 8)}
      ${coverDish(RINGS, 600, 95, 1.4, 0.3)}
      ${coverDish(SALAD, 600, 725, 1.4, 0.3)}
      <rect width="1200" height="800" fill="url(#vig)"/>
    </svg>`);
}

/** Round sample logo. */
export function sampleLogoImage(): string {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="60" fill="#1c1408"/>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#f6c453" stroke-width="4"/>
      <g transform="translate(60 62) scale(0.62) translate(-60 -60)">${BURGER}</g>
    </svg>`);
}

/** Gallery strip tiles - the same illustration family, so the page reads as one set. */
export function sampleGalleryImages(): string[] {
  return [
    sampleItemImage("burger", "ember"),
    sampleItemImage("fries", "amber"),
    sampleItemImage("chicken", "cocoa"),
    sampleItemImage("rings", "olive"),
    sampleItemImage("cup", "cream"),
    sampleItemImage("sweet", "berry"),
  ];
}
