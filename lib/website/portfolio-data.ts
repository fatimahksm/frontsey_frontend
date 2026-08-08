import type { PublicPageSection, PublicProject, PublicService, PublicWebsiteResponse } from "@/lib/api/types";
import {
  parseSectionData,
  type AboutSectionData,
  type FaqSectionData,
  type TeamSectionData,
  type TestimonialsSectionData,
} from "@/lib/website/page-sections";
import { parseDraftContent } from "@/lib/website/draft-content";
import { whatsappUrl } from "@/lib/site/whatsapp";

/**
 * One piece of work, in vocabulary that fits every trade.
 *
 * The four templates used to each reach into the ABOUT section's free-form JSON
 * for their own differently-named metadata - `projectMeta` for the developer,
 * `workMeta` for the designer, `caseMeta` for the agency - which meant a real
 * owner had no way to fill any of it in and ended up with untitled pictures
 * while the samples looked finished. This is the single shape all four now
 * present, sourced from the projects editor first and the older shapes after,
 * so nothing saved before this change loses content.
 *
 * Deliberately neutral names: `subtitle` is a developer's role, a designer's
 * discipline, a photographer's category and a contractor's job type. Nothing
 * here assumes a profession.
 */
export interface WorkItem {
  /** Stable key for React and for anchors. Never blank. */
  id: string;
  /** Owner-written title. May be empty - templates must not invent one. */
  title: string;
  /** Role, discipline, category - whatever the owner called this kind of work. */
  subtitle: string;
  /** Free text, usually a year or a date range. */
  year: string;
  /** A sentence or two about the work. */
  summary: string;
  /** Short labels: tools, materials, services, anything. */
  tags: string[];
  imageUrl: string | null;
  /** Where the work lives - a site, a listing, a video. */
  liveUrl: string | null;
  /** A secondary reference - source, a case write-up, a spec sheet. */
  repoUrl: string | null;
}

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
  /**
   * The owner's work, titled and described - the shape every template presents.
   * Falls back to bare gallery images when the site has no projects yet, so an
   * older saved site still shows its pictures.
   */
  items: WorkItem[];

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

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(str).filter((s) => s.length > 0);
}

function url(value: unknown): string | null {
  const s = str(value);
  return s.length > 0 ? s : null;
}

/**
 * The pre-editor metadata shapes, read leniently.
 *
 * Each template invented its own key under the ABOUT section, and each used
 * slightly different field names. Reading all of them here - rather than one
 * per template - is what lets a site keep its content after switching template,
 * which it previously lost.
 */
function legacyWorkMeta(extra: Record<string, unknown>): Record<string, unknown>[] {
  const about = (extra.ABOUT ?? {}) as Record<string, unknown>;
  for (const key of ["projectMeta", "workMeta", "caseMeta", "projects"]) {
    const value = about[key];
    if (Array.isArray(value)) {
      const rows = value.filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v));
      if (rows.length > 0) return rows;
    }
  }
  return [];
}

/**
 * Builds the unified work list.
 *
 * Precedence is projects first, then gallery images paired with whatever legacy
 * metadata the site carries. The two are never merged: a site that has adopted
 * the projects editor is described entirely by it, so deleting a project there
 * actually removes it rather than leaving a ghost from the gallery.
 */
function deriveItems(projects: PublicProject[], gallery: string[], extra: Record<string, unknown>): WorkItem[] {
  if (projects.length > 0) {
    return projects.map((p, i) => ({
      id: p.id || `project-${i}`,
      title: str(p.name),
      subtitle: str(p.discipline),
      year: str(p.year),
      summary: str(p.summary),
      tags: strList(p.tags),
      imageUrl: url(p.imageUrl),
      liveUrl: url(p.liveUrl),
      repoUrl: url(p.repoUrl),
    }));
  }

  const meta = legacyWorkMeta(extra);
  // A site can have more descriptions than pictures, or the reverse; both are
  // shown rather than silently truncated to the shorter list.
  const count = Math.max(gallery.length, meta.length);
  const items: WorkItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const m = meta[i] ?? {};
    items.push({
      id: gallery[i] ?? `work-${i}`,
      title: str(m.name) || str(m.title),
      subtitle: str(m.role) || str(m.discipline) || str(m.category),
      year: str(m.year),
      summary: str(m.summary) || str(m.result) || str(m.description),
      tags: strList(m.tech ?? m.tags ?? m.tools),
      imageUrl: gallery[i] ?? url(m.imageUrl),
      liveUrl: url(m.live) || url(m.liveUrl),
      repoUrl: url(m.repo) || url(m.repoUrl),
    });
  }
  return items;
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
    items: deriveItems(site.projects ?? [], site.galleryImageUrls ?? [], extra),

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
  /** Selected projects, presented as alternating full-width rows. */
  projects: WorkItem[];
  /** Capabilities, from the owner's services. */
  expertise: PublicService[];
  /** Professional recommendations. */
  recommendations: TestimonialsSectionData["items"];
}

export function getDeveloperData(data: PortfolioData): DeveloperData {
  return { ...data, projects: data.items, expertise: data.offerings, recommendations: data.testimonials };
}

export interface DesignerData extends PortfolioData {
  /** Selected work, shown as an index rather than cards. */
  selectedWork: WorkItem[];
  /** Disciplines, from the owner's services. */
  disciplines: PublicService[];
}

export function getDesignerData(data: PortfolioData): DesignerData {
  return { ...data, selectedWork: data.items, disciplines: data.offerings };
}

export interface AgencyData extends PortfolioData {
  /** Case studies, from the owner's projects. */
  caseStudies: WorkItem[];
  /** The agency's services - the centrepiece of this template. */
  services: PublicService[];
  /** Client results. */
  reviews: TestimonialsSectionData["items"];
}

export function getAgencyData(data: PortfolioData): AgencyData {
  return { ...data, caseStudies: data.items, services: data.offerings, reviews: data.testimonials };
}

export interface FreelancerData extends PortfolioData {
  /** Selected projects, presented as stacked panels. */
  projects: WorkItem[];
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
    projects: data.items,
    expertise: data.offerings,
    recommendations: data.testimonials,
    story: data.bio,
  };
}

/**
 * The one link a visitor should follow to get in touch.
 *
 * All four templates used to derive this inline as email-or-WhatsApp, which
 * silently dropped the case that turns out to be the most common one: an owner
 * who fills in a phone number and nothing else. Their site rendered a "Let's
 * work together" panel with no way to act on it. Phone is now the last resort
 * rather than no resort.
 */
export function primaryContactHref(data: PortfolioData): string | null {
  if (data.contact.email) return `mailto:${data.contact.email}`;
  if (data.contact.whatsappNumber) return whatsappUrl(data.contact.whatsappNumber, "");
  if (data.contact.phone) return `tel:${data.contact.phone.replace(/\s+/g, "")}`;
  return null;
}

/**
 * How much of a portfolio the owner has actually filled in.
 *
 * The templates each hide their empty sections, which is right for a live site
 * but produces the complaint that started this: a site with a name and two
 * pictures renders as a tall hero, a strip of images and nothing else, and
 * looks broken rather than minimal. Templates use this to decide when to switch
 * to a deliberately compact single-screen layout instead of a page with holes
 * in it, and the dashboard uses it to tell the owner what is still missing.
 */
export interface PortfolioCompleteness {
  /** Sections with content, in the order a visitor meets them. */
  present: PortfolioSectionKey[];
  /** Sections a template would render if they were filled. */
  missing: PortfolioSectionKey[];
  /**
   * True when there is too little to justify a full multi-section page.
   * A page needs work plus one other substantial block to stand up.
   */
  isSparse: boolean;
  /** 0-100, for the dashboard's progress readout. Never a promise about design. */
  score: number;
}

export type PortfolioSectionKey = "intro" | "work" | "services" | "about" | "testimonials" | "faq" | "contact";

/** Ordered so `missing` reads as a to-do list rather than an arbitrary set. */
const SECTION_ORDER: PortfolioSectionKey[] = ["intro", "work", "services", "about", "testimonials", "faq", "contact"];

export function getCompleteness(data: PortfolioData): PortfolioCompleteness {
  const filled: Record<PortfolioSectionKey, boolean> = {
    intro: data.headline.length > 0 || data.subheadline.length > 0,
    work: data.items.length > 0,
    services: data.offerings.length > 0,
    about: data.bio.length > 0,
    testimonials: data.testimonials.length > 0,
    faq: data.faq.length > 0,
    contact: Boolean(data.contact.email || data.contact.phone || data.contact.whatsappNumber || data.contact.address),
  };

  const present = SECTION_ORDER.filter((k) => filled[k]);
  const missing = SECTION_ORDER.filter((k) => !filled[k]);

  // "Substantial" means a block a visitor reads, not a line of contact detail -
  // a page carried by its footer is exactly the case this is meant to catch.
  const substantial = (["work", "services", "about", "testimonials"] as const).filter((k) => filled[k]).length;

  return {
    present,
    missing,
    isSparse: !filled.work || substantial < 2,
    score: Math.round((present.length / SECTION_ORDER.length) * 100),
  };
}
