"use client";

import { useEffect, useMemo, useState } from "react";

import { ThemeConfigForm } from "@/components/theme/ThemeConfigForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { ThemeResponse } from "@/lib/api/types";
import { parseThemeConfig, serializeThemeConfig, type ThemeConfig } from "@/lib/website/theme-config";
import { useWebsite } from "@/lib/website/website-context";

export default function ThemePage() {
  const { website, accessToken, reload } = useWebsite();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [draft, setDraft] = useState<ThemeConfig | null>(null);

  /**
   * What the site looks like right now: this website's own overrides if it has
   * any, otherwise the selected preset, otherwise the built-in defaults - the
   * same order the public renderer resolves in.
   */
  const inheritedConfig = useMemo(() => {
    if (website.themeConfig) return parseThemeConfig(website.themeConfig);
    const preset = themes.find((t) => t.id === website.themeId);
    return parseThemeConfig(preset?.themeConfig ?? null);
  }, [website.themeConfig, website.themeId, themes]);

  // Customising starts from whatever is on screen, so opening the editor never
  // changes the design by itself - the owner tweaks from where they already are.
  const config = draft ?? inheritedConfig;
  const isCustomised = website.themeConfig !== null;

  useEffect(() => {
    themeApi
      .list()
      .then(setThemes)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load themes."));
  }, []);

  async function handleSelect(themeId: string | null) {
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await websitesApi.updateTheme(accessToken, website.id, themeId);
      await reload();
      setMessage("Theme updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update theme.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveConfig() {
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await websitesApi.updateThemeConfig(accessToken, website.id, serializeThemeConfig(config));
      await reload();
      setDraft(null);
      setMessage("Colours updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save colours.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleResetConfig() {
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await websitesApi.updateThemeConfig(accessToken, website.id, null);
      await reload();
      setDraft(null);
      setMessage("Reverted to the preset.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset colours.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Theme</h1>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Build from scratch">
        <div className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
          <span className="text-sm">No preset theme - fully custom sections.</span>
          <Button
            variant={website.themeId === null ? "primary" : "secondary"}
            className="w-auto px-4"
            onClick={() => handleSelect(null)}
            isLoading={isBusy}
          >
            {website.themeId === null ? "Selected" : "Select"}
          </Button>
        </div>
      </Card>

      <Card title="Presets">
        <ul className="flex flex-col gap-2">
          {themes.map((theme) => (
            <li
              key={theme.id}
              className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]"
            >
              <div>
                <p className="text-sm font-medium">{theme.name}</p>
                {theme.description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{theme.description}</p>}
              </div>
              <Button
                variant={website.themeId === theme.id ? "primary" : "secondary"}
                className="w-auto px-4"
                onClick={() => handleSelect(theme.id)}
                isLoading={isBusy}
              >
                {website.themeId === theme.id ? "Selected" : "Select"}
              </Button>
            </li>
          ))}
          {themes.length === 0 && <p className="text-sm text-zinc-500">No preset themes available.</p>}
        </ul>
      </Card>

      <Card title="Colours & typography">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isCustomised
              ? "This website uses its own colours. Reset to go back to the preset above."
              : "Adjust anything here to make this website's own version of the preset above. The preset itself is left unchanged."}
          </p>

          <ThemeConfigForm config={config} onChange={(key, value) => setDraft({ ...config, [key]: value })} />

          <div className="flex flex-wrap items-center gap-2">
            <Button className="w-auto px-4" onClick={handleSaveConfig} isLoading={isBusy} disabled={draft === null}>
              Save colours
            </Button>
            {draft !== null && (
              <Button variant="secondary" className="w-auto px-4" onClick={() => setDraft(null)} disabled={isBusy}>
                Discard changes
              </Button>
            )}
            {isCustomised && draft === null && (
              <Button variant="secondary" className="w-auto px-4" onClick={handleResetConfig} isLoading={isBusy}>
                Reset to preset
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
