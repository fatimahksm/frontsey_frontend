"use client";

import { useState } from "react";

import { ScaledPreviewFrame } from "@/components/dashboard/ScaledPreviewFrame";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/client";
import type { LayoutVariant } from "@/lib/api/types";
import { websitesApi } from "@/lib/api/websites";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { useWebsite } from "@/lib/website/website-context";

const MENU_OPTIONS: { value: LayoutVariant; label: string; description: string }[] = [
  { value: "MENU_CLASSIC", label: "Classic", description: "Business-card header, gallery strip, categorized list, cart sidebar." },
  { value: "MENU_GRID", label: "Grid", description: "Full-width cover, sticky category tabs, items as a card grid, cart drawer." },
  { value: "MENU_ELEGANT", label: "Elegant", description: "Fine-dining style list with dotted price leaders and a minimal bottom cart bar." },
];

const PORTFOLIO_OPTIONS: { value: LayoutVariant; label: string; description: string }[] = [
  { value: "PORTFOLIO_HERO", label: "Hero", description: "Full-bleed dark hero, centered content, services grid, work gallery." },
  { value: "PORTFOLIO_MINIMAL", label: "Minimal", description: "Warm editorial personal-site style - serif type, About block, and a project grid." },
  { value: "PORTFOLIO_BOLD", label: "Bold", description: "Vibrant creative-agency style with bold type and a masonry work gallery." },
];

export default function LayoutPage() {
  const { website, accessToken, reload } = useWebsite();
  const [error, setError] = useState<string | null>(null);
  const [busyVariant, setBusyVariant] = useState<LayoutVariant | null>(null);

  const options = website.templateType === "PORTFOLIO" ? PORTFOLIO_OPTIONS : MENU_OPTIONS;

  async function handleSelect(variant: LayoutVariant) {
    setError(null);
    setBusyVariant(variant);
    try {
      await websitesApi.updateLayoutVariant(accessToken, website.id, variant);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update layout.");
    } finally {
      setBusyVariant(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Layout</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The structural shape of your page - your content and functionality stay the same, only the arrangement changes.
          Switch anytime, just like a theme.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isSelected = website.layoutVariant === option.value;
          const mockSite = mockSiteFor(option.value);

          return (
            <StaggerItem key={option.value}>
              <Card>
                <div className="flex justify-center overflow-x-auto">
                  <ScaledPreviewFrame>
                    <PublicSiteRenderer site={mockSite} onFirstView={() => {}} />
                  </ScaledPreviewFrame>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{option.description}</p>
                    <a
                      href={`/preview/mock/${option.value}`}
                      target="_blank"
                      className="mt-1 inline-block text-xs font-medium text-[var(--accent-solid)] hover:underline"
                    >
                      Preview ↗
                    </a>
                  </div>
                  <button
                    type="button"
                    disabled={busyVariant !== null}
                    onClick={() => handleSelect(option.value)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-gradient-accent text-white"
                        : "border border-black/[.12] hover:bg-black/[.03] dark:border-white/[.16] dark:hover:bg-white/[.06]"
                    } disabled:opacity-50`}
                  >
                    {busyVariant === option.value ? "Saving…" : isSelected ? "Selected" : "Use this layout"}
                  </button>
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
