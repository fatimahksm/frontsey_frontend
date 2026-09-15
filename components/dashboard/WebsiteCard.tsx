"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ScaledPreviewFrame } from "@/components/dashboard/ScaledPreviewFrame";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { Button } from "@/components/ui/Button";
import { subscriptionApi } from "@/lib/api/subscription";
import type { SubscriptionResponse, WebsiteResponse } from "@/lib/api/types";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { parseDraftContent } from "@/lib/website/draft-content";
import { WEBSITE_TYPES } from "@/lib/website/layout-options";
import { loadSetupStatus, readinessPercent } from "@/lib/website/setup-checklist";

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
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-soft sm:flex-row sm:gap-6">
      <div className="hidden shrink-0 sm:block">
        <ScaledPreviewFrame width={180} height={130}>
          <PublicSiteRenderer
            site={mockSiteFor(website.layoutVariant, parseDraftContent(website.draftContent).menuBusinessKind)}
            onFirstView={() => {}}
            isSample
          />
        </ScaledPreviewFrame>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold">{website.businessName}</p>
          <WebsiteStatusBadge status={website.status} />
        </div>

        {/* One line of facts rather than a row of four badges. Three of them
            said the same kind of thing in three different colours, which made
            the one that matters - is this site live - hard to find. */}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
          <span>{typeLabel}</span>
          <span aria-hidden>·</span>
          <span>{website.role === "MANAGER" ? "You manage this" : "You own this"}</span>
          <span aria-hidden>·</span>
          <span>{subscription ? SUBSCRIPTION_LABEL[subscription.status] : "No subscription"}</span>
        </p>

        {/* A progress bar that has reached the end is not progress. Once
            everything is done it says so, instead of showing a full bar beside
            a button offering to finish the setup. */}
        {percent !== null && percent < 100 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-accent transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs text-muted">{percent}% ready</span>
          </div>
        )}
        {percent === 100 && !isPublished && (
          <p className="mt-3 text-xs text-success">Everything is filled in - ready to publish.</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={`/manage/${website.id}`}>
            <Button size="sm">Manage website</Button>
          </Link>
          <Link href={`/preview/${website.id}`} target="_blank">
            <Button variant="secondary" size="sm">
              Preview draft
            </Button>
          </Link>
          {isPublished ? (
            <>
              <Link href={`/site/${website.slug}`} target="_blank">
                <Button variant="secondary" size="sm">
                  View live website
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={copyLink}>
                {copied ? "Link copied" : "Copy public link"}
              </Button>
            </>
          ) : (
            percent !== null &&
            percent < 100 && (
              <Link href={`/manage/${website.id}/setup`}>
                <Button variant="secondary" size="sm">
                  Continue setup
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
