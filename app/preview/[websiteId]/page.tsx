"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { ApiError } from "@/lib/api/client";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { websitesApi } from "@/lib/api/websites";
import { useAuth } from "@/lib/auth/auth-context";

interface Props {
  params: Promise<{ websiteId: string }>;
}

/**
 * Owner/manager-only preview of the current draft - same rendering as the
 * live public site, but never published/cached. `?embedded=1` (set by
 * LivePreviewPanel) hides the standalone-tab banner, since that context
 * already has its own "Live preview" header right next to the editor.
 */
export default function PreviewPage({ params }: Props) {
  const { websiteId } = use(params);
  const { session } = useAuth();
  const embedded = useSearchParams().get("embedded") === "1";
  const [site, setSite] = useState<PublicWebsiteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    websitesApi
      .preview(session.accessToken, websiteId)
      .then((response) => {
        if (!cancelled) setSite(response);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load preview.");
      });
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

  return (
    <div className="flex min-h-screen flex-col">
      {!embedded && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-black/[.08] bg-amber-400 px-4 py-2 text-sm font-medium text-black dark:border-white/[.1]">
          <span>Draft preview - unpublished changes are included and won&apos;t be visible to customers until you publish.</span>
          <Link href={`/dashboard/websites/${websiteId}`} className="shrink-0 underline">
            Back to editor
          </Link>
        </div>
      )}

      {error && <p className="p-10 text-center text-sm text-red-600">{error}</p>}
      {!error && !site && <p className="p-10 text-center text-sm text-zinc-500">Loading preview…</p>}
      {site && <PublicSiteRenderer site={site} onFirstView={() => {}} />}
    </div>
  );
}
