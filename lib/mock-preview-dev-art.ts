/**
 * Project artwork for the Developer sample, drawn locally as inline SVG.
 *
 * The other samples hotlink stock photography, which is fine for a plate of
 * food but wrong here for two reasons. A developer's "project shot" is a
 * screenshot of an interface, and stock photos of laptops are the visual
 * cliche that makes a portfolio look generic. More practically, the design
 * gallery must not depend on a third-party CDN being reachable: an owner
 * judging a template over a bad connection, or behind a network that blocks
 * that host, should still see a complete page rather than four placeholders.
 *
 * These are data URIs, so they cannot fail to load, cost no request, and need
 * no licence. They are deliberately abstract interface studies rather than
 * fake screenshots of real products - nothing here claims to be software that
 * exists.
 */

function svg(body: string, width = 1200, height = 750): string {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc.replace(/\s+/g, " ").trim())}`;
}

/** Shared dark ground, so the four read as one set against the template's shell. */
const GROUND = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#14161c"/><stop offset="1" stop-color="#0b0d11"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>`;

/** The three dots every application window has, as a scale cue. */
const CHROME = `
  <rect x="0" y="0" width="1200" height="56" fill="#1a1d24"/>
  <circle cx="34" cy="28" r="7" fill="#3a4050"/>
  <circle cx="60" cy="28" r="7" fill="#3a4050"/>
  <circle cx="86" cy="28" r="7" fill="#3a4050"/>`;

/** An analytics view: sidebar, stat row, bar chart. */
const DASHBOARD = svg(`
  ${GROUND}${CHROME}
  <rect x="0" y="56" width="230" height="694" fill="#12151b"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="32" y="${112 + i * 54}" width="${150 - i * 12}" height="12" rx="6" fill="#252a34"/>`).join("")}
  ${[0, 1, 2].map((i) => `<rect x="${278 + i * 292}" y="112" width="264" height="110" rx="14" fill="#171b22" stroke="#242935"/>
     <rect x="${306 + i * 292}" y="142" width="92" height="10" rx="5" fill="#2c323e"/>
     <rect x="${306 + i * 292}" y="168" width="140" height="24" rx="6" fill="#7c8cfa" opacity="${0.85 - i * 0.2}"/>`).join("")}
  <rect x="278" y="262" width="848" height="420" rx="16" fill="#171b22" stroke="#242935"/>
  ${[190, 300, 240, 380, 320, 460, 410, 520, 470, 610].map((h, i) => `<rect x="${330 + i * 78}" y="${650 - h * 0.62}" width="42" height="${h * 0.62}" rx="6" fill="${i % 3 === 0 ? "#7c8cfa" : "#2f3644"}"/>`).join("")}
  <path d="M330 560 L408 500 L486 528 L564 452 L642 486 L720 400 L798 428 L876 356 L954 384 L1032 300" fill="none" stroke="#5eead4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`);

/** A phone frame with a list and a bottom bar. */
const MOBILE = svg(`
  ${GROUND}
  <rect x="430" y="70" width="340" height="610" rx="44" fill="#12151b" stroke="#262c38" stroke-width="3"/>
  <rect x="556" y="92" width="88" height="14" rx="7" fill="#1d222b"/>
  <rect x="464" y="140" width="180" height="20" rx="10" fill="#2d3441"/>
  <rect x="464" y="176" width="120" height="12" rx="6" fill="#232935"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="464" y="${222 + i * 92}" width="272" height="76" rx="14" fill="#171b22" stroke="#242935"/>
     <circle cx="502" cy="${260 + i * 92}" r="18" fill="${i === 0 ? "#7c8cfa" : "#2b3240"}"/>
     <rect x="534" y="${246 + i * 92}" width="${150 - i * 18}" height="11" rx="6" fill="#2f3644"/>
     <rect x="534" y="${268 + i * 92}" width="${104 - i * 10}" height="9" rx="5" fill="#242a35"/>`).join("")}
  <rect x="464" y="606" width="272" height="52" rx="26" fill="#7c8cfa"/>`);

/** Request/response flow between services. */
const API = svg(`
  ${GROUND}
  ${[0, 1, 2].map((i) => `<rect x="${140 + i * 320}" y="300" width="220" height="140" rx="18" fill="#171b22" stroke="#2a3140" stroke-width="2"/>
     <rect x="${172 + i * 320}" y="336" width="${120 - i * 16}" height="12" rx="6" fill="#2f3644"/>
     <rect x="${172 + i * 320}" y="362" width="${88 - i * 10}" height="9" rx="5" fill="#252b36"/>
     <circle cx="${332 + i * 320}" cy="322" r="6" fill="${i === 0 ? "#5eead4" : "#7c8cfa"}"/>`).join("")}
  <path d="M360 370 H460" stroke="#7c8cfa" stroke-width="3" stroke-dasharray="8 8"/>
  <path d="M680 370 H780" stroke="#7c8cfa" stroke-width="3" stroke-dasharray="8 8"/>
  <path d="M250 300 V190 H860 V300" fill="none" stroke="#2f3644" stroke-width="3"/>
  <rect x="770" y="150" width="180" height="80" rx="14" fill="#171b22" stroke="#2a3140" stroke-width="2"/>
  <rect x="798" y="182" width="96" height="10" rx="5" fill="#2f3644"/>
  <path d="M250 440 V560 H860 V470" fill="none" stroke="#2f3644" stroke-width="3"/>
  <rect x="480" y="520" width="240" height="90" rx="16" fill="#171b22" stroke="#2a3140" stroke-width="2"/>
  <rect x="512" y="552" width="128" height="11" rx="6" fill="#2f3644"/>
  <rect x="512" y="576" width="80" height="9" rx="5" fill="#252b36"/>`);

/** A terminal session: prompts and output, no readable fake code. */
const TERMINAL = svg(`
  ${GROUND}${CHROME}
  ${[
    [64, 130, "#5eead4"],
    [64, 176, "#3b4250"],
    [64, 212, "#3b4250"],
    [64, 268, "#7c8cfa"],
    [64, 314, "#3b4250"],
    [64, 350, "#3b4250"],
    [64, 386, "#3b4250"],
    [64, 442, "#5eead4"],
    [64, 488, "#3b4250"],
    [64, 544, "#7c8cfa"],
  ]
    .map(([x, y, fill], i) => {
      const isPrompt = fill !== "#3b4250";
      const w = isPrompt ? 300 + ((i * 97) % 260) : 200 + ((i * 131) % 520);
      return `${isPrompt ? `<rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="${fill}"/>` : ""}
              <rect x="${isPrompt ? Number(x) + 28 : Number(x) + 28}" y="${y}" width="${w}" height="14" rx="7" fill="${isPrompt ? "#4b5364" : String(fill)}"/>`;
    })
    .join("")}
  <rect x="92" y="600" width="180" height="14" rx="7" fill="#4b5364"/>
  <rect x="284" y="598" width="12" height="18" fill="#7c8cfa"/>`);

/**
 * A drawn avatar for a sample recommendation. Deliberately a mark rather than
 * a stock face: the recommendations are invented, and pairing invented words
 * with a real photograph of a real person is the one thing in a sample that
 * could be mistaken for a genuine endorsement.
 */
export function devAvatar(initial: string): string {
  const letter = (initial.trim().charAt(0) || "?").toUpperCase();
  return svg(
    `<rect width="200" height="200" rx="100" fill="#1b1f27"/>
     <circle cx="100" cy="100" r="94" fill="none" stroke="#7c8cfa" stroke-opacity="0.35" stroke-width="3"/>
     <text x="100" y="100" text-anchor="middle" dominant-baseline="central"
       font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="78" fill="#7c8cfa">${letter}</text>`,
    200,
    200,
  );
}

const DEV_ART = {
  dashboard: DASHBOARD,
  mobile: MOBILE,
  api: API,
  terminal: TERMINAL,
} as const;

export type DevArt = keyof typeof DEV_ART;

/** One project image for the Developer sample. */
export function devArt(kind: DevArt): string {
  return DEV_ART[kind];
}

/** The Developer sample's projects, in the order the template presents them. */
export function sampleDevProjectArt(): string[] {
  return [DASHBOARD, MOBILE, API, TERMINAL];
}
