import type { SubscriptionResponse } from "@/lib/api/types";

/**
 * One reading of a subscription, shared by every screen that has an opinion
 * about it.
 *
 * The dashboard, the publish checklist, the lock banner and the subscription
 * page were each deciding for themselves what a status meant, and they stopped
 * agreeing the moment the zero-day trial bug produced rows that were EXPIRED
 * without ever having run: the checklist said "Your plan has stopped, so the
 * site can't go live" while the server cheerfully accepted every edit, because
 * the server treats such a row as "not started" rather than "stopped". An owner
 * was told they were locked out of a site they could still edit.
 *
 * These two functions mirror Subscription.hasEverRun and the guard's rule on
 * the backend. Anything that wants to know "is this website frozen" or "has
 * this owner had their trial" asks here.
 */

/**
 * Whether this subscription ever served a single day.
 *
 * False for the zero-length rows left behind when the configured trial length
 * was missing - endDate landed on startDate, so the next maintenance pass
 * expired a trial that had never begun. graceEndsAt is the tell that a payment
 * once succeeded, so anything ever paid for counts as having run whatever its
 * dates say.
 */
export function hasEverRun(subscription: SubscriptionResponse): boolean {
  if (subscription.graceEndsAt) return true;
  if (!subscription.startDate || !subscription.endDate) return true;
  return subscription.endDate > subscription.startDate;
}

/** The states in which the site is up and the owner can still change it. */
const LIVE_STATUSES: SubscriptionResponse["status"][] = ["TRIAL", "ACTIVE", "GRACE", "PENDING"];

/**
 * Whether the server is currently refusing writes on this website.
 *
 * Mirrors WebsiteAccessGuard: no subscription at all is not a lock (the site
 * has not published yet, and publishing opens its trial), and neither is a row
 * that never ran - that one still has its trial coming.
 */
export function isPlanLocked(subscription: SubscriptionResponse | null): boolean {
  if (!subscription) return false;
  if (!hasEverRun(subscription)) return false;
  return !LIVE_STATUSES.includes(subscription.status);
}

/**
 * Whether this website still has its free trial ahead of it - no subscription,
 * or one that never actually ran.
 */
export function trialStillAvailable(subscription: SubscriptionResponse | null): boolean {
  return !subscription || !hasEverRun(subscription);
}
