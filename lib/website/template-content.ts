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

/**
 * One fixed block in a template's page, named as that template names it.
 *
 * These are the template's identity, not a menu of options. A Services page has
 * a story, proof and an FAQ because that is what gets someone booked; a CV page
 * has a background and recommendations and no FAQ at all. Letting an owner add
 * whichever blocks they liked in whatever order is precisely what made all four
 * templates the same site in four palettes.
 */
export interface TemplateBlock {
  type: PageSectionType;
  /** What this template calls this block. */
  label: string;
  /** What belongs in it, in this template's terms. */
  hint: string;
}

export interface TemplateContentPlan {
  /** In the order this template leads with them. */
  sections: ContentSection[];
  /**
   * The blocks this template's page is made of, in the order it renders them.
   * Exactly one of each - a page has an About, not a list of them.
   */
  blocks: TemplateBlock[];
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
    blocks: [
      { type: "ABOUT", label: "Background", hint: "A short paragraph on how you got here and what you work on." },
      { type: "TESTIMONIALS", label: "Recommendations", hint: "What colleagues and clients say about working with you." },
    ],
  },

  // Creative / Visual - a gallery.
  PORTFOLIO_MINIMAL: {
    sections: [
      { key: "projects", label: "Work", hint: "Your pieces - each one opens full size" },
      { key: "services", label: "Disciplines", hint: "The kinds of work you take on" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "About & words", hint: "Your approach, and what clients say" },
    ],
    blocks: [
      { type: "ABOUT", label: "Approach", hint: "How you work, in your own words. Kept short - the work speaks first." },
      { type: "TESTIMONIALS", label: "Words", hint: "A line or two from the people you made it for." },
    ],
  },

  // Freelancer / Services - built to get booked, so the priced list comes first.
  PORTFOLIO_PROFILE: {
    sections: [
      { key: "services", label: "Packages", hint: "What you offer and what it costs" },
      { key: "projects", label: "Recent work", hint: "Proof, shown after your packages" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, proof, and the usual questions" },
    ],
    blocks: [
      { type: "ABOUT", label: "About you", hint: "Who you are and who you work with. Two or three sentences." },
      { type: "TESTIMONIALS", label: "Reviews", hint: "Proof from past clients - the thing that closes a booking." },
      { type: "FAQ", label: "Questions", hint: "What it costs, how soon you can start, what happens next." },
    ],
  },

  // Brand / Product - a shop front, so the things come first.
  PORTFOLIO_BOLD: {
    sections: [
      { key: "services", label: "Products", hint: "What you sell, with prices" },
      { key: "projects", label: "Work", hint: "What you have made" },
      GALLERY_PORTFOLIO,
      { key: "sections", label: "Story, team & reviews", hint: "How it is made, who makes it, what people say" },
    ],
    blocks: [
      { type: "ABOUT", label: "Story", hint: "How this started and how it gets made." },
      { type: "TEAM", label: "The people", hint: "Who makes it. A name and a role each." },
      { type: "TESTIMONIALS", label: "What people say", hint: "Short quotes from customers." },
    ],
  },

  MENU_CLASSIC: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, items and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "sections", label: "About & reviews", hint: "Your story, and what customers say" },
    ],
    blocks: [
      { type: "ABOUT", label: "About us", hint: "Your story, in a paragraph." },
      { type: "TESTIMONIALS", label: "Reviews", hint: "What customers say." },
    ],
  },

  MENU_GRID: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, items and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "delivery", label: "Delivery areas", hint: "Zones, fees and minimums" },
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, reviews, and the usual questions" },
    ],
    blocks: [
      { type: "ABOUT", label: "About us", hint: "Your story, in a paragraph." },
      { type: "TESTIMONIALS", label: "Reviews", hint: "What customers say." },
      { type: "FAQ", label: "Questions", hint: "Parking, reservations, delivery, dietary options." },
    ],
  },

  // Deliberately just a masthead, a search field and the dishes.
  MENU_ELEGANT: {
    sections: [{ key: "menu", label: "Menu", hint: "Categories, items and prices" }],
    blocks: [],
  },

  MENU_BISTRO: {
    sections: [
      { key: "menu", label: "Menu", hint: "Categories, combo boxes and prices" },
      { key: "gallery", label: "Gallery", hint: "Photos of the place" },
      { key: "delivery", label: "Delivery areas", hint: "Zones, fees and minimums" },
      { key: "sections", label: "About, reviews & FAQ", hint: "Your story, reviews, and the usual questions" },
    ],
    blocks: [
      { type: "ABOUT", label: "Our story", hint: "How the place started, and what it is about." },
      { type: "TEAM", label: "The kitchen", hint: "Who cooks. A name and a role each." },
      { type: "TESTIMONIALS", label: "Reviews", hint: "What customers say." },
      { type: "FAQ", label: "Questions", hint: "Parking, reservations, delivery, dietary options." },
    ],
  },
};

export function contentPlanFor(layoutVariant: LayoutVariant): TemplateContentPlan {
  return PLANS[layoutVariant] ?? PLANS.MENU_CLASSIC;
}

/** What this template calls one particular editor, for a page heading. */
export function sectionLabel(layoutVariant: LayoutVariant, key: ContentSection["key"], fallback: string): string {
  return contentPlanFor(layoutVariant).sections.find((section) => section.key === key)?.label ?? fallback;
}

/** Whether this template's page has a block of this type at all. */
export function rendersSectionType(layoutVariant: LayoutVariant, type: PageSectionType): boolean {
  return contentPlanFor(layoutVariant).blocks.some((block) => block.type === type);
}
