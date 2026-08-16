"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ScaledPreviewFrame } from "@/components/dashboard/ScaledPreviewFrame";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { subscriptionApi } from "@/lib/api/subscription";
import type { SubscriptionResponse, WebsiteResponse } from "@/lib/api/types";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { WEBSITE_TYPES } from "@/lib/website/layout-options";
import { loadSetupStatus, readinessPercent } from "@/lib/website/setup-checklist";

const SUBSCRIPTION_TONE = {
  PENDING: "warning",
  TRIAL: "success",
  ACTIVE: "success",
  GRACE: "warning",
  EXPIRED: "danger",
  CANCELED: "danger",
} as const;

const SUBSCRIPTION_LABEL = {
  PENDING: "Pending",
  TRIAL: "Free trial",
  ACTIVE: "Active",
  GRACE: "Grace period",
  EXPIRED: "Expired",
  CANCELED: "Canceled",
} as const;

/** One website's card on the My Websites page - status, readiness, role and the three distinct URLs (admin/preview/public). */
export function WebsiteCard({ website, accessToken }: { website: WebsiteResponse; accessToken: string }) {
  const [percent, setPercent] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSetupStatus(accessToken, website)
      .then((checklist) => {
        if (!cancelled) setPercent(readinessPercent(checklist));
      })
      .catch(() => {
        if (!cancelled) setPercent(null);
      });
    subscriptionApi
      .get(accessToken, website.id)
      .then((result) => {
        if (!cancelled) setSubscription(result);
      })
      .catch(() => {
        if (!cancelled) setSubscription(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  const typeLabel = WEBSITE_TYPES.find((t) => t.value === website.templateType)?.label ?? website.templateType;
  const isPublished = website.status === "PUBLISHED";
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/site/${website.slug}` : `/site/${website.slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser - the link is still visible below, so this is non-critical.
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-surface p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-white/[.1] sm:flex-row sm:gap-6">
      <div className="hidden shrink-0 sm:block">
        <ScaledPreviewFrame width={180} height={130}>
          <PublicSiteRenderer site={mockSiteFor(website.layoutVariant)} onFirstView={() => {}} isSample />
        </ScaledPreviewFrame>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold">{website.businessName}</p>
          <Badge tone={website.role === "MANAGER" ? "neutral" : "success"}>{website.role === "MANAGER" ? "Manager" : "Owner"}</Badge>
          <WebsiteStatusBadge status={website.status} />
          {subscription ? (
            <Badge tone={SUBSCRIPTION_TONE[subscription.status]}>Subscription: {SUBSCRIPTION_LABEL[subscription.status]}</Badge>
          ) : (
            <Badge tone="neutral">No subscription</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{typeLabel}</p>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
            <div
              className="h-full rounded-full bg-gradient-accent transition-[width] duration-500"
              style={{ width: `${percent ?? 0}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {percent === null ? "Checking readiness…" : `${percent}% ready`}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={`/manage/${website.id}`}>
            <Button variant="primary" className="w-auto px-4">
              Manage website
            </Button>
          </Link>
          <Link href={`/preview/${website.id}`} target="_blank">
            <Button variant="secondary" className="w-auto px-4">
              Preview draft
            </Button>
          </Link>
          {isPublished ? (
            <>
              <Link href={`/site/${website.slug}`} target="_blank">
                <Button variant="secondary" className="w-auto px-4">
                  View live website
                </Button>
              </Link>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-full border border-black/[.12] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-black/[.03] dark:border-white/[.16] dark:hover:bg-white/[.06]"
              >
                {copied ? "Link copied!" : "Copy public link"}
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Not published yet</span>
              <Link href={`/manage/${website.id}/setup`}>
                <Button variant="secondary" className="w-auto px-4">
                  Continue setup
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
