/**
 * Project artwork for the Designer sample, drawn locally as inline SVG.
 *
 * Same reasoning as the Developer set - the design gallery must not depend on
 * a third-party CDN being reachable - but a deliberately different palette and
 * subject. The Developer studies are dark interface screenshots; these are
 * warm, paper-toned compositions: identity marks, type specimens, a palette
 * sheet, app screens. A designer's portfolio is judged on the artwork itself,
 * so these carry more of the page than the Developer set does.
 *
 * Abstract on purpose. Nothing here imitates a real brand or a real product.
 */

function svg(body: string, width: number, height: number): string {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc.replace(/\s+/g, " ").trim())}`;
}

/** Paper, ink and a single warm accent - the sample's whole palette. */
const PAPER = "#efe9e0";
const PAPER_DEEP = "#e3dbcf";
const INK = "#1c1a17";
const ACCENT = "#c8553d";
const MUTED = "#a89f92";

/** Identity: a constructed mark, a wordmark and its lockup, on paper. */
const IDENTITY = svg(
  `<rect width="1200" height="1500" fill="${PAPER}"/>
   <circle cx="600" cy="520" r="230" fill="none" stroke="${INK}" stroke-width="18"/>
   <path d="M600 290 A230 230 0 0 1 600 750 Z" fill="${ACCENT}"/>
   <rect x="330" y="900" width="540" height="26" rx="13" fill="${INK}"/>
   <rect x="330" y="956" width="380" height="26" rx="13" fill="${INK}" opacity="0.55"/>
   <rect x="330" y="1012" width="200" height="26" rx="13" fill="${MUTED}"/>
   <g fill="none" stroke="${MUTED}" stroke-width="2" stroke-dasharray="10 10">
     <rect x="230" y="150" width="740" height="740"/>
     <line x1="600" y1="150" x2="600" y2="890"/>
   </g>`,
  1200,
  1500,
);

/** A type specimen: scale, weights, a pull quote. */
const TYPE_SPECIMEN = svg(
  `<rect width="1500" height="1000" fill="${PAPER_DEEP}"/>
   <rect x="120" y="120" width="620" height="86" rx="6" fill="${INK}"/>
   <rect x="120" y="238" width="480" height="58" rx="5" fill="${INK}" opacity="0.75"/>
   <rect x="120" y="326" width="340" height="38" rx="4" fill="${INK}" opacity="0.5"/>
   <rect x="120" y="392" width="240" height="24" rx="4" fill="${MUTED}"/>
   <line x1="120" y1="470" x2="1380" y2="470" stroke="${INK}" stroke-opacity="0.25" stroke-width="2"/>
   ${[0, 1, 2, 3].map((i) => `<rect x="${120 + i * 320}" y="520" width="${240 - i * 22}" height="14" rx="7" fill="${MUTED}"/>
      <rect x="${120 + i * 320}" y="556" width="${190 - i * 18}" height="10" rx="5" fill="${MUTED}" opacity="0.6"/>`).join("")}
   <rect x="120" y="680" width="900" height="20" rx="10" fill="${INK}" opacity="0.8"/>
   <rect x="120" y="726" width="760" height="20" rx="10" fill="${INK}" opacity="0.8"/>
   <rect x="120" y="772" width="420" height="20" rx="10" fill="${ACCENT}"/>`,
  1500,
  1000,
);

/** A palette and component sheet - the "design system" project. */
const SYSTEM_SHEET = svg(
  `<rect width="1400" height="1000" fill="${PAPER}"/>
   ${["#1c1a17", "#c8553d", "#d8a45c", "#5d7a6b", "#8c7a9c", "#e3dbcf"].map(
     (c, i) => `<rect x="${100 + i * 200}" y="110" width="160" height="220" rx="10" fill="${c}"/>
                <rect x="${100 + i * 200}" y="352" width="96" height="10" rx="5" fill="${MUTED}"/>`,
   ).join("")}
   <line x1="100" y1="430" x2="1300" y2="430" stroke="${INK}" stroke-opacity="0.18" stroke-width="2"/>
   ${[0, 1, 2].map((i) => `<rect x="${100 + i * 410}" y="490" width="360" height="130" rx="16" fill="#ffffff" stroke="${INK}" stroke-opacity="0.12" stroke-width="2"/>
      <circle cx="${150 + i * 410}" cy="546" r="20" fill="${i === 1 ? ACCENT : PAPER_DEEP}"/>
      <rect x="${186 + i * 410}" y="530" width="${180 - i * 24}" height="12" rx="6" fill="${INK}" opacity="0.7"/>
      <rect x="${186 + i * 410}" y="558" width="${120 - i * 16}" height="10" rx="5" fill="${MUTED}"/>`).join("")}
   ${[0, 1, 2, 3].map((i) => `<rect x="${100 + i * 200}" y="700" width="150" height="52" rx="${i % 2 === 0 ? 26 : 8}" fill="${i === 0 ? INK : "none"}" stroke="${INK}" stroke-width="2"/>`).join("")}
   <rect x="100" y="810" width="1200" height="12" rx="6" fill="${MUTED}" opacity="0.5"/>
   <rect x="100" y="846" width="880" height="12" rx="6" fill="${MUTED}" opacity="0.35"/>`,
  1400,
  1000,
);

/** Three app screens, angled as a set. */
const APP_SCREENS = svg(
  `<rect width="1400" height="1000" fill="${PAPER_DEEP}"/>
   ${[0, 1, 2].map((i) => {
     const x = 200 + i * 340;
     const y = 120 + (i === 1 ? -40 : 40);
     return `<g>
       <rect x="${x}" y="${y}" width="300" height="640" rx="38" fill="#ffffff" stroke="${INK}" stroke-opacity="0.15" stroke-width="3"/>
       <rect x="${x + 110}" y="${y + 20}" width="80" height="12" rx="6" fill="${PAPER_DEEP}"/>
       <rect x="${x + 32}" y="${y + 70}" width="${170 - i * 20}" height="20" rx="10" fill="${INK}" opacity="0.85"/>
       <rect x="${x + 32}" y="${y + 106}" width="${110 - i * 12}" height="12" rx="6" fill="${MUTED}"/>
       <rect x="${x + 32}" y="${y + 150}" width="236" height="180" rx="18" fill="${i === 1 ? ACCENT : PAPER}"/>
       ${[0, 1, 2].map((j) => `<rect x="${x + 32}" y="${y + 356 + j * 62}" width="236" height="48" rx="12" fill="${PAPER}"/>
          <circle cx="${x + 60}" cy="${y + 380 + j * 62}" r="12" fill="${PAPER_DEEP}"/>
          <rect x="${x + 84}" y="${y + 373 + j * 62}" width="${130 - j * 18}" height="9" rx="5" fill="${MUTED}"/>`).join("")}
       <rect x="${x + 32}" y="${y + 566}" width="236" height="44" rx="22" fill="${INK}"/>
     </g>`;
   }).join("")}`,
  1400,
  1000,
);

/** An editorial web layout - big image, column of text. */
const WEB_LAYOUT = svg(
  `<rect width="1500" height="1000" fill="${PAPER}"/>
   <rect x="0" y="0" width="1500" height="72" fill="${INK}"/>
   <rect x="60" y="30" width="120" height="12" rx="6" fill="${PAPER}" opacity="0.9"/>
   ${[0, 1, 2].map((i) => `<rect x="${1120 + i * 110}" y="32" width="80" height="9" rx="5" fill="${PAPER}" opacity="0.5"/>`).join("")}
   <rect x="60" y="150" width="820" height="520" rx="8" fill="${PAPER_DEEP}"/>
   <circle cx="470" cy="410" r="120" fill="${ACCENT}" opacity="0.9"/>
   <rect x="940" y="150" width="500" height="26" rx="13" fill="${INK}"/>
   <rect x="940" y="200" width="400" height="26" rx="13" fill="${INK}" opacity="0.7"/>
   <rect x="940" y="266" width="460" height="12" rx="6" fill="${MUTED}"/>
   <rect x="940" y="296" width="420" height="12" rx="6" fill="${MUTED}"/>
   <rect x="940" y="326" width="300" height="12" rx="6" fill="${MUTED}"/>
   <rect x="940" y="392" width="180" height="46" rx="23" fill="${INK}"/>
   ${[0, 1, 2].map((i) => `<rect x="${60 + i * 280}" y="730" width="240" height="180" rx="8" fill="${PAPER_DEEP}"/>`).join("")}`,
  1500,
  1000,
);

const DESIGNER_ART = {
  identity: IDENTITY,
  typeSpecimen: TYPE_SPECIMEN,
  systemSheet: SYSTEM_SHEET,
  appScreens: APP_SCREENS,
  webLayout: WEB_LAYOUT,
} as const;

export type DesignerArt = keyof typeof DESIGNER_ART;

export function designerArt(kind: DesignerArt): string {
  return DESIGNER_ART[kind];
}

/** The Designer sample's work, in the order the template presents it. */
export function sampleDesignerWork(): string[] {
  return [IDENTITY, APP_SCREENS, SYSTEM_SHEET, WEB_LAYOUT, TYPE_SPECIMEN];
}

/**
 * A drawn avatar for a sample recommendation. A mark rather than a stock face:
 * the quotes are invented, and pairing invented words with a real person's
 * photograph is the one thing in a sample that could read as a real endorsement.
 */
export function designerAvatar(initial: string): string {
  const letter = (initial.trim().charAt(0) || "?").toUpperCase();
  return svg(
    `<rect width="200" height="200" rx="100" fill="${PAPER_DEEP}"/>
     <text x="100" y="100" text-anchor="middle" dominant-baseline="central"
       font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="${INK}">${letter}</text>`,
    200,
    200,
  );
}
