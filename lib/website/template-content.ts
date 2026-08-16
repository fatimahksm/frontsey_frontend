import type { LayoutVariant, PageSectionType } from "@/lib/api/types";

/**
 * What each template actually asks its owner for, and what it calls it.
 *
 * The four portfolio templates were rebuilt to present genuinely different
 * things - one leads with packages and prices, one with a gallery, one with
 * experience and a CV, one with products - but every one of them was edited
 * through the same undifferentiated list of sections in the same order. So a
 * salon owner on the Services template met "Projects" before "Packages", and a
 * developer on the CV template was offered an FAQ editor whose content their
 * site never renders.
 *
 * This is the single place that mapping lives. Both the console and the setup
 * area read it, so the editor's vocabulary and order match the page the owner
 * is actually looking at, and nothing offers to collect content that will not
 * appear anywhere.
 */

/** A content store, named as the current template names it. */
export interface ContentSection {
  /** Which editor this is - stable across templates, unlike the label. */
  key: "projects" | "services" | "menu" | "gallery" | "delivery" | "sections";
  /** What this template calls it. */
  label: string;
  /** One line saying what it is for, in this template's terms. */
  hint: string;
}

export interface TemplateContentPlan {
  /** In the order this template leads with them. */
  sections: ContentSection[];
  /**
   * The extra section types this template renders. Anything outside this set
   * is content the owner can still write, but their current template will not
   * show - which the editor says rather than letting them discover it.
   */
  rendersSectionTypes: PageSectionType[];
}

const GALLERY_PORTFOLIO: ContentSection = {
  key: "gallery",
  label: "Gallery",
  hint: "Extra photos, shown alongside your work",
};

const PLANS: Record<LayoutVariant, TemplateContentPlan> = {
  // Professional / CV - a hiring manager reading a background.
  PORTFOLIO_HERO: {
    sections: [
      { key: "projects", label: "Projects", hint: "What you have built, with dates and links" },
      { key: "services", label: "Skills & services", hint: "What you can be hired to do" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "About & recommendations", hint: "Your background, and what people say" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS"],
  },

  // Creative / Visual - a gallery.
  PORTFOLIO_MINIMAL: {
    sections: [
      { key: "projects", label: "Work", hint: "Your pieces - each one opens full size" },
      { key: "services", label: "Disciplines", hint: "The kinds of work you take on" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "About & words", hint: "Your approach, and what clients say" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS"],
  },

  // Freelancer / Services - built to get booked, so the priced list comes first.
  PORTFOLIO_PROFILE: {
    sections: [
      { key: "services", label: "Packages", hint: "What you offer and what it costs" },
      { key: "projects", label: "Recent work", hint: "Proof, shown after your packages" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, proof, and the usual questions" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS", "FAQ"],
  },

  // Brand / Product - a shop front, so the things come first.
  PORTFOLIO_BOLD: {
    sections: [
      { key: "services", label: "Products", hint: "What you sell, with prices" },
      { key: "projects", label: "Work", hint: "What you have made" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "Story, team & reviews", hint: "How it is made, who makes it, what people say" },
    ],
    rendersSectionTypes: ["ABOUT", "TEAM", "TESTIMONIALS"],
  },

  MENU_CLASSIC: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, items and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "sections", label: "About & reviews", hint: "Your story, and what customers say" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS", "FAQ", "TEAM"],
  },

  MENU_GRID: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, items and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "delivery", label: "Delivery areas", hint: "Zones, fees and minimums" },
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, reviews, and the usual questions" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS", "FAQ", "TEAM"],
  },

  // Deliberately just a masthead, a search field and the dishes.
  MENU_ELEGANT: {
    sections: [{ key: "menu", label: "Menu", hint: "Categories, items and prices" }],
    rendersSectionTypes: [],
  },

  MENU_BISTRO: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, combo boxes and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "delivery", label: "Delivery areas", hint: "Zones, fees and minimums" },
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, reviews, and the usual questions" },
    ],
    rendersSectionTypes: ["ABOUT", "TESTIMONIALS", "FAQ", "TEAM"],
  },
};

export function contentPlanFor(layoutVariant: LayoutVariant): TemplateContentPlan {
  return PLANS[layoutVariant] ?? PLANS.MENU_CLASSIC;
}

/** What this template calls one particular editor, for a page heading. */
export function sectionLabel(layoutVariant: LayoutVariant, key: ContentSection["key"], fallback: string): string {
  return contentPlanFor(layoutVariant).sections.find((section) => section.key === key)?.label ?? fallback;
}

/** Whether content of this type would appear anywhere on the current template. */
export function rendersSectionType(layoutVariant: LayoutVariant, type: PageSectionType): boolean {
  return contentPlanFor(layoutVariant).rendersSectionTypes.includes(type);
}
