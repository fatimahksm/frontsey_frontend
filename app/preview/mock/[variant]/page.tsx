"use client";

import { use, useEffect, useState } from "react";

import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import type { LayoutVariant } from "@/lib/api/types";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { plansApi } from "@/lib/api/plans";
import type { MenuBusinessKind } from "@/lib/website/draft-content";

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
  // ?kind=SHOP shows the shop sample instead of the kitchen one, so the "open
  // full size" link from the picker shows the same goods as the thumbnail the
  // owner just clicked. Read from the URL rather than useSearchParams, which
  // would opt this statically prerendered page into a client bailout.
  const [kind, setKind] = useState<MenuBusinessKind>("FOOD");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL is a one-time sync with the browser, not derivable state
    setKind(new URLSearchParams(window.location.search).get("kind") === "SHOP" ? "SHOP" : "FOOD");
  }, []);

  // This page is the sales gallery: it shows a template to somebody deciding
  // whether to pick it. A template the admin has withdrawn is not on sale, and
  // the URL is guessable, so it must not render one here just because nobody
  // linked to it. An owner looking at the template their own site already uses
  // sees it on the Layout tab, which renders the sample inline and is not
  // affected by this.
  //
  // Null while the lookup is in flight or if it failed - the design still
  // renders then, for the same reason the picker still lists everything: a
  // momentary failure should not look like the product is broken.
  const [offered, setOffered] = useState<Set<LayoutVariant> | null>(null);
  useEffect(() => {
    let cancelled = false;
    plansApi
      .offeredTemplates()
      .then((templates) => {
        if (!cancelled) setOffered(new Set(templates.map((template) => template.layoutVariant)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (offered && !offered.has(variant as LayoutVariant)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold tracking-tight">This design is not available</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            It is not one of the templates on offer right now. Pick another from the gallery.
          </p>
        </div>
      </main>
    );
  }

  const site = mockSiteFor(variant as LayoutVariant, kind);

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
