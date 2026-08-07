/**
 * Local artwork for the Agency and Freelancer samples.
 *
 * Same rule as the Developer and Designer sets: the design gallery must never
 * depend on a third-party CDN, so everything here is an inline data URI. The
 * two sets are kept visually apart on purpose - Agency work is bold, saturated
 * and graphic, Freelancer work is quieter and product-shaped - because two
 * templates sharing one look is exactly what these rebuilds are meant to end.
 *
 * Abstract throughout. Nothing imitates a real brand, product or client.
 */

function svg(body: string, width: number, height: number): string {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc.replace(/\s+/g, " ").trim())}`;
}

// --- Agency: high-contrast graphic compositions ---

const A_INK = "#0f0f12";
const A_HOT = "#ff5c35";
const A_LIME = "#d6f24b";
const A_SKY = "#4b9bf2";
const A_BONE = "#f2f0eb";

/** Overlapping shapes and a hard diagonal - a campaign key visual. */
const CAMPAIGN = svg(
  `<rect width="1400" height="900" fill="${A_INK}"/>
   <circle cx="480" cy="430" r="290" fill="${A_HOT}"/>
   <rect x="620" y="180" width="480" height="480" fill="${A_LIME}" opacity="0.92"/>
   <path d="M0 900 L1400 380 L1400 900 Z" fill="${A_SKY}" opacity="0.75"/>
   <rect x="120" y="720" width="420" height="26" rx="13" fill="${A_BONE}"/>
   <rect x="120" y="770" width="260" height="26" rx="13" fill="${A_BONE}" opacity="0.6"/>`,
  1400,
  900,
);

/** A stacked poster set - repetition as rhythm. */
const POSTERS = svg(
  `<rect width="1400" height="900" fill="${A_BONE}"/>
   ${[0, 1, 2].map((i) => `<g transform="translate(${140 + i * 380} ${120 + (i % 2) * 60})">
      <rect width="320" height="620" fill="${[A_INK, A_HOT, A_SKY][i]}"/>
      <rect x="36" y="60" width="${220 - i * 30}" height="22" rx="11" fill="${A_BONE}" opacity="0.9"/>
      <rect x="36" y="102" width="${150 - i * 20}" height="14" rx="7" fill="${A_BONE}" opacity="0.55"/>
      <circle cx="196" cy="360" r="${110 - i * 14}" fill="${A_LIME}" opacity="${i === 1 ? 1 : 0.85}"/>
      <rect x="36" y="530" width="248" height="12" rx="6" fill="${A_BONE}" opacity="0.5"/>
    </g>`).join("")}`,
  1400,
  900,
);

/** A product page reduced to blocks - the "web build" case. */
const BUILD = svg(
  `<rect width="1400" height="900" fill="${A_INK}"/>
   <rect x="0" y="0" width="1400" height="90" fill="${A_HOT}"/>
   <rect x="60" y="38" width="150" height="16" rx="8" fill="${A_INK}"/>
   <rect x="80" y="180" width="640" height="34" rx="17" fill="${A_BONE}"/>
   <rect x="80" y="238" width="480" height="34" rx="17" fill="${A_BONE}" opacity="0.7"/>
   <rect x="80" y="300" width="300" height="18" rx="9" fill="${A_LIME}"/>
   <rect x="80" y="366" width="200" height="56" rx="28" fill="${A_LIME}"/>
   <rect x="820" y="160" width="500" height="380" rx="14" fill="${A_SKY}" opacity="0.85"/>
   ${[0, 1, 2, 3].map((i) => `<rect x="${80 + i * 320}" y="620" width="260" height="180" rx="12" fill="#1a1a20"/>
      <rect x="112" y="${660}" width="${140 - i * 16}" height="12" rx="6" fill="${A_BONE}" opacity="0.5" transform="translate(${i * 320} 0)"/>`).join("")}`,
  1400,
  900,
);

const AGENCY_ART = { campaign: CAMPAIGN, posters: POSTERS, build: BUILD } as const;
export type AgencyArt = keyof typeof AGENCY_ART;

export function agencyArt(kind: AgencyArt): string {
  return AGENCY_ART[kind];
}

export function sampleAgencyWork(): string[] {
  return [CAMPAIGN, BUILD, POSTERS];
}

// --- Freelancer: calm, product-shaped panels ---

const F_BG = "#14161a";
const F_CARD = "#1e2127";
const F_LINE = "#2b3038";
const F_TEXT = "#8a929e";
const F_WARM = "#e8a33d";

/** A booking flow. */
const FLOW = svg(
  `<rect width="1300" height="820" fill="${F_BG}"/>
   ${[0, 1, 2].map((i) => `<rect x="${90 + i * 390}" y="150" width="300" height="520" rx="22" fill="${F_CARD}" stroke="${F_LINE}" stroke-width="2"/>
      <rect x="${126 + i * 390}" y="200" width="${150 - i * 20}" height="18" rx="9" fill="${F_TEXT}" opacity="0.8"/>
      <rect x="${126 + i * 390}" y="236" width="${100 - i * 12}" height="12" rx="6" fill="${F_TEXT}" opacity="0.4"/>
      <rect x="${126 + i * 390}" y="290" width="228" height="150" rx="14" fill="${i === 1 ? F_WARM : "#252932"}"/>
      ${[0, 1].map((j) => `<rect x="${126 + i * 390}" y="${470 + j * 54}" width="228" height="38" rx="10" fill="#252932"/>`).join("")}
      <rect x="${126 + i * 390}" y="596" width="228" height="42" rx="21" fill="${F_WARM}" opacity="${i === 2 ? 1 : 0.35}"/>`).join("")}`,
  1300,
  820,
);

/** A content site - list and detail. */
const CONTENT = svg(
  `<rect width="1300" height="820" fill="${F_BG}"/>
   <rect x="80" y="90" width="460" height="640" rx="18" fill="${F_CARD}" stroke="${F_LINE}" stroke-width="2"/>
   ${[0, 1, 2, 3, 4].map((i) => `<rect x="116" y="${140 + i * 116}" width="388" height="92" rx="12" fill="#232730"/>
      <rect x="140" y="${168 + i * 116}" width="${240 - i * 26}" height="13" rx="7" fill="${F_TEXT}" opacity="0.7"/>
      <rect x="140" y="${194 + i * 116}" width="${170 - i * 18}" height="10" rx="5" fill="${F_TEXT}" opacity="0.35"/>`).join("")}
   <rect x="580" y="90" width="640" height="640" rx="18" fill="${F_CARD}" stroke="${F_LINE}" stroke-width="2"/>
   <rect x="620" y="140" width="560" height="240" rx="12" fill="${F_WARM}" opacity="0.85"/>
   <rect x="620" y="420" width="420" height="20" rx="10" fill="${F_TEXT}" opacity="0.8"/>
   ${[0, 1, 2, 3].map((i) => `<rect x="620" y="${470 + i * 34}" width="${540 - i * 60}" height="12" rx="6" fill="${F_TEXT}" opacity="0.3"/>`).join("")}`,
  1300,
  820,
);

/** A dashboard, calmer than the Developer one. */
const PANEL = svg(
  `<rect width="1300" height="820" fill="${F_BG}"/>
   <rect x="80" y="90" width="1140" height="640" rx="20" fill="${F_CARD}" stroke="${F_LINE}" stroke-width="2"/>
   <rect x="80" y="90" width="1140" height="72" rx="20" fill="#232730"/>
   <rect x="120" y="118" width="160" height="14" rx="7" fill="${F_TEXT}" opacity="0.6"/>
   ${[0, 1, 2].map((i) => `<rect x="${130 + i * 370}" y="210" width="330" height="150" rx="14" fill="#232730"/>
      <rect x="${162 + i * 370}" y="246" width="96" height="11" rx="6" fill="${F_TEXT}" opacity="0.45"/>
      <rect x="${162 + i * 370}" y="276" width="${150 - i * 20}" height="26" rx="8" fill="${i === 0 ? F_WARM : "#2f343e"}"/>`).join("")}
   <rect x="130" y="404" width="1040" height="286" rx="14" fill="#232730"/>
   ${[120, 200, 160, 250, 210, 300, 270, 340].map((h, i) => `<rect x="${180 + i * 124}" y="${650 - h * 0.7}" width="60" height="${h * 0.7}" rx="8" fill="${i % 4 === 0 ? F_WARM : "#333a45"}"/>`).join("")}`,
  1300,
  820,
);

/** A drawn portrait stand-in for the Freelancer hero - a mark, never a fake face. */
export function freelancerPortrait(initial: string): string {
  const letter = (initial.trim().charAt(0) || "?").toUpperCase();
  return svg(
    `<rect width="800" height="1000" fill="${F_CARD}"/>
     <circle cx="400" cy="420" r="220" fill="${F_WARM}" opacity="0.16"/>
     <circle cx="400" cy="420" r="150" fill="none" stroke="${F_WARM}" stroke-opacity="0.5" stroke-width="4"/>
     <text x="400" y="430" text-anchor="middle" dominant-baseline="central"
       font-family="Helvetica, Arial, sans-serif" font-size="190" font-weight="600" fill="${F_WARM}">${letter}</text>
     <rect x="220" y="740" width="360" height="16" rx="8" fill="${F_TEXT}" opacity="0.35"/>
     <rect x="280" y="784" width="240" height="12" rx="6" fill="${F_TEXT}" opacity="0.22"/>`,
    800,
    1000,
  );
}

/** A drawn avatar for a sample recommendation - invented words never get a real face. */
export function studioAvatar(initial: string): string {
  const letter = (initial.trim().charAt(0) || "?").toUpperCase();
  return svg(
    `<rect width="200" height="200" rx="100" fill="${F_CARD}"/>
     <text x="100" y="100" text-anchor="middle" dominant-baseline="central"
       font-family="Helvetica, Arial, sans-serif" font-size="82" font-weight="600" fill="${F_WARM}">${letter}</text>`,
    200,
    200,
  );
}

const FREELANCER_ART = { flow: FLOW, content: CONTENT, panel: PANEL } as const;
export type FreelancerArt = keyof typeof FREELANCER_ART;

export function freelancerArt(kind: FreelancerArt): string {
  return FREELANCER_ART[kind];
}

export function sampleFreelancerWork(): string[] {
  return [FLOW, CONTENT, PANEL];
}
