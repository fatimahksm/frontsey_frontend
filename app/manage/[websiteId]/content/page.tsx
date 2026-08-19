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
import { friendlyMessage } from "@/lib/api/client";
import type { OrderingMode } from "@/lib/api/types";
import { websitesApi } from "@/lib/api/websites";
import { parseDraftContent, serializeDraftContent } from "@/lib/website/draft-content";
import { isDisplayOnlyLayout, templateLabel } from "@/lib/website/layout-options";
import { useWebsite } from "@/lib/website/website-context";

/**
 * The words on the page, and publishing them.
 *
 * Its own route rather than a card buried in the setup Overview: an owner
 * changes their tagline and re-publishes long after setup is finished, and it
 * has to be reachable from the console like everything else they can edit.
 * One copy, mounted in both frames.
 */
export default function PageContentPage() {
  const { website, accessToken, reload } = useWebsite();
  const initial = parseDraftContent(website.draftContent);

  const [heroHeading, setHeroHeading] = useState(initial.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [brandColor, setBrandColor] = useState(initial.brandColor);
  const [heroBadge, setHeroBadge] = useState(initial.heroBadge);
  const [cvUrl, setCvUrl] = useState(initial.cvUrl);
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
        // Carried through rather than rebuilt: this editor does not own the
        // business kind, and dropping it here would silently turn a shop back
        // into a restaurant every time somebody edited their tagline.
        content: serializeDraftContent({ ...initial, heroHeading, heroSubtitle, brandColor, heroBadge, cvUrl }),
        orderingMode,
      });
      await reload();
      setMessage("Saved. Publish when you're ready for visitors to see it.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save."));
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
      setMessage("Published. Your changes are live.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to publish."));
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
      setMessage("Restored the previous published version.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to restore the previous version."));
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Page content</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The words at the top of your site, and your accent colour.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Headline">
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
          {/* Only the templates that render these ask for them - the CV button
              exists on Professional / CV alone, the badge on two layouts. */}
          {website.layoutVariant === "PORTFOLIO_HERO" && (
            <div className="flex flex-col gap-1.5">
              <TextField
                id="cvUrl"
                label="CV / resume link (optional)"
                placeholder="https://… a PDF or a Drive link"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Shown as a Download CV button. Leave it blank and no button appears.
              </p>
            </div>
          )}
          {(website.layoutVariant === "PORTFOLIO_PROFILE" || website.layoutVariant === "MENU_BISTRO") && (
            <div className="flex flex-col gap-1.5">
              <TextField
                id="heroBadge"
                label="Highlight badge (optional)"
                placeholder={website.templateType === "PORTFOLIO" ? "e.g. 3+ Years Experience" : "e.g. Fresh Everyday"}
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Shown as a small floating badge next to your hero photo. Leave blank to hide it.
              </p>
            </div>
          )}
          <label htmlFor="brandColor" className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Brand color</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Used for buttons and accents across your public site.
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black/[.15] bg-surface p-1 dark:border-white/[.3]">
                <input
                  id="brandColor"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-full w-full cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </div>
              <span className="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400">{brandColor}</span>
            </div>
          </label>
          {isDisplayOnlyLayout(website.layoutVariant) ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-foreground">Display only.</span> The{" "}
              {templateLabel(website.layoutVariant, website.templateType)} layout has no cart - visitors read the prices
              and contact you directly. Switch layout under Design → Template to enable ordering.
            </p>
          ) : (
            <Select
              id="orderingMode"
              label="Ordering mode"
              value={orderingMode}
              onChange={(e) => setOrderingMode(e.target.value as OrderingMode)}
            >
              <option value="DISPLAY_ONLY">Display only (menu is informational)</option>
              <option value="WHATSAPP_ORDERING">WhatsApp ordering (customers can add to cart and order)</option>
            </Select>
          )}
          {/* self-start as well as w-auto: the parent is a column flex, so
              stretch would make this span the card whatever the width says. */}
          <Button onClick={handleSaveDraft} isLoading={isSaving} className="mt-2 !w-auto self-start px-5">
            Save
          </Button>
        </div>
      </Card>

      <Card title="Publish" description="Nothing you change is visible to visitors until you publish.">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handlePublish} isLoading={isPublishing} className="!w-auto px-5">
            Publish changes
          </Button>
          <Link href={`/preview/${website.id}`} target="_blank">
            <Button variant="secondary" className="!w-auto px-5">
              Preview first
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleRestore} isLoading={isRestoring} className="!w-auto px-5">
            Undo last publish
          </Button>
        </div>
      </Card>
    </div>
  );
}
