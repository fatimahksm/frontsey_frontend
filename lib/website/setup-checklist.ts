import { menuApi } from "@/lib/api/menu";
import { plansApi } from "@/lib/api/plans";
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
  /** Server-configured free-trial length, for the wording of the last item. */
  trialDays: number | null;
}): ChecklistItem[] {
  const { website, profile, contentCount, subscription, trialDays } = input;
  const hasContactInfo = Boolean(
    profile && (profile.phone || profile.whatsappNumber || profile.email || profile.address),
  );
  const contentLabel = website.templateType === "PORTFOLIO" ? "At least one service added" : "At least one menu item added";

  return [
    { key: "template", label: "Template selected", complete: true },
    { key: "businessName", label: "Business name added", complete: Boolean(website.businessName?.trim()) },
    { key: "contact", label: "Contact information added", complete: hasContactInfo },
    { key: "content", label: contentLabel, complete: contentCount > 0 },
    subscriptionItem(subscription, trialDays),
  ];
}

/**
 * The last item, which is no longer a wall.
 *
 * It used to read "Subscription active" and block Publish until somebody had
 * paid - so the one thing standing between a finished website and its own link
 * was a payment screen, before the owner had ever seen the link work. Since
 * publishing now opens the free trial, a website with no subscription is ready:
 * the item says what publishing will start rather than what is missing.
 *
 * It is still a real blocker in the states where the server would genuinely
 * refuse - an expired or canceled subscription, or a checkout left unpaid.
 */
function subscriptionItem(subscription: SubscriptionResponse | null, trialDays: number | null): ChecklistItem {
  if (!subscription) {
    return {
      key: "subscription",
      label: trialDays ? `Free ${trialDays}-day trial - starts when you publish` : "Free trial - starts when you publish",
      complete: true,
    };
  }
  switch (subscription.status) {
    case "TRIAL":
      return { key: "subscription", label: "Free trial running", complete: true };
    case "ACTIVE":
    case "GRACE":
      return { key: "subscription", label: "Subscription active", complete: true };
    default:
      return { key: "subscription", label: "Subscription needed", complete: false };
  }
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
  const [profile, subscription, contentCount, trialDays] = await Promise.all([
    profileApi.get(accessToken, website.id).catch(() => null),
    subscriptionApi.get(accessToken, website.id).catch(() => null),
    website.templateType === "PORTFOLIO"
      ? servicesApi.list(accessToken, website.id).then((list) => list.length).catch(() => 0)
      : menuApi.listItems(accessToken, website.id).then((list) => list.length).catch(() => 0),
    plansApi.trialDays().catch(() => null),
  ]);
  return buildPublicationChecklist({ website, profile, contentCount, subscription, trialDays });
}
