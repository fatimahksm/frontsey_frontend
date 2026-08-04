"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ShareLinksPanel } from "@/components/dashboard/ShareLinksPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import type { ChecklistItem } from "@/lib/website/setup-checklist";
import { loadSetupStatus } from "@/lib/website/setup-checklist";
import { useWebsite } from "@/lib/website/website-context";

/** Wizard Step 7 - publication checklist plus the single "Publish website" action. */
export function StepReview({ onPublished }: { onPublished(): void }) {
  const { website, accessToken, reload } = useWebsite();
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSetupStatus(accessToken, website)
      .then((result) => {
        if (!cancelled) setChecklist(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load your setup status.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  async function handlePublish() {
    setError(null);
    setIsPublishing(true);
    try {
      await websitesApi.publish(accessToken, website.id);
      await reload();
      setHasPublished(true);
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish. Check the checklist below for what's missing.");
    } finally {
      setIsPublishing(false);
    }
  }

  if (!checklist) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const allComplete = checklist.every((item) => item.complete);
  // Covers both "just published" and revisiting this step on an already-live
  // website, so the links and QR code stay reachable from the wizard.
  const isLive = hasPublished || website.status === "PUBLISHED";

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

      {isLive ? (
        <div className="flex flex-col gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
          <Alert tone="success">Your website is live. Here is everything you need to hand it to customers.</Alert>
          <ShareLinksPanel website={website} />
        </div>
      ) : (
        <>
          {!allComplete && (
            <Alert tone="info">Finish the missing requirements above, then come back here to publish.</Alert>
          )}

          <Button onClick={handlePublish} isLoading={isPublishing} disabled={!allComplete} className="w-auto self-start px-6">
            Publish website
          </Button>
        </>
      )}
    </div>
  );
}
