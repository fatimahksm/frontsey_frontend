"use client";

import { use } from "react";

import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import type { LayoutVariant } from "@/lib/api/types";
import { mockSiteFor } from "@/lib/mock-preview-data";

interface Props {
  params: Promise<{ variant: string }>;
}

/**
 * Full-size preview of a design using sample data, opened from the design
 * gallery (Create Website wizard and the dashboard Layout page) so an owner
 * can see more than the small scaled-down thumbnail before picking one.
 */
export default function MockPreviewPage({ params }: Props) {
  const { variant } = use(params);
  const site = mockSiteFor(variant as LayoutVariant);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-black/[.08] bg-amber-400 px-4 py-2 text-sm font-medium text-black dark:border-white/[.1]">
        <span>Sample preview - shown with placeholder data so you can see the design before picking it.</span>
        <button type="button" onClick={() => window.close()} className="shrink-0 underline">
          Close
        </button>
      </div>
      <PublicSiteRenderer site={site} onFirstView={() => {}} isSample />
    </div>
  );
}
