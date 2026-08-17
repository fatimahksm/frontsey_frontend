import type { CSSProperties } from "react";

import type { LayoutVariant } from "@/lib/api/types";

/**
 * The single, strongly-typed schema for a template's design system - see
 * Theme.themeConfig on the backend, which is validated against this exact
 * shape (Phase 3: no more arbitrary/ignored theme JSON). Every website has
 * an *effective* ThemeConfig, whether it picked a preset or is "building
 * from scratch" (DEFAULT_THEME_CONFIG below), so there's never a null case
 * to special-case in the renderer.
 */
export type FontChoice = "SYSTEM_SANS" | "MODERN_SANS" | "ELEGANT_SERIF" | "CLASSIC_SERIF" | "MONOSPACE";
export type ButtonStyle = "ROUNDED" | "PILL" | "SQUARE";
export type CardStyle = "FLAT" | "SOFT_SHADOW" | "BORDERED";
export type SectionSpacing = "COMPACT" | "COMFORTABLE" | "SPACIOUS";

export interface ThemeConfig {
  fontFamily: FontChoice;
  headingFontFamily: FontChoice;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  buttonStyle: ButtonStyle;
  cardStyle: CardStyle;
  borderRadius: number;
  sectionSpacing: SectionSpacing;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  fontFamily: "SYSTEM_SANS",
  headingFontFamily: "SYSTEM_SANS",
  primaryColor: "#7c3aed",
  secondaryColor: "#f4f0fb",
  backgroundColor: "#ffffff",
  surfaceColor: "#ffffff",
  textColor: "#0a0a0f",
  buttonStyle: "PILL",
  cardStyle: "SOFT_SHADOW",
  borderRadius: 16,
  sectionSpacing: "COMFORTABLE",
};

/**
 * Real, widely-available font stacks (no webfont loading, so no build-time
 * network dependency) that are honestly distinct from one another, rather
 * than pretending to render a specific named webfont we don't load.
 */
const FONT_STACKS: Record<FontChoice, string> = {
  SYSTEM_SANS: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  MODERN_SANS: '"Trebuchet MS", "Segoe UI", Verdana, sans-serif',
  ELEGANT_SERIF: 'Georgia, "Times New Roman", serif',
  CLASSIC_SERIF: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  MONOSPACE: '"Courier New", ui-monospace, monospace',
};

export const FONT_LABELS: Record<FontChoice, string> = {
  SYSTEM_SANS: "System Sans",
  MODERN_SANS: "Modern Sans",
  ELEGANT_SERIF: "Elegant Serif",
  CLASSIC_SERIF: "Classic Serif",
  MONOSPACE: "Monospace",
};

const BUTTON_RADIUS: Record<ButtonStyle, string> = {
  ROUNDED: "12px",
  PILL: "9999px",
  SQUARE: "4px",
};

export const BUTTON_STYLE_LABELS: Record<ButtonStyle, string> = {
  ROUNDED: "Rounded",
  PILL: "Pill",
  SQUARE: "Square",
};

export const CARD_STYLE_LABELS: Record<CardStyle, string> = {
  FLAT: "Flat",
  SOFT_SHADOW: "Soft shadow",
  BORDERED: "Bordered",
};

const CARD_TREATMENT: Record<CardStyle, { boxShadow: string; border: string }> = {
  FLAT: { boxShadow: "none", border: "1px solid transparent" },
  SOFT_SHADOW: { boxShadow: "var(--shadow-soft)", border: "1px solid transparent" },
  BORDERED: { boxShadow: "none", border: "1px solid var(--border-subtle)" },
};

export const SECTION_SPACING_LABELS: Record<SectionSpacing, string> = {
  COMPACT: "Compact",
  COMFORTABLE: "Comfortable",
  SPACIOUS: "Spacious",
};

const SECTION_GAP: Record<SectionSpacing, string> = {
  COMPACT: "1.5rem",
  COMFORTABLE: "2.5rem",
  SPACIOUS: "4rem",
};

/**
 * CSS custom properties applied at each public layout's root element so
 * every descendant (cards, buttons, headings) can consume them via
 * `var(--theme-*)`. `brandColor` (the per-site quick accent override, see
 * draft-content.ts) still wins over the theme's own primaryColor when set,
 * preserving existing behavior.
 */
/**
 * A text colour that stays readable on top of `accent`.
 *
 * Owners pick brand colours across the whole range - a pale amber and a deep
 * indigo are both reasonable choices - and a template that hard-codes white
 * button text turns the first one into an unreadable button. Relative
 * luminance decides; anything unparseable falls back to white, which is the
 * safer default for the saturated colours people actually choose.
 */
function readableOn(accent: string): string {
  const hex = accent.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "#ffffff";
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = channel(parseInt(full.slice(0, 2), 16));
  const g = channel(parseInt(full.slice(2, 4), 16));
  const b = channel(parseInt(full.slice(4, 6), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Contrast against white is (1.05)/(L+0.05); against black it is
  // (L+0.05)/0.05. They cross at L ~= 0.179, so that is the switch point.
  return luminance > 0.179 ? "#16181d" : "#ffffff";
}

/** sRGB relative luminance of a hex colour, or null if it will not parse. */
function luminanceOf(hex: string): number | null {
  const raw = hex.trim().replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(parseInt(full.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(full.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(full.slice(4, 6), 16))
  );
}

function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * The accent colour, made readable as *text* on the page's own background.
 *
 * --accent-contrast answers "what colour goes on top of the accent". This is
 * the other direction, and it was missing: templates set section numbers,
 * eyebrow labels and inline links in the accent itself, and an owner who picks
 * a warm amber or a pale brand colour then has those sitting on a white page at
 * around 1.8:1 - technically coloured, practically invisible. Measured across
 * the templates, this was the single most common way a chosen colour broke a
 * page.
 *
 * The hue is kept and only blended toward the page's text colour, by the
 * smallest step that clears 4.5:1, so a colour that was already readable comes
 * back untouched and one that was not stays recognisably itself.
 */
function accentInk(accent: string, background: string, text: string): string {
  const accentLum = luminanceOf(accent);
  const groundLum = luminanceOf(background);
  if (accentLum === null || groundLum === null) return accent;
  if (contrastRatio(accentLum, groundLum) >= 4.5) return accent;

  // color-mix does the blending in the browser; we only decide how far.
  for (let mix = 80; mix >= 20; mix -= 10) {
    const blendLum = luminanceOf(text);
    if (blendLum === null) break;
    const approx = (accentLum * mix + blendLum * (100 - mix)) / 100;
    if (contrastRatio(approx, groundLum) >= 4.5) {
      return `color-mix(in srgb, ${accent} ${mix}%, ${text})`;
    }
  }
  return text;
}

export function themeCssVars(theme: ThemeConfig, brandColorOverride?: string): CSSProperties {
  const accent = brandColorOverride && brandColorOverride.toLowerCase() !== "#171717" ? brandColorOverride : theme.primaryColor;
  return {
    "--accent-solid": accent,
    /** Readable text on top of --accent-solid; see readableOn above. */
    "--accent-contrast": readableOn(accent),
    /** The accent used *as* text on the page background; see accentInk above. */
    "--accent-ink": accentInk(accent, theme.backgroundColor, theme.textColor),
    "--accent-from": accent,
    "--accent-to": accent,
    "--theme-secondary": theme.secondaryColor,
    "--theme-background": theme.backgroundColor,
    "--theme-surface": theme.surfaceColor,
    "--theme-text": theme.textColor,

    // The same palette, published under the app's own global token names.
    //
    // Those tokens are declared on :root and flipped by a
    // prefers-color-scheme media query, and most layouts paint from them
    // (bg-background, bg-surface, text-foreground) rather than from the
    // --theme-* names above. Without this, a visitor whose device is in dark
    // mode saw a near-black page whatever palette the owner had chosen, and
    // editing the theme appeared to do nothing at all. Redeclaring them here
    // scopes the owner's palette to their own site: an inline style on this
    // element beats :root, and it beats the media query with it.
    "--background": theme.backgroundColor,
    "--surface": theme.surfaceColor,
    // Nudged off the surface toward the text colour, so the "slightly recessed"
    // shade stays recessed for a dark palette as well as a light one.
    "--surface-muted": `color-mix(in srgb, ${theme.surfaceColor} 94%, ${theme.textColor})`,
    "--foreground": theme.textColor,
    "--border-subtle": `color-mix(in srgb, ${theme.textColor} 12%, transparent)`,

    // Deliberately no backgroundColor/color here. An inline style outranks
    // Tailwind classes, so painting them would override a layout that styles
    // its own shell - PORTFOLIO_HERO is `bg-zinc-950 text-white` on purpose,
    // and forcing it to a light palette left its white-on-dark text unreadable
    // against a white page. Layouts that want the themed palette opt in with
    // `bg-background text-foreground`, which reads the variables above.
    // Derived from the text color rather than fixed greys, so secondary text
    // and hairlines stay legible whether the client picked a light or a dark
    // palette - no per-theme "is this dark?" branch anywhere in the renderer.
    "--theme-text-muted": `color-mix(in srgb, ${theme.textColor} 62%, transparent)`,
    "--theme-border": `color-mix(in srgb, ${theme.textColor} 16%, transparent)`,
    "--theme-radius": `${theme.borderRadius}px`,
    "--theme-button-radius": BUTTON_RADIUS[theme.buttonStyle],
    "--theme-card-shadow": CARD_TREATMENT[theme.cardStyle].boxShadow,
    "--theme-card-border": CARD_TREATMENT[theme.cardStyle].border,
    "--theme-section-gap": SECTION_GAP[theme.sectionSpacing],
    "--theme-font-body": FONT_STACKS[theme.fontFamily],
    "--theme-font-heading": FONT_STACKS[theme.headingFontFamily],
    fontFamily: "var(--theme-font-body)",
  } as CSSProperties;
}

/** Inline style for a "product card" element (menu item / service card) - cardStyle + borderRadius. */
export function themeCardStyle(): CSSProperties {
  return {
    borderRadius: "var(--theme-radius)",
    boxShadow: "var(--theme-card-shadow)",
    border: "var(--theme-card-border)",
  };
}

/** Inline style for a heading element - headingFontFamily. */
export function themeHeadingStyle(): CSSProperties {
  return { fontFamily: "var(--theme-font-heading)" };
}

/**
 * Defensive client-side parse of a raw themeConfig string, merged over the
 * defaults. The backend is the real validation authority (see
 * ThemeConfigValidator) - this only guards against a stale/partial payload
 * so the renderer never crashes on an unexpected shape.
 */
export function parseThemeConfig(raw: string | null | undefined): ThemeConfig {
  if (!raw) return DEFAULT_THEME_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
    return { ...DEFAULT_THEME_CONFIG, ...parsed };
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

/** Used by the Super Admin theme editor to write Theme.themeConfig back as JSON. */
export function serializeThemeConfig(config: ThemeConfig): string {
  return JSON.stringify(config);
}

/**
 * The palette a template paints when its owner has not chosen one.
 *
 * Making the templates read the theme fixed a real bug - the theme editor was
 * a no-op on every portfolio - but on its own it cost something real too:
 * every website resolves to DEFAULT_THEME_CONFIG until somebody picks a theme,
 * so all four portfolios came out the same white. The dense CV template is
 * meant to be near-black and the gallery template is meant to be warm paper;
 * that is half of what makes them four templates rather than four layouts.
 *
 * So a template's own palette is its default, and the owner's choice replaces
 * it. Fonts, radii and spacing are never touched here - only the three colours
 * that decide whether the page reads light or dark.
 */
const SIGNATURE_PALETTES: Partial<Record<LayoutVariant, Pick<ThemeConfig, "backgroundColor" | "surfaceColor" | "textColor">>> = {
  // Professional / CV - a terminal, deliberately.
  PORTFOLIO_HERO: { backgroundColor: "#08090c", surfaceColor: "#101116", textColor: "#f4f4f5" },
  // Creative / Visual - warm paper, so photographs sit on something.
  PORTFOLIO_MINIMAL: { backgroundColor: "#f4f1ec", surfaceColor: "#e8e3db", textColor: "#1a1917" },
  // Freelancer / Services - clean and bright, because it is a sales page.
  PORTFOLIO_PROFILE: { backgroundColor: "#ffffff", surfaceColor: "#f6f6f7", textColor: "#16181d" },
  // Brand / Product - loud, heavy, dark.
  PORTFOLIO_BOLD: { backgroundColor: "#101014", surfaceColor: "#191920", textColor: "#f2f0eb" },
  // Bistro - warm and photographic, but light.
  MENU_BISTRO: { backgroundColor: "#ffffff", surfaceColor: "#ffffff", textColor: "#18181b" },
};

/**
 * Whether this theme's colours are still the built-in defaults - i.e. nobody
 * has picked a preset or saved an override, so the template should use its own.
 *
 * Only the three colours are compared. An owner who changed the font but not
 * the palette has not chosen a palette, and should still get the template's.
 */
function hasDefaultPalette(theme: ThemeConfig): boolean {
  return (
    theme.backgroundColor === DEFAULT_THEME_CONFIG.backgroundColor &&
    theme.surfaceColor === DEFAULT_THEME_CONFIG.surfaceColor &&
    theme.textColor === DEFAULT_THEME_CONFIG.textColor
  );
}

/**
 * The theme a template should actually render with: the owner's if they chose
 * one, the template's signature palette if they have not.
 */
export function effectiveTheme(theme: ThemeConfig, layoutVariant: LayoutVariant): ThemeConfig {
  const signature = SIGNATURE_PALETTES[layoutVariant];
  if (!signature || !hasDefaultPalette(theme)) return theme;
  return { ...theme, ...signature };
}
