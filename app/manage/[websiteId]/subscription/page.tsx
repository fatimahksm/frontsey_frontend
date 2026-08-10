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

const STATUS_TONE = {
  PENDING: "warning",
  ACTIVE: "success",
  GRACE: "warning",
  EXPIRED: "danger",
  CANCELED: "danger",
} as const;

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Subscription</h1>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Current subscription">
        {subscription ? (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {subscription.planCode} · {subscription.billingPeriod}
              </span>
              <Badge tone={STATUS_TONE[subscription.status]}>{subscription.status}</Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              {subscription.startDate && <>Started {formatDate(subscription.startDate)} · </>}
              {subscription.endDate && <>Ends {formatDate(subscription.endDate)}</>}
              {subscription.graceEndsAt && <> · Grace until {formatDate(subscription.graceEndsAt)}</>}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No subscription yet - choose a plan below to get started.</p>
        )}
      </Card>

      {pendingPayment && pendingPayment.status === "PENDING" && (
        <Card
          title="Mock Whish checkout"
          description={`Reference ${pendingPayment.reference} · ${formatMoney(pendingPayment.amount, website.currency)}. This mock gateway needs you to simulate an outcome.`}
        >
          <div className="flex gap-3">
            <Button className="w-auto px-4" onClick={() => handleSimulate("SUCCESS")} isLoading={isBusy}>
              Simulate success
            </Button>
            <Button variant="secondary" className="w-auto px-4" onClick={() => handleSimulate("FAILED")} isLoading={isBusy}>
              Simulate failure
            </Button>
            <Button variant="secondary" className="w-auto px-4" onClick={() => handleSimulate("PENDING")} isLoading={isBusy}>
              Keep pending
            </Button>
          </div>
        </Card>
      )}

      <Card title="Plans">
        <ul className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.id} className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
              <p className="font-medium">
                {plan.code} · {plan.billingPeriod}
              </p>
              <p className="text-lg font-semibold">{formatMoney(plan.price, website.currency)}</p>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400">
                <li>Up to {plan.maxWebsites} website(s)</li>
                <li>Up to {plan.maxManagersPerWebsite} manager(s) per website</li>
                <li>Up to {plan.maxGalleryImages} gallery images</li>
                {plan.analyticsEnabled && <li>Analytics included</li>}
                {plan.multiPageEnabled && <li>Multi-page sites</li>}
              </ul>
              <Button className="mt-2 w-auto px-4" onClick={() => handleCheckout(plan)} isLoading={isBusy}>
                {subscription?.planCode === plan.code && subscription.billingPeriod === plan.billingPeriod
                  ? "Renew"
                  : "Subscribe"}
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
