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
}

export const EMPTY_DRAFT_CONTENT: DraftContent = {
  heroHeading: "",
  heroSubtitle: "",
  brandColor: "#171717",
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
