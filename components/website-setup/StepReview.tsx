"use client";

import { CheckIcon, WarningIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ShareLinksPanel } from "@/components/dashboard/ShareLinksPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import type { TemplateType } from "@/lib/api/types";
import type { ChecklistItem } from "@/lib/website/setup-checklist";
import { loadSetupStatus } from "@/lib/website/setup-checklist";
import { useWebsite } from "@/lib/website/website-context";

/** Where each incomplete checklist item sends the owner to fix it. */
const FIX_LINK: Record<string, { href: string; label: string }> = {
  contact: { href: "/profile", label: "Add contact details" },
  content: { href: "/services", label: "Add one" },
  subscription: { href: "/subscription", label: "Choose a plan" },
};
/** The content item points at whichever editor that website type actually uses. */
function fixLink(key: string, templateType: TemplateType): { href: string; label: string } | null {
  if (key === "content") {
    return templateType === "PORTFOLIO"
      ? { href: "/services", label: "Add a service" }
      : { href: "/menu", label: "Add an item" };
  }
  return FIX_LINK[key] ?? null;
}

/**
 * Wizard Step 4 - publication checklist plus the single "Publish website"
 * action.
 *
 * Since the wizard stopped walking people through content and design, this is
 * where an owner finds out what is still missing, so every incomplete item
 * carries a link straight to the dashboard page that fixes it. A checklist that
 * only says "no" is a dead end.
 */
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
        if (!cancelled) setError(friendlyMessage(err, "Failed to load your setup status."));
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
      setError(friendlyMessage(err, "Failed to publish. Check the checklist below for what's missing."));
    } finally {
      setIsPublishing(false);
    }
  }

  if (!checklist) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const allComplete = checklist.every((item) => item.complete);
  // Covers both "just published" and revisiting this step on an already-live
  // website, so the links and QR code stay reachable from the wizard.
  const isLive = hasPublished || website.status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Review and publish</h2>
        <p className="mt-1 text-sm text-muted">
          Everything below must be complete before your website can go live. Anything missing links straight to the
          page that fixes it.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <ul className="flex flex-col gap-2">
        {checklist.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 rounded-lg border border-line p-3 text-sm"
          >
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.complete ? "bg-success-quiet text-success" : "bg-warning-quiet text-warning"
              }`}
            >
              {item.complete ? <CheckIcon className="h-3 w-3" /> : <WarningIcon className="h-3 w-3" />}
            </span>
            <span className={item.complete ? "" : "font-medium"}>{item.label}</span>
            {!item.complete && fixLink(item.key, website.templateType) && (
              <Link
                href={`/manage/${website.id}${fixLink(item.key, website.templateType)!.href}`}
                className="ml-auto shrink-0 text-xs font-medium text-[var(--accent-solid)] hover:underline"
              >
                {fixLink(item.key, website.templateType)!.label} →
              </Link>
            )}
          </li>
        ))}
      </ul>

      {isLive ? (
        <div className="flex flex-col gap-4 rounded-xl border border-line p-4">
          <Alert tone="success">Your website is live. Here is everything you need to hand it to customers.</Alert>
          <ShareLinksPanel website={website} />
        </div>
      ) : (
        <>
          {!allComplete && (
            <Alert tone="info">Finish the missing requirements above, then come back here to publish.</Alert>
          )}

          <Button onClick={handlePublish} isLoading={isPublishing} disabled={!allComplete} className="self-start">
            Publish website
          </Button>
        </>
      )}
    </div>
  );
}
