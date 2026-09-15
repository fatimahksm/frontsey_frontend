"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { ThemeResponse } from "@/lib/api/types";
import { effectiveTheme, parseThemeConfig, type ThemeConfig } from "@/lib/website/theme-config";
import { useWebsite } from "@/lib/website/website-context";

/**
 * Wizard step - the website's colours.
 *
 * Setup had no theme step at all, which left the one genuinely first-build
 * decision the console deliberately does not carry (template and theme are
 * chosen once; the console is for running the site afterwards) with nowhere to
 * be made. An owner had to find it in the dashboard sidebar afterwards, if they
 * found it at all.
 *
 * Deliberately not the full theme editor. That page has fonts, radii, card
 * styles and section spacing, and it belongs where somebody can take their time
 * over it. Here the question is only "what colour is my site", answered by
 * looking at swatches, with a link to the rest for anyone who wants it.
 */

/** A preset as three colours, so the choice can be made by eye. */
function swatchOf(raw: string | null): Pick<ThemeConfig, "backgroundColor" | "textColor" | "primaryColor"> {
  const config = parseThemeConfig(raw);
  return {
    backgroundColor: config.backgroundColor,
    textColor: config.textColor,
    primaryColor: config.primaryColor,
  };
}

function Swatch({ colors, label }: { colors: ReturnType<typeof swatchOf>; label: string }) {
  return (
    <span
      aria-hidden
      className="flex h-14 w-20 shrink-0 flex-col justify-between rounded-lg border border-line-strong p-2"
      style={{ background: colors.backgroundColor, color: colors.textColor }}
    >
      <span className="text-[11px] font-semibold leading-none">{label}</span>
      <span className="h-2 w-8 rounded-full" style={{ background: colors.primaryColor }} />
    </span>
  );
}

export function StepTheme({ onContinue }: { onContinue(): void }) {
  const { website, accessToken, reload } = useWebsite();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    themeApi
      .list()
      .then(setThemes)
      .catch((err) => setError(friendlyMessage(err, "Failed to load themes.")));
  }, []);

  async function choose(themeId: string | null) {
    setError(null);
    setIsBusy(true);
    try {
      await websitesApi.updateTheme(accessToken, website.id, themeId);
      await reload();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update the theme."));
    } finally {
      setIsBusy(false);
    }
  }

  // What "no preset" actually looks like for this template - its own signature
  // palette, not a blank white page. Showing the real thing beats the words
  // "build from scratch", which told an owner nothing about what they'd get.
  const templateOwn = effectiveTheme(parseThemeConfig(null), website.layoutVariant);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Pick your colours</h2>
        <p className="mt-1 text-sm text-muted">
          This is a first-build choice, so it is made here rather than in your console. You can still change it later
          from Design → Theme.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <ul className="flex flex-col gap-2">
        <li className="flex items-center gap-4 rounded-xl border border-line p-3">
          <Swatch
            colors={{
              backgroundColor: templateOwn.backgroundColor,
              textColor: templateOwn.textColor,
              primaryColor: templateOwn.primaryColor,
            }}
            label="Aa"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">The template&apos;s own look</p>
            <p className="text-xs text-muted">
              The colours this template was designed in. A good default.
            </p>
          </div>
          <Button
 variant={website.themeId === null ? "primary" : "secondary"}
            className="shrink-0"
            onClick={() => choose(null)}
            isLoading={isBusy}
          >
            {website.themeId === null ? "Selected" : "Use this"}
          </Button>
        </li>

        {themes.map((theme) => (
          <li
            key={theme.id}
            className="flex items-center gap-4 rounded-xl border border-line p-3"
          >
            <Swatch colors={swatchOf(theme.themeConfig)} label="Aa" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{theme.name}</p>
              {theme.description && (
                <p className="text-xs text-muted">{theme.description}</p>
              )}
            </div>
            <Button
 variant={website.themeId === theme.id ? "primary" : "secondary"}
              className="shrink-0"
              onClick={() => choose(theme.id)}
              isLoading={isBusy}
            >
              {website.themeId === theme.id ? "Selected" : "Use this"}
            </Button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted">
        Want to set exact colours, fonts and corners?{" "}
        <Link href={`/manage/${website.id}/theme`} className="font-medium text-[var(--accent-solid)] hover:underline">
          Open the full theme editor
        </Link>
        .
      </p>

      <Button onClick={onContinue} className="self-start">
        Continue
      </Button>
    </div>
  );
}
