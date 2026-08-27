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
    icon: "🧾",
    // Was "Restaurant / Café Menu" with a plate icon, which read as
    // food-only however the description ended. The same four layouts list a
    // shop's stock exactly as well; step 1 asks which, and the samples,
    // labels and previews follow that answer from there on.
    label: "Menu or product list",
    description: "Categories, items, sizes/add-ons, and optional WhatsApp ordering. For restaurants and cafes, and for shops of any kind.",
  },
  {
    value: "PORTFOLIO",
    icon: "🎨",
    label: "Portfolio / Services",
    description: "A services showcase with no cart. For salons, studios, agencies, and similar businesses.",
  },
  {
    value: "EVENTS",
    icon: "🎉",
    label: "Event page",
    description: "One occasion and the photos from it - when, where, the running order of the day. For weddings, engagements, graduations, and parties.",
  },
];

export interface TemplateOption {
  value: LayoutVariant;
  label: string;
  description: string;
  /**
   * Concrete jobs this template suits, shown in the picker.
   *
   * The four portfolio templates were each built around one profession, and it
   * showed: a photographer looking at "Hero Portfolio" had no way to tell it
   * was meant for them too. Naming the audience is what turns four looks into
   * four choices - so this list is the picker's actual content, not decoration,
   * and every template covers a family of trades rather than one job title.
   */
  bestFor?: string[];
}

export const TEMPLATE_OPTIONS: Record<TemplateType, TemplateOption[]> = {
  MENU_ORDERING: [
    { value: "MENU_CLASSIC", label: "Classic Menu", description: "A simple price list to read - business-card header, gallery strip, categories with sub-categories. No cart or ordering." },
    { value: "MENU_GRID", label: "Modern Grid", description: "Full-width cover, sticky category tabs, items as a card grid, cart drawer." },
    { value: "MENU_ELEGANT", label: "Elegant Restaurant", description: "Fine-dining style list with dotted price leaders and a minimal bottom cart bar." },
    { value: "MENU_BISTRO", label: "Bistro Menu", description: "Warm, photography-led cafe style - bold headline hero, combo box deals, and a sticky-filtered card-grid menu." },
  ],
  PORTFOLIO: [
    {
      value: "PORTFOLIO_PROFESSIONAL",
      label: "Professional / CV",
      description: "Your background as a hiring manager reads it: experience, skills, projects and a downloadable CV, in a dense dark layout that stays scannable.",
      bestFor: ["Developer", "Engineer", "Accountant", "Student", "Consultant", "Analyst"],
    },
    {
      value: "PORTFOLIO_VISUAL",
      label: "Creative / Visual",
      description: "Pictures first and words second - large editorial compositions with a caption beside each one, on warm paper.",
      bestFor: ["Designer", "Photographer", "Architect", "Artist", "Fashion", "Videographer"],
    },
    {
      value: "PORTFOLIO_SERVICES",
      label: "Freelancer / Services",
      description: "Built to get you booked: what you offer and what it costs, proof from past clients, answers to the usual questions, and a contact button that is never far away.",
      bestFor: ["Coach", "Marketer", "Social media manager", "Trainer", "Makeup artist", "Tutor"],
    },
    {
      value: "PORTFOLIO_BRAND",
      label: "Brand / Product",
      description: "A loud front page for something you have made - your story, featured items, and your social links, in heavy type and full-strength colour.",
      bestFor: ["Small business", "Creator", "Personal brand", "Product maker", "Studio", "Shop"],
    },
  ],
  EVENTS: [
    {
      value: "EVENTS_CELEBRATION",
      label: "Celebration",
      description: "The invitation and the album in one page: who and what, when and where, the running order of the day, and the photographs afterwards.",
      bestFor: ["Wedding", "Engagement", "Graduation", "Birthday", "Anniversary", "Party"],
    },
  ],
};

/**
 * Layouts that render no cart at all. Picking one is itself the "this is a
 * read-only menu" decision: the backend pins such a website's OrderingMode to
 * DISPLAY_ONLY (LayoutVariant.isDisplayOnly), so the dashboard must not offer
 * an ordering choice that would be silently overridden.
 */
const DISPLAY_ONLY_LAYOUTS = new Set<LayoutVariant>([
  "MENU_CLASSIC",
  "MENU_ELEGANT",
  "PORTFOLIO_PROFESSIONAL",
  "PORTFOLIO_VISUAL",
  "PORTFOLIO_BRAND",
  "PORTFOLIO_SERVICES",
  // An invitation has nothing to sell.
  "EVENTS_CELEBRATION",
]);

export function isDisplayOnlyLayout(variant: LayoutVariant): boolean {
  return DISPLAY_ONLY_LAYOUTS.has(variant);
}

/**
 * The templates of this kind that are actually on offer.
 *
 * TEMPLATE_OPTIONS describes every template the code can render; whether one
 * may be chosen right now is the Super Admin's call, carried in
 * template_prices.active and fetched via plansApi.offeredTemplates(). Passing
 * `null` (not yet loaded, or the request failed) shows the full list rather
 * than an empty picker - a momentary lookup failure should not make the
 * product look broken, and the server refuses a withdrawn template anyway.
 */
export function offeredTemplates(
  templateType: TemplateType,
  offered: Set<LayoutVariant> | null,
): TemplateOption[] {
  const all = TEMPLATE_OPTIONS[templateType];
  if (!offered) return all;
  return all.filter((option) => offered.has(option.value));
}

/** The kinds of website with at least one template on offer. */
export function offeredWebsiteTypes(offered: Set<LayoutVariant> | null) {
  if (!offered) return WEBSITE_TYPES;
  return WEBSITE_TYPES.filter((type) => offeredTemplates(type.value, offered).length > 0);
}

export function defaultLayoutVariant(templateType: TemplateType): LayoutVariant {
  return TEMPLATE_OPTIONS[templateType][0].value;
}

/** The first template of this kind that may actually be chosen. */
export function defaultOfferedLayoutVariant(
  templateType: TemplateType,
  offered: Set<LayoutVariant> | null,
): LayoutVariant {
  return offeredTemplates(templateType, offered)[0]?.value ?? defaultLayoutVariant(templateType);
}

export function templateLabel(variant: LayoutVariant, templateType: TemplateType): string {
  return TEMPLATE_OPTIONS[templateType].find((option) => option.value === variant)?.label ?? variant;
}
