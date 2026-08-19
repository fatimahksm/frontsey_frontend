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
  /**
   * For a MENU_ORDERING website: whether this business serves food or sells
   * things.
   *
   * The four menu layouts work identically either way - categories, items,
   * prices, optional ordering - but every sample, label and preview behind
   * them was a restaurant, so a shop owner had no way to see themselves in it.
   * This only changes the vocabulary and the sample content, never the layout.
   *
   * Lives in this blob for the same reason cvUrl does: it is already opaque on
   * the backend, so this ships without a migration. Absent on every existing
   * website, and absent means FOOD, which is exactly what those websites are.
   */
  menuBusinessKind: MenuBusinessKind;
}

/** What a MENU_ORDERING website is actually selling. */
export type MenuBusinessKind = "FOOD" | "SHOP";

export const EMPTY_DRAFT_CONTENT: DraftContent = {
  heroHeading: "",
  heroSubtitle: "",
  brandColor: "#171717",
  heroBadge: "",
  cvUrl: "",
  menuBusinessKind: "FOOD",
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

/** The two things a MENU_ORDERING website can be, as the picker words them. */
export const MENU_BUSINESS_KINDS: { value: MenuBusinessKind; label: string; description: string }[] = [
  { value: "FOOD", label: "Food & drink", description: "A restaurant, cafe, bakery or anything cooked to order." },
  { value: "SHOP", label: "Products", description: "A shop selling things - homeware, clothes, gifts, accessories." },
];
