"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { friendlyMessage } from "@/lib/api/client";
import { plansApi } from "@/lib/api/plans";
import { subscriptionApi } from "@/lib/api/subscription";
import type {
  BillingPeriod,
  MockPaymentResponse,
  MockPaymentStatus,
  SubscriptionResponse,
  TemplatePriceResponse,
} from "@/lib/api/types";
import { formatDate, formatMoney } from "@/lib/format";
import { templateLabel } from "@/lib/website/layout-options";
import { hasEverRun } from "@/lib/website/subscription-state";
import { useWebsite } from "@/lib/website/website-context";

/**
 * What this website's subscription actually is, and what happens next.
 *
 * The old page put a status chip and three ISO dates in a box and left the
 * owner to work out the rest: which of the four plan cards was theirs, why the
 * others did nothing when a plan was running, and how long they had. All three
 * are stated outright here.
 *
 * There are no tiers to compare either. The price comes from the template this
 * website already uses, so the only decision left is monthly or yearly - which
 * is the one an owner can actually answer without reading a feature matrix.
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

/** The statuses that mean money actually changed hands on this billing period. */
const PAID_FOR: SubscriptionResponse["status"][] = ["ACTIVE", "GRACE", "EXPIRED", "CANCELED"];

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
function statusSentence(subscription: SubscriptionResponse, trialDays: number | null): string {
  // Free access, granted deliberately. Telling this owner their plan renews, or
  // showing them a countdown, would be chasing them for money nobody intends to
  // take.
  if (subscription.complimentary) {
    return "Your site is live on free access, granted by Frontsey. There is nothing to pay and nothing to renew.";
  }
  // A row that never served a day is not a plan that stopped. Saying "your site
  // is offline because the subscription ended" about a trial that never began
  // is both wrong and unfixable-sounding - the trial is still there to be had.
  if (!hasEverRun(subscription)) {
    return trialDays
      ? `Your free ${trialDays}-day trial is still waiting for you - it starts the moment you publish.`
      : "Your free trial is still waiting for you - it starts the moment you publish.";
  }
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
      return "Your site is offline because the subscription ended. Pick monthly or yearly below to bring it back.";
    case "CANCELED":
      return "This subscription was canceled. Pick monthly or yearly below to start again.";
  }
}

export default function SubscriptionPage() {
  const { website, accessToken } = useWebsite();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [pricing, setPricing] = useState<TemplatePriceResponse | null>(null);
  const [pendingPayment, setPendingPayment] = useState<MockPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [trialDays, setTrialDays] = useState<number | null>(null);

  async function loadSubscription() {
    try {
      setSubscription(await subscriptionApi.get(accessToken, website.id));
    } catch {
      setSubscription(null);
    }
  }

  useEffect(() => {
    // Fetch-on-mount: one sync with the backend, not derivable state. An
    // unpriced template is not an error on this screen - the card below says so
    // in words the owner can act on, rather than a red banner over everything.
    Promise.all([
      subscriptionApi.get(accessToken, website.id).catch(() => null),
      plansApi.templatePrice(website.layoutVariant).catch(() => null),
      plansApi.trialDays().catch(() => null),
    ])
      .then(([found, templatePrice, days]) => {
        setSubscription(found);
        setPricing(templatePrice);
        setTrialDays(days);
      })
      .catch((err) => setError(friendlyMessage(err, "Failed to load subscription info.")))
      .finally(() => setIsLoading(false));
  }, [accessToken, website.id, website.layoutVariant]);

  async function handleCheckout(billingPeriod: BillingPeriod) {
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      const payment = await subscriptionApi.checkout(accessToken, website.id, { billingPeriod });
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

  // A billing period is "yours" only once it has actually been paid for. A
  // trial runs on a plan the owner never bought, and PENDING is a checkout that
  // has not gone through - marking either one "Your plan", or offering to
  // "Renew" it, would be claiming money changed hands when it has not.
  const isCurrent = (period: BillingPeriod) =>
    subscription != null &&
    PAID_FOR.includes(subscription.status) &&
    hasEverRun(subscription) &&
    subscription.billingPeriod === period;

  // BR-SUB-010, as the server reads it: while a paid subscription runs, the only
  // thing you can do is renew the billing period you are on. A trial
  // deliberately does not lock anything - it is meant to be converted.
  const lockedToCurrentPeriod = subscription != null && !subscription.canChangePlan;
  const trialDaysLeft = subscription?.status === "TRIAL" ? daysUntil(subscription.endDate) : null;

  const billingOptions: { period: BillingPeriod; label: string; note: string; price: number }[] = pricing
    ? [
        {
          period: "MONTHLY",
          label: "Monthly",
          note: "Billed every month. Cancel by simply not renewing.",
          price: pricing.monthlyPrice,
        },
        {
          period: "YEARLY",
          label: "Yearly",
          // Only claimed when it is true - a yearly price set at or above twelve
          // months would make "save" a lie.
          note:
            pricing.yearlyPrice < pricing.monthlyPrice * 12
              ? `Billed once a year - ${formatMoney(pricing.monthlyPrice * 12 - pricing.yearlyPrice, website.currency)} less than paying monthly.`
              : "Billed once a year.",
          price: pricing.yearlyPrice,
        },
      ]
    : [];

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
                  {subscription.complimentary
                    ? "Free access"
                    : subscription.status === "TRIAL" || !hasEverRun(subscription)
                      ? "Free trial"
                      : subscription.billingPeriod === "YEARLY"
                        ? "Yearly"
                        : "Monthly"}
                </p>
              </div>
              <Badge tone={subscription.complimentary || hasEverRun(subscription) ? STATUS_TONE[subscription.status] : "neutral"}>
                {subscription.complimentary
                  ? "Live"
                  : hasEverRun(subscription)
                    ? STATUS_LABEL[subscription.status]
                    : "Not started"}
              </Badge>
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

            <p className="text-sm">{statusSentence(subscription, trialDays)}</p>

            <dl
              className={`grid grid-cols-2 gap-x-6 gap-y-2 border-t border-black/[.08] pt-4 text-sm sm:grid-cols-3 dark:border-white/[.145] ${
                hasEverRun(subscription) && !subscription.complimentary ? "" : "hidden"
              }`}
            >
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

      {/* Nothing below is for somebody on free access - no plan to pick, no
          checkout to run. */}
      {subscription?.complimentary ? null : (
        <Card
          title="How you want to pay"
          description={
            lockedToCurrentPeriod
              ? `You are billed ${subscription?.billingPeriod.toLowerCase()}. You can renew any time; switching to the other one is possible once this subscription ends${
                  subscription?.endDate ? ` on ${formatDate(subscription.endDate)}` : ""
                }.`
              : `The price is set by your template, ${templateLabel(website.layoutVariant, website.templateType)} - so all that is left to choose is how often you are billed.`
          }
        >
          {pricing ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {billingOptions.map((option) => {
                const current = isCurrent(option.period);
                // The locked option stays visible - an owner should see what they
                // will be able to move to - but it says why, instead of offering
                // a button the server would refuse.
                const locked = lockedToCurrentPeriod && !current;
                return (
                  <li
                    key={option.period}
                    className={`flex flex-col gap-2 rounded-xl border p-4 ${
                      current
                        ? "border-[var(--accent-solid)] bg-[var(--accent-solid)]/5"
                        : "border-black/[.08] dark:border-white/[.145]"
                    } ${locked ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{option.label}</p>
                      {current && <Badge tone="success">Your plan</Badge>}
                    </div>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatMoney(option.price, website.currency)}
                      <span className="ms-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                        {option.period === "MONTHLY" ? "/ month" : "/ year"}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{option.note}</p>
                    {locked ? (
                      <p className="mt-auto pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Available once your current subscription ends
                        {subscription?.endDate ? ` on ${formatDate(subscription.endDate)}` : ""}.
                      </p>
                    ) : (
                      <Button
                        className="mt-auto !w-auto self-start px-4"
                        onClick={() => handleCheckout(option.period)}
                        isLoading={isBusy}
                      >
                        {current ? "Renew" : subscription?.status === "TRIAL" ? "Subscribe and keep my site" : "Subscribe"}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Alert tone="warning">
              This template has no price set yet, so there is nothing to check out. Contact support and they will price
              it - your site and everything in it stays exactly as it is in the meantime.
            </Alert>
          )}
        </Card>
      )}
    </div>
  );
}
