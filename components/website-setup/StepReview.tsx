"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import { profileApi } from "@/lib/api/profile";
import { servicesApi } from "@/lib/api/services";
import { subscriptionApi } from "@/lib/api/subscription";
import { websitesApi } from "@/lib/api/websites";
import type { BusinessProfileResponse, SubscriptionResponse } from "@/lib/api/types";
import { buildPublicationChecklist } from "@/lib/website/setup-checklist";
import { useWebsite } from "@/lib/website/website-context";

/** Wizard Step 7 - publication checklist plus the single "Publish website" action. */
export function StepReview({ onPublished }: { onPublished(): void }) {
  const { website, accessToken, reload } = useWebsite();
  const [profile, setProfile] = useState<BusinessProfileResponse | null>(null);
  const [contentCount, setContentCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [fetchedProfile, fetchedSubscription, count] = await Promise.all([
          profileApi.get(accessToken, website.id),
          subscriptionApi.get(accessToken, website.id).catch(() => null),
          website.templateType === "PORTFOLIO"
            ? servicesApi.list(accessToken, website.id).then((list) => list.length)
            : menuApi.listItems(accessToken, website.id).then((list) => list.length),
        ]);
        if (cancelled) return;
        setProfile(fetchedProfile);
        setSubscription(fetchedSubscription);
        setContentCount(count);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load your setup status.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, website.id, website.templateType]);

  async function handlePublish() {
    setError(null);
    setIsPublishing(true);
    try {
      await websitesApi.publish(accessToken, website.id);
      await reload();
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish. Check the checklist below for what's missing.");
    } finally {
      setIsPublishing(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const checklist = buildPublicationChecklist({ website, profile, contentCount, subscription });
  const allComplete = checklist.every((item) => item.complete);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Review and publish</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Everything below must be complete before your website can go live.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <ul className="flex flex-col gap-2">
        {checklist.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]"
          >
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                item.complete ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              }`}
            >
              {item.complete ? "✓" : "!"}
            </span>
            <span className={item.complete ? "" : "font-medium"}>{item.label}</span>
            {item.key === "subscription" && !item.complete && (
              <Link
                href={`/dashboard/websites/${website.id}/subscription`}
                className="ml-auto shrink-0 text-xs font-medium text-[var(--accent-solid)] hover:underline"
              >
                Choose a plan →
              </Link>
            )}
          </li>
        ))}
      </ul>

      {!allComplete && (
        <Alert tone="info">Finish the missing requirements above, then come back here to publish.</Alert>
      )}

      <Button onClick={handlePublish} isLoading={isPublishing} disabled={!allComplete} className="w-auto self-start px-6">
        Publish website
      </Button>
    </div>
  );
}
