import type { BusinessProfileResponse, SubscriptionResponse, WebsiteResponse } from "@/lib/api/types";

export interface ChecklistItem {
  key: string;
  label: string;
  complete: boolean;
}

/**
 * Mirrors (loosely) the backend's mandatory-publication-field checks in
 * WebsiteService.validateMandatoryPublicationFields - this is UX guidance
 * only, shown before publishing so the owner isn't surprised by a rejected
 * publish request. The backend remains the source of truth/enforcement.
 */
export function buildPublicationChecklist(input: {
  website: WebsiteResponse;
  profile: BusinessProfileResponse | null;
  contentCount: number;
  subscription: SubscriptionResponse | null;
}): ChecklistItem[] {
  const { website, profile, contentCount, subscription } = input;
  const hasContactInfo = Boolean(
    profile && (profile.phone || profile.whatsappNumber || profile.email || profile.address),
  );
  const contentLabel = website.templateType === "PORTFOLIO" ? "At least one service added" : "At least one menu item added";
  const subscriptionActive = subscription?.status === "ACTIVE" || subscription?.status === "GRACE";

  return [
    { key: "template", label: "Template selected", complete: true },
    { key: "businessName", label: "Business name added", complete: Boolean(website.businessName?.trim()) },
    { key: "contact", label: "Contact information added", complete: hasContactInfo },
    { key: "content", label: contentLabel, complete: contentCount > 0 },
    { key: "subscription", label: "Subscription active", complete: subscriptionActive },
  ];
}
