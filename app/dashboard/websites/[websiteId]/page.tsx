"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { SuggestButton } from "@/components/ui/SuggestButton";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { analyticsApi } from "@/lib/api/analytics";
import { ApiError } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import { servicesApi } from "@/lib/api/services";
import { websitesApi } from "@/lib/api/websites";
import type { AnalyticsSummaryResponse, OrderingMode } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";
import { parseDraftContent, serializeDraftContent } from "@/lib/website/draft-content";
import { loadSetupStatus, readinessPercent, type ChecklistItem } from "@/lib/website/setup-checklist";

/** Small at-a-glance KPI tile for the stats row - only ever fed real, already-fetched numbers (never a placeholder/fake value). */
function StatTile({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/[.08] bg-surface p-4 dark:border-white/[.1]">
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-accent text-lg">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
    </div>
  );
}

/** Compact "label - count" row shared by the Top items / Referral source / Device type cards. */
function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{value}</span>
    </li>
  );
}

/** Where each checklist item can be fixed, so the setup card can link straight there. "content" is resolved separately since it depends on the website's template type. */
const CHECKLIST_LINKS: Record<string, string> = {
  contact: "/profile",
  subscription: "/subscription",
};

export default function WebsiteOverviewPage() {
  const { website, accessToken, reload } = useWebsite();
  const initial = parseDraftContent(website.draftContent);

  const [heroHeading, setHeroHeading] = useState(initial.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [brandColor, setBrandColor] = useState(initial.brandColor);
  const [heroBadge, setHeroBadge] = useState(initial.heroBadge);
  const [orderingMode, setOrderingMode] = useState<OrderingMode>(website.orderingMode);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
  const [contentCount, setContentCount] = useState<number | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummaryResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSetupStatus(accessToken, website)
      .then((result) => {
        if (!cancelled) setChecklist(result);
      })
      .catch(() => {
        if (!cancelled) setChecklist(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  useEffect(() => {
    let cancelled = false;
    const countPromise =
      website.templateType === "PORTFOLIO"
        ? servicesApi.list(accessToken, website.id).then((list) => list.length)
        : menuApi.listItems(accessToken, website.id).then((list) => list.length);
    countPromise
      .then((count) => {
        if (!cancelled) setContentCount(count);
      })
      .catch(() => {
        if (!cancelled) setContentCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  useEffect(() => {
    let cancelled = false;
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Silently hidden (not an error banner) when the caller lacks VIEW_ANALYTICS or the plan doesn't include analytics - same soft-check pattern as WebsiteShell's nav gating.
    analyticsApi
      .summary(accessToken, website.id, from.toISOString(), to.toISOString())
      .then((summary) => {
        if (!cancelled) setAnalyticsSummary(summary);
      })
      .catch(() => {
        if (!cancelled) setAnalyticsSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  async function handleSaveDraft() {
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      await websitesApi.saveDraft(accessToken, website.id, {
        content: serializeDraftContent({ heroHeading, heroSubtitle, brandColor, heroBadge }),
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

      {(website.status === "SUSPENDED_TEMPORARY" || website.status === "SUSPENDED_PERMANENT") && (
        <Alert tone="error">
          This website is currently suspended and isn&apos;t visible to the public.
          {website.status === "SUSPENDED_TEMPORARY" ? " Contact support if you believe this is a mistake." : ""}
        </Alert>
      )}
      {website.status === "EXPIRED" && (
        <Alert tone="error">
          Your subscription has expired, so this website is no longer public.{" "}
          <Link href={`/dashboard/websites/${website.id}/subscription`} className="font-medium underline">
            Renew your subscription →
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile
          icon={website.templateType === "PORTFOLIO" ? "🛠️" : "🍽️"}
          label={website.templateType === "PORTFOLIO" ? "Projects" : "Menu items"}
          value={contentCount ?? "—"}
        />
        <StatTile icon="✅" label="Readiness" value={checklist ? `${readinessPercent(checklist)}%` : "—"} />
        {analyticsSummary !== null && <StatTile icon="👀" label="Visits (30d)" value={analyticsSummary.totalVisits} />}
      </div>

      {analyticsSummary !== null && (analyticsSummary.mostViewedItems.length > 0 || analyticsSummary.totalVisits > 0) && (
        <div className="grid gap-4 sm:grid-cols-3">
          {analyticsSummary.mostViewedItems.length > 0 && (
            <Card title="Top items" description="Most-viewed in the last 30 days.">
              <ul className="flex flex-col gap-2">
                {analyticsSummary.mostViewedItems.slice(0, 5).map((item) => (
                  <StatRow key={item.itemId} label={item.itemName} value={item.views} />
                ))}
              </ul>
            </Card>
          )}
          {Object.keys(analyticsSummary.visitsByReferralSource).length > 0 && (
            <Card title="Referral source">
              <ul className="flex flex-col gap-2">
                {Object.entries(analyticsSummary.visitsByReferralSource).map(([source, count]) => (
                  <StatRow key={source} label={source} value={count} />
                ))}
              </ul>
            </Card>
          )}
          {Object.keys(analyticsSummary.visitsByDeviceType).length > 0 && (
            <Card title="Device type">
              <ul className="flex flex-col gap-2">
                {Object.entries(analyticsSummary.visitsByDeviceType).map(([device, count]) => (
                  <StatRow key={device} label={device} value={count} />
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Card title="Setup progress" description="What's left before this website is ready to publish.">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
              <div
                className="h-full rounded-full bg-gradient-accent transition-[width] duration-500"
                style={{ width: `${checklist ? readinessPercent(checklist) : 0}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium">
              {checklist ? `${readinessPercent(checklist)}% ready` : "Checking…"}
            </span>
          </div>

          {checklist && (
            <ul className="flex flex-col gap-1.5 text-sm">
              {checklist.map((item) => {
                const contentHref = website.templateType === "PORTFOLIO" ? "/services" : "/menu";
                const linkSuffix = item.key === "content" ? contentHref : CHECKLIST_LINKS[item.key];
                return (
                  <li key={item.key} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        item.complete
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {item.complete ? "✓" : "!"}
                    </span>
                    <span className={item.complete ? "text-zinc-500 dark:text-zinc-400" : ""}>{item.label}</span>
                    {!item.complete && linkSuffix !== undefined && (
                      <Link
                        href={`/dashboard/websites/${website.id}${linkSuffix}`}
                        className="text-xs font-medium text-[var(--accent-solid)] hover:underline"
                      >
                        Fix →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {website.status === "DRAFT" && (
            <Link href={`/dashboard/websites/${website.id}/setup`} className="self-start">
              <Button variant="secondary" className="w-auto px-4">
                Continue guided setup
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <Card title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/websites/${website.id}${website.templateType === "PORTFOLIO" ? "/services" : "/menu"}`}>
            <Button variant="secondary" className="w-auto px-4">
              {website.templateType === "PORTFOLIO" ? "Add service" : "Add menu item"}
            </Button>
          </Link>
          <Link href={`/dashboard/websites/${website.id}/layout`}>
            <Button variant="secondary" className="w-auto px-4">
              Change template
            </Button>
          </Link>
          <Link href={`/preview/${website.id}`} target="_blank">
            <Button variant="secondary" className="w-auto px-4">
              Preview website
            </Button>
          </Link>
          {website.status === "PUBLISHED" && (
            <Link href={`/dashboard/websites/${website.id}/analytics`}>
              <Button variant="secondary" className="w-auto px-4">
                View analytics
              </Button>
            </Link>
          )}
        </div>
      </Card>

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
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Used for buttons and accents across your public site.</span>
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
