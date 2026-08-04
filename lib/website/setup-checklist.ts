import { menuApi } from "@/lib/api/menu";
import { profileApi } from "@/lib/api/profile";
import { servicesApi } from "@/lib/api/services";
import { subscriptionApi } from "@/lib/api/subscription";
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

/** 0-100 readiness score used on the My Websites cards and the Overview page. */
export function readinessPercent(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  const complete = checklist.filter((item) => item.complete).length;
  return Math.round((complete / checklist.length) * 100);
}

/**
 * Fetches everything buildPublicationChecklist needs for one website. Shared
 * by the My Websites cards and the website Overview page so "readiness" is
 * computed identically everywhere instead of drifting between screens.
 */
export async function loadSetupStatus(accessToken: string, website: WebsiteResponse): Promise<ChecklistItem[]> {
  const [profile, subscription, contentCount] = await Promise.all([
    profileApi.get(accessToken, website.id).catch(() => null),
    subscriptionApi.get(accessToken, website.id).catch(() => null),
    website.templateType === "PORTFOLIO"
      ? servicesApi.list(accessToken, website.id).then((list) => list.length).catch(() => 0)
      : menuApi.listItems(accessToken, website.id).then((list) => list.length).catch(() => 0),
  ]);
  return buildPublicationChecklist({ website, profile, contentCount, subscription });
}
