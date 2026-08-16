"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { friendlyMessage } from "@/lib/api/client";
import { plansApi } from "@/lib/api/plans";
import { subscriptionApi } from "@/lib/api/subscription";
import type { MockPaymentResponse, MockPaymentStatus, PlanResponse, SubscriptionResponse } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useWebsite } from "@/lib/website/website-context";

/**
 * What this website's subscription actually is, and what happens next.
 *
 * The old page put a status chip and three ISO dates in a box and left the
 * owner to work out the rest: which of the four plan cards was theirs, why the
 * others did nothing when a plan was running, and how long they had. All three
 * are stated outright here.
 */

const STATUS_TONE = {
  PENDING: "warning",
  TRIAL: "success",
  ACTIVE: "success",
  GRACE: "warning",
  EXPIRED: "danger",
  CANCELED: "danger",
} as const;

const STATUS_LABEL: Record<SubscriptionResponse["status"], string> = {
  PENDING: "Waiting for payment",
  // The heading already says "Free trial"; the badge says whether the site is up.
  TRIAL: "Live",
  ACTIVE: "Active",
  GRACE: "Grace period",
  EXPIRED: "Expired",
  CANCELED: "Canceled",
};

/** Whole days from now until `iso`, floored at 0. Null when there is no date. */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}

function dayCount(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

/**
 * One plain sentence about where this website stands, in the terms that matter
 * to the person paying: is my site up, and when do I have to do something.
 */
function statusSentence(subscription: SubscriptionResponse): string {
  const left = daysUntil(subscription.endDate);
  switch (subscription.status) {
    case "TRIAL":
      return left === 0
        ? "Your free trial ends today. Subscribe now to keep your site online."
        : `Your site is live on the free trial. ${dayCount(left ?? 0)} left - subscribe before it ends and your site stays up without a break.`;
    case "ACTIVE":
      return left == null
        ? "Your subscription is active."
        : `Your site is live. This plan renews in ${dayCount(left)}.`;
    case "GRACE": {
      const graceLeft = daysUntil(subscription.graceEndsAt);
      return `Your plan has ended and your site is in its grace period${
        graceLeft != null ? ` - ${dayCount(graceLeft)} left` : ""
      }. Renew now to avoid it going offline.`;
    }
    case "PENDING":
      return "Your payment has not gone through yet. Finish checkout below to put your site online.";
    case "EXPIRED":
      return "Your site is offline because the subscription ended. Pick a plan below to bring it back.";
    case "CANCELED":
      return "This subscription was canceled. Pick a plan below to start again.";
  }
}

export default function SubscriptionPage() {
  const { website, accessToken } = useWebsite();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [pendingPayment, setPendingPayment] = useState<MockPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function loadSubscription() {
    try {
      setSubscription(await subscriptionApi.get(accessToken, website.id));
    } catch {
      setSubscription(null);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    Promise.all([loadSubscription(), plansApi.list().then(setPlans)])
      .catch((err) => setError(friendlyMessage(err, "Failed to load subscription info.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleCheckout(plan: PlanResponse) {
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      const payment = await subscriptionApi.checkout(accessToken, website.id, {
        planCode: plan.code,
        billingPeriod: plan.billingPeriod,
      });
      setPendingPayment(payment);
      await loadSubscription();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to start checkout."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSimulate(outcome: MockPaymentStatus) {
    if (!pendingPayment) return;
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      const updated = await subscriptionApi.simulateOutcome(accessToken, pendingPayment.id, outcome);
      setPendingPayment(updated);
      await loadSubscription();
      setMessage(`Payment marked as ${outcome.toLowerCase()}.`);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to simulate payment outcome."));
    } finally {
      setIsBusy(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  // A trial is based on the BASIC plan, but the owner has not bought it - so no
  // card is "your plan" during one, and none of them offer to "Renew" something
  // that was never paid for.
  const isCurrent = (plan: PlanResponse) =>
    subscription?.status !== "TRIAL" &&
    subscription?.planCode === plan.code &&
    subscription.billingPeriod === plan.billingPeriod;

  // BR-SUB-010, as the server reads it: while a paid plan is running, the only
  // thing you can do is renew the one you have. A trial deliberately does not
  // lock anything - it is meant to be converted.
  const lockedToCurrentPlan = subscription != null && !subscription.canChangePlan;
  const trialDaysLeft = subscription?.status === "TRIAL" ? daysUntil(subscription.endDate) : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Subscription</h1>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      {subscription ? (
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Your plan
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {subscription.status === "TRIAL"
                    ? "Free trial"
                    : `${subscription.planCode} · ${subscription.billingPeriod}`}
                </p>
              </div>
              <Badge tone={STATUS_TONE[subscription.status]}>{STATUS_LABEL[subscription.status]}</Badge>
            </div>

            {/* The countdown is the number an owner on a trial actually wants,
                so it gets its own line rather than being buried in a date. */}
            {trialDaysLeft != null && (
              <div className="rounded-xl bg-[var(--accent-solid)]/8 px-4 py-3">
                <p className="text-lg font-semibold">
                  {trialDaysLeft === 0 ? "Ends today" : `${dayCount(trialDaysLeft)} left`}
                </p>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  Nothing to pay until then. Your site is live and your link works.
                </p>
              </div>
            )}

            <p className="text-sm">{statusSentence(subscription)}</p>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-black/[.08] pt-4 text-sm sm:grid-cols-3 dark:border-white/[.145]">
              {subscription.startDate && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Started</dt>
                  <dd>{formatDate(subscription.startDate)}</dd>
                </div>
              )}
              {subscription.endDate && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    {subscription.status === "TRIAL" ? "Trial ends" : "Ends"}
                  </dt>
                  <dd>{formatDate(subscription.endDate)}</dd>
                </div>
              )}
              {subscription.graceEndsAt && subscription.status !== "TRIAL" && (
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Goes offline after</dt>
                  <dd>{formatDate(subscription.graceEndsAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold tracking-tight">No subscription yet - and nothing to pay</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Build your site and publish it whenever you are ready. Your free trial starts the moment you publish, so
              you can see your real link working before you decide on a plan.
            </p>
          </div>
        </Card>
      )}

      {pendingPayment && pendingPayment.status === "PENDING" && (
        <Card
          title="Mock Whish checkout"
          description={`Reference ${pendingPayment.reference} · ${formatMoney(pendingPayment.amount, website.currency)}. This mock gateway needs you to simulate an outcome.`}
        >
          <div className="flex gap-3">
            <Button className="!w-auto px-4" onClick={() => handleSimulate("SUCCESS")} isLoading={isBusy}>
              Simulate success
            </Button>
            <Button variant="secondary" className="!w-auto px-4" onClick={() => handleSimulate("FAILED")} isLoading={isBusy}>
              Simulate failure
            </Button>
            <Button variant="secondary" className="!w-auto px-4" onClick={() => handleSimulate("PENDING")} isLoading={isBusy}>
              Keep pending
            </Button>
          </div>
        </Card>
      )}

      <Card
        title="Plans"
        description={
          lockedToCurrentPlan
            ? `You are on ${subscription?.planCode} · ${subscription?.billingPeriod}. You can renew it any time; switching to a different plan is possible once this one ends${
                subscription?.endDate ? ` on ${formatDate(subscription.endDate)}` : ""
              }.`
            : undefined
        }
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const current = isCurrent(plan);
            // Locked plans stay visible - an owner should be able to see what
            // they will be able to move up to - but they say why, instead of
            // offering a button the server would refuse.
            const locked = lockedToCurrentPlan && !current;
            return (
              <li
                key={plan.id}
                className={`flex flex-col gap-2 rounded-lg border p-4 ${
                  current
                    ? "border-[var(--accent-solid)] bg-[var(--accent-solid)]/5"
                    : "border-black/[.08] dark:border-white/[.145]"
                } ${locked ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {plan.code} · {plan.billingPeriod}
                  </p>
                  {current && <Badge tone="success">Your plan</Badge>}
                </div>
                <p className="text-lg font-semibold">{formatMoney(plan.price, website.currency)}</p>
                <ul className="text-xs text-zinc-500 dark:text-zinc-400">
                  <li>Up to {plan.maxWebsites} website(s)</li>
                  <li>Up to {plan.maxManagersPerWebsite} manager(s) per website</li>
                  <li>Up to {plan.maxGalleryImages} gallery images</li>
                  {plan.analyticsEnabled && <li>Analytics included</li>}
                  {plan.multiPageEnabled && <li>Multi-page sites</li>}
                </ul>
                {locked ? (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Available once your current plan ends
                    {subscription?.endDate ? ` on ${formatDate(subscription.endDate)}` : ""}.
                  </p>
                ) : (
                  <Button className="mt-2 !w-auto self-start px-4" onClick={() => handleCheckout(plan)} isLoading={isBusy}>
                    {current ? "Renew" : subscription?.status === "TRIAL" ? "Subscribe and keep my site" : "Subscribe"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
