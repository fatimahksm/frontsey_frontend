"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { ThemeResponse } from "@/lib/api/types";
import { parseDraftContent, serializeDraftContent } from "@/lib/website/draft-content";
import { useWebsite } from "@/lib/website/website-context";

/**
 * Wizard Step 5 - the two design controls that genuinely affect public
 * rendering today: theme preset (or "build from scratch") and brand color.
 * Font/button/card-style pickers are intentionally not shown here since
 * they don't yet affect the public renderer (see Phase 3) - adding them
 * now would be a misleading, non-functional control.
 */
export function StepDesign({ onContinue }: { onContinue(): void }) {
  const { website, accessToken, reload } = useWebsite();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [brandColor, setBrandColor] = useState(parseDraftContent(website.draftContent).brandColor);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    themeApi.list().then(setThemes).catch(() => setThemes([]));
  }, []);

  async function handleSelectTheme(themeId: string | null) {
    setError(null);
    setIsBusy(true);
    try {
      await websitesApi.updateTheme(accessToken, website.id, themeId);
      await reload();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update theme."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveAndContinue() {
    setError(null);
    setIsBusy(true);
    try {
      const current = parseDraftContent(website.draftContent);
      await websitesApi.saveDraft(accessToken, website.id, {
        content: serializeDraftContent({ ...current, brandColor }),
        orderingMode: website.orderingMode,
      });
      await reload();
      onContinue();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save your design choices."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Customize design</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pick a starting theme and your brand color. Changes appear in the preview on the next step.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Theme</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSelectTheme(null)}
            disabled={isBusy}
            className={`rounded-xl border p-3 text-left text-sm transition-colors disabled:opacity-50 ${
              website.themeId === null ? "border-[var(--accent-solid)] bg-black/[.02] dark:bg-white/[.04]" : "border-black/[.1] dark:border-white/[.16]"
            }`}
          >
            <span className="font-medium">Build from scratch</span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">No preset - fully custom sections.</span>
          </button>
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelectTheme(theme.id)}
              disabled={isBusy}
              className={`rounded-xl border p-3 text-left text-sm transition-colors disabled:opacity-50 ${
                website.themeId === theme.id ? "border-[var(--accent-solid)] bg-black/[.02] dark:bg-white/[.04]" : "border-black/[.1] dark:border-white/[.16]"
              }`}
            >
              <span className="font-medium">{theme.name}</span>
              {theme.description && <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{theme.description}</span>}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="wizardBrandColor" className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Brand color</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Used for buttons and accents across your public site.</span>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black/[.15] bg-surface p-1 dark:border-white/[.3]">
            <input
              id="wizardBrandColor"
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-full w-full cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </div>
          <span className="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400">{brandColor}</span>
        </div>
      </label>

      <Button onClick={handleSaveAndContinue} isLoading={isBusy} className="w-auto self-start px-6">
        Save and continue
      </Button>
    </div>
  );
}
