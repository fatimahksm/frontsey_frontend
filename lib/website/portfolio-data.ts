import type { PublicPageSection, PublicService, PublicWebsiteResponse } from "@/lib/api/types";
import {
  parseSectionData,
  type AboutSectionData,
  type FaqSectionData,
  type TeamSectionData,
  type TestimonialsSectionData,
} from "@/lib/website/page-sections";
import { parseDraftContent } from "@/lib/website/draft-content";

/**
 * One read-only view of a website's content, for the Portfolio templates to
 * present in four different ways.
 *
 * The four templates are meant to be four different *kinds* of site - a
 * developer's, a designer's, an agency's, a freelancer's - not one page in four
 * palettes. That difference is in what each one leads with and what it calls
 * things, which means each template reaches for the same underlying data under
 * a different name: `services` is "expertise" to a developer, "disciplines" to
 * a designer, "services" to an agency. Doing that renaming inline in every
 * template is how the four drift apart and start crashing on different empty
 * cases.
 *
 * So the shape below is derived once, defensively, and the per-template
 * adapters underneath it only rename and re-order - they never fetch, never
 * mutate the response, and never invent content.
 *
 * Nothing here changes the data model. Every field is derived from what
 * `PublicWebsiteResponse` already carries, so an existing saved site and the
 * existing mock preview both flow through unchanged. Optional additions
 * (project links, tech tags, experience) belong in the section payloads, which
 * are already free-form JSON - see `extra` below.
 */
export interface PortfolioData {
  /** Business/person name. Always present. */
  name: string;
  /** Owner-written headline; empty string when unset, never undefined. */
  headline: string;
  /** Owner-written sub-headline. */
  subheadline: string;
  /** Short highlight the owner set (e.g. "5+ years"). Empty when unset. */
  badge: string;
  /**
   * The owner's quick accent override, or empty when they never set one.
   * Templates pass it to `themeCssVars` so a brand colour reaches the accent
   * without the template having to re-parse the published content itself.
   */
  brandColor: string;

  /** Long-form description, from the profile or an About section. */
  bio: string;
  /** Portrait/illustration for the About block, if one was given. */
  bioImageUrl: string | null;

  logoUrl: string | null;
  coverImageUrl: string | null;

  /** Priced or described offerings. Empty array, never undefined. */
  offerings: PublicService[];
  /** Gallery image URLs, in the owner's order. */
  work: string[];

  team: TeamSectionData["items"];
  testimonials: TestimonialsSectionData["items"];
  faq: FaqSectionData["items"];

  contact: {
    phone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    address: string | null;
    googleMapsUrl: string | null;
  };
  /** Only the socials actually set, so a template can render "some or none" without null checks. */
  socials: { label: string; href: string }[];

  openingHours: PublicWebsiteResponse["openingHours"];

  /**
   * Whether this is the design gallery's sample site rather than a real one.
   *
   * Templates may show illustrative content in a preview that they must never
   * fabricate on a published site - invented project counts or client results
   * on someone's real website would be a lie told in their name.
   */
  isSample: boolean;

  /**
   * Section payloads that carried keys beyond the documented shape, keyed by
   * section type.
   *
   * Section `data` is stored as free-form JSON, so richer content (a project's
   * tech tags and repo link, an experience timeline) can be added there without
   * a schema change or a migration. Templates must treat every key as absent
   * until proven otherwise.
   */
  extra: Record<string, unknown>;
}

/** Reads a section's parsed payload, or null when the site has no section of that type. */
function sectionOf<T>(sections: PublicPageSection[], type: PublicPageSection["type"]): T | null {
  const section = sections.find((s) => s.type === type);
  if (!section) return null;
  try {
    return parseSectionData<T>(section.data, type);
  } catch {
    // A malformed payload must not take the page down; the section is simply
    // treated as absent, which every consumer already handles.
    return null;
  }
}

/**
 * Derives the view above from a public website response.
 *
 * Pure: the response is never mutated, and calling this twice with the same
 * input gives the same result.
 */
export function normalizePortfolioData(site: PublicWebsiteResponse, options: { isSample?: boolean } = {}): PortfolioData {
  const content = parseDraftContent(site.publishedContent);
  const sections = site.sections ?? [];

  const about = sectionOf<AboutSectionData>(sections, "ABOUT");
  const team = sectionOf<TeamSectionData>(sections, "TEAM");
  const testimonials = sectionOf<TestimonialsSectionData>(sections, "TESTIMONIALS");
  const faq = sectionOf<FaqSectionData>(sections, "FAQ");

  const profile = site.profile ?? null;

  const socials = [
    { label: "Instagram", href: profile?.instagramUrl },
    { label: "TikTok", href: profile?.tiktokUrl },
  ].filter((s): s is { label: string; href: string } => typeof s.href === "string" && s.href.length > 0);

  const extra: Record<string, unknown> = {};
  for (const section of sections) {
    try {
      const parsed: unknown = JSON.parse(section.data);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        extra[section.type] = parsed;
      }
    } catch {
      // Not valid JSON - nothing to expose, and the typed readers above have
      // already fallen back for this section.
    }
  }

  return {
    name: site.businessName,
    headline: content.heroHeading ?? "",
    subheadline: content.heroSubtitle ?? "",
    badge: content.heroBadge ?? "",
    brandColor: content.brandColor ?? "",

    // The About section is the longer, deliberately-written piece where it
    // exists; the profile description is the fallback every site has.
    bio: about?.body || profile?.description || "",
    bioImageUrl: about?.imageUrl ?? null,

    logoUrl: profile?.logoUrl ?? null,
    coverImageUrl: profile?.coverImageUrl ?? null,

    offerings: site.services ?? [],
    work: site.galleryImageUrls ?? [],

    team: team?.items ?? [],
    testimonials: testimonials?.items ?? [],
    faq: faq?.items ?? [],

    contact: {
      phone: profile?.phone ?? null,
      whatsappNumber: profile?.whatsappNumber ?? null,
      email: profile?.email ?? null,
      address: profile?.address ?? null,
      googleMapsUrl: profile?.googleMapsUrl ?? null,
    },
    socials,

    openingHours: site.openingHours ?? [],

    isSample: options.isSample ?? false,

    extra,
  };
}

/**
 * What each template calls the shared data, plus the order it leads with.
 *
 * These exist so a template's own components can read `data.projects` or
 * `data.disciplines` and read naturally, without each template inventing its
 * own mapping inline. They add no content - anything absent upstream is absent
 * here too, as an empty array rather than undefined.
 */

export interface DeveloperData extends PortfolioData {
  /** Selected projects - the gallery, presented as case studies. */
  projects: string[];
  /** Capabilities, from the owner's services. */
  expertise: PublicService[];
  /** Professional recommendations. */
  recommendations: TestimonialsSectionData["items"];
}

export function getDeveloperData(data: PortfolioData): DeveloperData {
  return { ...data, projects: data.work, expertise: data.offerings, recommendations: data.testimonials };
}

export interface DesignerData extends PortfolioData {
  /** Selected work, shown as an index rather than cards. */
  selectedWork: string[];
  /** Disciplines, from the owner's services. */
  disciplines: PublicService[];
}

export function getDesignerData(data: PortfolioData): DesignerData {
  return { ...data, selectedWork: data.work, disciplines: data.offerings };
}

export interface AgencyData extends PortfolioData {
  /** Case studies, from the gallery. */
  caseStudies: string[];
  /** The agency's services - the centrepiece of this template. */
  services: PublicService[];
  /** Client results. */
  reviews: TestimonialsSectionData["items"];
}

export function getAgencyData(data: PortfolioData): AgencyData {
  return { ...data, caseStudies: data.work, services: data.offerings, reviews: data.testimonials };
}

export interface FreelancerData extends PortfolioData {
  /** Selected projects, presented as stacked panels. */
  projects: string[];
  /** What they do, from services. */
  expertise: PublicService[];
  /** Recommendations, more personal than an agency's reviews. */
  recommendations: TestimonialsSectionData["items"];
  /** The personal story - the About body. */
  story: string;
}

export function getFreelancerData(data: PortfolioData): FreelancerData {
  return {
    ...data,
    projects: data.work,
    expertise: data.offerings,
    recommendations: data.testimonials,
    story: data.bio,
  };
}
