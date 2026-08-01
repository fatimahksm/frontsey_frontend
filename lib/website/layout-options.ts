import type { LayoutVariant, TemplateType } from "@/lib/api/types";

/**
 * Friendly, non-technical labels for TemplateType and LayoutVariant - the
 * only place these are defined. Previously duplicated between the creation
 * wizard and the post-creation Layout tab; centralized here so the two
 * surfaces can never drift apart.
 */
export const WEBSITE_TYPES: { value: TemplateType; icon: string; label: string; description: string }[] = [
  {
    value: "MENU_ORDERING",
    icon: "🍽️",
    label: "Restaurant / Café Menu",
    description: "Categories, items, sizes/add-ons, and optional WhatsApp ordering. For cafes, restaurants, shops.",
  },
  {
    value: "PORTFOLIO",
    icon: "🎨",
    label: "Portfolio / Services",
    description: "A services showcase with no cart. For salons, studios, agencies, and similar businesses.",
  },
];

export const TEMPLATE_OPTIONS: Record<TemplateType, { value: LayoutVariant; label: string; description: string }[]> = {
  MENU_ORDERING: [
    { value: "MENU_CLASSIC", label: "Classic Menu", description: "Business-card header, gallery strip, categorized list, cart sidebar." },
    { value: "MENU_GRID", label: "Modern Grid", description: "Full-width cover, sticky category tabs, items as a card grid, cart drawer." },
    { value: "MENU_ELEGANT", label: "Elegant Restaurant", description: "Fine-dining style list with dotted price leaders and a minimal bottom cart bar." },
  ],
  PORTFOLIO: [
    { value: "PORTFOLIO_HERO", label: "Hero Portfolio", description: "Full-bleed dark hero, centered content, services grid, work gallery." },
    { value: "PORTFOLIO_MINIMAL", label: "Minimal Portfolio", description: "Warm editorial personal-site style - serif type, About block, and a project grid." },
    { value: "PORTFOLIO_BOLD", label: "Bold Portfolio", description: "Vibrant creative-agency style with bold type and a masonry work gallery." },
  ],
};

export function defaultLayoutVariant(templateType: TemplateType): LayoutVariant {
  return TEMPLATE_OPTIONS[templateType][0].value;
}

export function templateLabel(variant: LayoutVariant, templateType: TemplateType): string {
  return TEMPLATE_OPTIONS[templateType].find((option) => option.value === variant)?.label ?? variant;
}
