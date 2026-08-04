import type { CSSProperties } from "react";

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
export function themeCssVars(theme: ThemeConfig, brandColorOverride?: string): CSSProperties {
  const accent = brandColorOverride && brandColorOverride.toLowerCase() !== "#171717" ? brandColorOverride : theme.primaryColor;
  return {
    "--accent-solid": accent,
    "--accent-from": accent,
    "--accent-to": accent,
    "--theme-secondary": theme.secondaryColor,
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
