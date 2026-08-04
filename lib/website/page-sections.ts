import type { PageSectionType } from "@/lib/api/types";

/**
 * Per-type data shapes for owner-added page sections. The backend stores
 * `data` as opaque JSON (like DraftContent) - this module is the single
 * place that knows how to structure/parse/default each type, so every
 * layout design and the dashboard editor stay in sync.
 */
export interface AboutSectionData {
  heading: string;
  body: string;
  imageUrl: string | null;
}

export interface TestimonialItem {
  name: string;
  quote: string;
  imageUrl: string | null;
}
export interface TestimonialsSectionData {
  heading: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqSectionData {
  heading: string;
  items: FaqItem[];
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string | null;
}
export interface TeamSectionData {
  heading: string;
  items: TeamMember[];
}

export const SECTION_TYPE_LABELS: Record<PageSectionType, string> = {
  ABOUT: "About / Story",
  TESTIMONIALS: "Testimonials",
  FAQ: "FAQ",
  TEAM: "Team",
};

export const SECTION_TYPE_DESCRIPTIONS: Record<PageSectionType, string> = {
  ABOUT: "A heading, a paragraph, and an optional photo - your story, in your words.",
  TESTIMONIALS: "Quotes from happy customers, each with a name and optional photo.",
  FAQ: "A list of common questions and answers.",
  TEAM: "Introduce the people behind the business - name, role, and photo.",
};

export function emptySectionData(type: PageSectionType): AboutSectionData | TestimonialsSectionData | FaqSectionData | TeamSectionData {
  switch (type) {
    case "ABOUT":
      return { heading: "", body: "", imageUrl: null };
    case "TESTIMONIALS":
      return { heading: "What our customers say", items: [] };
    case "FAQ":
      return { heading: "Frequently asked questions", items: [] };
    case "TEAM":
      return { heading: "Meet the team", items: [] };
  }
}

export function parseSectionData<T>(raw: string, type: PageSectionType): T {
  try {
    return { ...emptySectionData(type), ...JSON.parse(raw) } as T;
  } catch {
    return emptySectionData(type) as T;
  }
}

export function serializeSectionData(data: unknown): string {
  return JSON.stringify(data);
}
