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
import { TEMPLATE_OPTIONS } from "@/lib/website/layout-options";
import { useWebsite } from "@/lib/website/website-context";

export default function LayoutPage() {
  const { website, accessToken, reload } = useWebsite();
  const [error, setError] = useState<string | null>(null);
  const [busyVariant, setBusyVariant] = useState<LayoutVariant | null>(null);
  const [previewVariant, setPreviewVariant] = useState<LayoutVariant>(website.layoutVariant);

  const options = TEMPLATE_OPTIONS[website.templateType];

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
        <h1 className="text-xl font-semibold tracking-tight">Template</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The complete ready-made visual design for your website - your content stays the same, only the look and
          arrangement change. Switch anytime.
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewVariant(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPreviewVariant(option.value);
                    }
                  }}
                  className={`flex w-full cursor-pointer justify-center overflow-x-auto rounded-xl transition-shadow ${
                    previewVariant === option.value ? "ring-2 ring-[var(--accent-solid)]" : ""
                  }`}
                >
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

      <div>
        <p className="mb-2 text-sm font-medium">
          Live preview - {options.find((o) => o.value === previewVariant)?.label}
        </p>
        <div className="flex justify-center overflow-x-auto rounded-2xl border border-black/[.08] bg-white p-2 dark:border-white/[.145]">
          <ScaledPreviewFrame width={820} height={520}>
            <PublicSiteRenderer site={mockSiteFor(previewVariant)} onFirstView={() => {}} />
          </ScaledPreviewFrame>
        </div>
      </div>
    </div>
  );
}
