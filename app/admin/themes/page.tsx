"use client";

import { useEffect, useState } from "react";

import { ThemeConfigForm } from "@/components/admin/ThemeConfigForm";
import { ScaledPreviewFrame } from "@/components/dashboard/ScaledPreviewFrame";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ThemeResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { DEFAULT_THEME_CONFIG, parseThemeConfig, serializeThemeConfig, type ThemeConfig } from "@/lib/website/theme-config";

interface ThemeDraft {
  name: string;
  description: string;
  config: ThemeConfig;
  active: boolean;
}

const EMPTY: ThemeDraft = { name: "", description: "", config: DEFAULT_THEME_CONFIG, active: true };

export default function AdminThemesPage() {
  const { session } = useAuth();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [draft, setDraft] = useState<ThemeDraft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    if (!session) return;
    setThemes(await adminApi.listThemes(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load themes."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !draft.name.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      const request = {
        name: draft.name,
        description: draft.description,
        themeConfig: serializeThemeConfig(draft.config),
        active: draft.active,
      };
      if (editingId) {
        await adminApi.updateTheme(session.accessToken, editingId, request);
      } else {
        await adminApi.createTheme(session.accessToken, request);
      }
      setDraft(EMPTY);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save theme.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!session) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.deleteTheme(session.accessToken, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete theme.");
    } finally {
      setIsBusy(false);
    }
  }

  function startEdit(theme: ThemeResponse) {
    setEditingId(theme.id);
    setDraft({ name: theme.name, description: theme.description ?? "", config: parseThemeConfig(theme.themeConfig), active: true });
  }

  function updateConfig<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setDraft((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Themes</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Presets">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-2">
            {themes.map((theme) => (
              <StaggerItem as="li" key={theme.id} className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                <div>
                  <p className="font-medium">{theme.name}</p>
                  {theme.description && <p className="text-xs text-zinc-500">{theme.description}</p>}
                </div>
                <div className="flex gap-3 text-xs">
                  <button type="button" className="hover:underline" onClick={() => startEdit(theme)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(theme.id)}>
                    Delete
                  </button>
                </div>
              </StaggerItem>
            ))}
            {themes.length === 0 && <p className="text-sm text-zinc-500">No themes yet.</p>}
          </StaggerGroup>
        )}
      </Card>

      <Card title={editingId ? "Edit theme" : "New theme"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField id="themeName" label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Textarea
            id="themeDescription"
            label="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ThemeConfigForm config={draft.config} onChange={updateConfig} />
            <div>
              <p className="mb-2 text-sm font-medium">Live preview</p>
              <div className="flex justify-center overflow-x-auto rounded-2xl border border-black/[.08] bg-white p-2 dark:border-white/[.145]">
                <ScaledPreviewFrame width={480} height={340}>
                  <PublicSiteRenderer site={{ ...mockSiteFor("MENU_CLASSIC"), theme: draft.config }} onFirstView={() => {}} />
                </ScaledPreviewFrame>
              </div>
            </div>
          </div>

          <Checkbox id="themeActive" label="Active" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isBusy} className="w-auto px-5">
              {editingId ? "Save changes" : "Create theme"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                className="w-auto px-5"
                onClick={() => {
                  setEditingId(null);
                  setDraft(EMPTY);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
