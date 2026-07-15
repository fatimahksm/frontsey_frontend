"use client";

import Link from "next/link";
import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { SuggestButton } from "@/components/ui/SuggestButton";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { ApiError } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import type { OrderingMode } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";
import { parseDraftContent, serializeDraftContent } from "@/lib/website/draft-content";

export default function WebsiteOverviewPage() {
  const { website, accessToken, reload } = useWebsite();
  const initial = parseDraftContent(website.draftContent);

  const [heroHeading, setHeroHeading] = useState(initial.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [brandColor, setBrandColor] = useState(initial.brandColor);
  const [orderingMode, setOrderingMode] = useState<OrderingMode>(website.orderingMode);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  async function handleSaveDraft() {
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      await websitesApi.saveDraft(accessToken, website.id, {
        content: serializeDraftContent({ heroHeading, heroSubtitle, brandColor }),
        orderingMode,
      });
      await reload();
      setMessage("Draft saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setMessage(null);
    setIsPublishing(true);
    try {
      await websitesApi.publish(accessToken, website.id);
      await reload();
      setMessage("Website published.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleRestore() {
    setError(null);
    setMessage(null);
    setIsRestoring(true);
    try {
      await websitesApi.restorePreviousVersion(accessToken, website.id);
      await reload();
      setMessage("Previous published version restored.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore previous version.");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{website.businessName}</h1>
          <WebsiteStatusBadge status={website.status} />
        </div>
        {website.status === "PUBLISHED" && (
          <Link
            href={`/site/${website.slug}`}
            target="_blank"
            className="text-sm font-medium text-foreground hover:underline"
          >
            View live site →
          </Link>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card
        title="Page content"
        description="A short tagline shown right under your business name on your public site, plus your brand's accent color. Save the draft, then publish when ready."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <TextField
              id="heroHeading"
              label="Tagline"
              placeholder="e.g. Fresh coffee, made your way"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
            />
            <SuggestButton
              accessToken={accessToken}
              businessName={website.businessName}
              templateType={website.templateType}
              fieldType="HERO_HEADING"
              currentText={heroHeading}
              onSuggestion={setHeroHeading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Textarea
              id="heroSubtitle"
              label="Supporting line"
              placeholder="A sentence or two shown just below the tagline"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
            />
            <SuggestButton
              accessToken={accessToken}
              businessName={website.businessName}
              templateType={website.templateType}
              fieldType="HERO_SUBTITLE"
              currentText={heroSubtitle}
              onSuggestion={setHeroSubtitle}
            />
          </div>
          <label htmlFor="brandColor" className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Brand color</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Used for buttons and accents across your public site.</span>
            <input
              id="brandColor"
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-11 w-20 rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.18]"
            />
          </label>
          <Select
            id="orderingMode"
            label="Ordering mode"
            value={orderingMode}
            onChange={(e) => setOrderingMode(e.target.value as OrderingMode)}
          >
            <option value="DISPLAY_ONLY">Display only (menu is informational)</option>
            <option value="WHATSAPP_ORDERING">WhatsApp ordering (customers can add to cart and order)</option>
          </Select>
          <Button onClick={handleSaveDraft} isLoading={isSaving} className="mt-2 w-auto px-5">
            Save draft
          </Button>
        </div>
      </Card>

      <Card title="Publish" description="Publishing makes your draft live at your public URL.">
        <div className="flex items-center gap-3">
          <Link href={`/preview/${website.id}`} target="_blank">
            <Button variant="secondary" className="w-auto px-5">
              Preview draft
            </Button>
          </Link>
          <Button onClick={handlePublish} isLoading={isPublishing} className="w-auto px-5">
            Publish
          </Button>
          <Button variant="secondary" onClick={handleRestore} isLoading={isRestoring} className="w-auto px-5">
            Restore previous version
          </Button>
        </div>
      </Card>
    </div>
  );
}
