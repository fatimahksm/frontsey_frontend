/**
 * Shape of the opaque JSON stored in WebsiteResponse.draftContent /
 * publishedContent (see UpdateDraftContentRequest javadoc on the backend -
 * it's deliberately opaque there since profile/menu/gallery/theme already
 * have their own tables; this only covers the freeform page copy those
 * tables don't model).
 */
export interface DraftContent {
  heroHeading: string;
  heroSubtitle: string;
  brandColor: string;
  /** Optional short highlight shown as a floating badge next to the hero photo (e.g. "3+ Years Experience"). Owner-entered; not rendered when blank. */
  heroBadge: string;
  /**
   * Link to a CV or resume, shown by the Professional / CV template.
   *
   * It lives here rather than in a new column because this blob is already
   * declared opaque on the backend - which is what lets the CV button ship
   * without a migration. Blank on every existing site, and a blank value
   * renders nothing.
   */
  cvUrl: string;
}

export const EMPTY_DRAFT_CONTENT: DraftContent = {
  heroHeading: "",
  heroSubtitle: "",
  brandColor: "#171717",
  heroBadge: "",
  cvUrl: "",
};

export function parseDraftContent(raw: string | null): DraftContent {
  if (!raw) return EMPTY_DRAFT_CONTENT;
  try {
    const parsed = JSON.parse(raw) as Partial<DraftContent>;
    return { ...EMPTY_DRAFT_CONTENT, ...parsed };
  } catch {
    return EMPTY_DRAFT_CONTENT;
  }
}

export function serializeDraftContent(content: DraftContent): string {
  return JSON.stringify(content);
}
