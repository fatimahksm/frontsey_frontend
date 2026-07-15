import type { CSSProperties } from "react";

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

/**
 * Inline CSS custom-property override so the owner's chosen brand color
 * cascades into every `var(--accent-*)` utility (buttons, gradient text,
 * hero decorations) on the public site. Skipped for the default neutral
 * value, since most sites never touch this field and shouldn't have their
 * theme's accent silently replaced with near-black.
 */
export function brandColorStyle(brandColor: string): CSSProperties {
  if (!brandColor || brandColor.toLowerCase() === EMPTY_DRAFT_CONTENT.brandColor.toLowerCase()) return {};
  return {
    "--accent-solid": brandColor,
    "--accent-from": brandColor,
    "--accent-to": brandColor,
  } as CSSProperties;
}
