"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { friendlyMessage } from "@/lib/api/client";
import { experienceApi } from "@/lib/api/experience";
import type { ExperienceEntryRequest, ExperienceEntryResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

/**
 * The Experience editor.
 *
 * Two of the Portfolio templates have always rendered a work timeline, reading
 * it from `about.experience` in a section's free-form JSON - which no screen in
 * the console could write. So the timeline appeared on the seeded samples in
 * the design gallery and could never appear on a real owner's site, because
 * there was nowhere to type it. This is that nowhere.
 *
 * Only the job title is required, for the same reason only a project needs a
 * name: the templates render what is filled and hide the rest, so a line that
 * says nothing but "Freelance" still looks composed.
 */

/** Empty form state - also what "Add" resets to. */
const BLANK: ExperienceEntryRequest = {
  role: "",
  company: "",
  year: "",
  detail: "",
};

function toForm(entry: ExperienceEntryResponse): ExperienceEntryRequest {
  return {
    role: entry.role,
    company: entry.company ?? "",
    year: entry.year ?? "",
    detail: entry.detail ?? "",
  };
}

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function ExperiencePage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();
  const [entries, setEntries] = useState<ExperienceEntryResponse[]>([]);
  const [form, setForm] = useState<ExperienceEntryRequest>(BLANK);
  /** null = the form is adding; an id = the form is editing that entry. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const list = await experienceApi.list(accessToken, website.id);
    setEntries([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load your experience.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  function set<K extends keyof ExperienceEntryRequest>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startAdding() {
    setForm(BLANK);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function startEditing(entry: ExperienceEntryResponse) {
    setForm(toForm(entry));
    setEditingId(entry.id);
    setIsFormOpen(true);
  }

  function cancel() {
    setForm(BLANK);
    setEditingId(null);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.role?.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      if (editingId) {
        await experienceApi.update(accessToken, website.id, editingId, form);
      } else {
        await experienceApi.create(accessToken, website.id, form);
      }
      await load();
      notifyDraftChanged();
      cancel();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save that entry."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(entry: ExperienceEntryResponse) {
    if (!window.confirm(`Remove "${entry.role}" from your website?`)) return;
    setError(null);
    setIsBusy(true);
    try {
      await experienceApi.delete(accessToken, website.id, entry.id);
      if (editingId === entry.id) cancel();
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to remove that entry."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const reordered = moved(entries, index, target);
    // Optimistic, so the arrows feel immediate; `load()` below is the authority.
    setEntries(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await experienceApi.reorder(accessToken, website.id, reordered.map((e) => e.id));
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to reorder your experience."));
      await load().catch(() => undefined);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!isFormOpen && (
        <div className="flex justify-end">
          <Button type="button" onClick={startAdding}>
            Add
          </Button>
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {isFormOpen && (
        <Card
          title={editingId ? "Edit entry" : "Add an entry"}
          description="The job title is all that is required - your template leaves out whatever you have not filled in."
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="role"
                label="Job title"
                placeholder="e.g. Lead designer"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                required
              />
              <TextField
                id="company"
                label="Where"
                placeholder="e.g. Studio Beirut"
                value={form.company ?? ""}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <TextField
              id="year"
              label="When"
              // Free text rather than two date pickers: people write their
              // history as "2021-24" or "2019 - Present", and a picker would
              // force a precision nobody has or wants on a portfolio.
              placeholder="e.g. 2021-24, or 2019 - Present"
              value={form.year ?? ""}
              onChange={(e) => set("year", e.target.value)}
            />
            <Textarea
              id="detail"
              label="What you did"
              placeholder="A line about the work. Leave it blank if the title says enough."
              value={form.detail ?? ""}
              onChange={(e) => set("detail", e.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={isBusy} >
                {editingId ? "Save changes" : "Add entry"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Your experience" description="Reorder with the arrows - visitors see them top to bottom.">
        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-8 text-center">
            <p className="text-sm font-medium">Nothing here yet.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Your website leaves the timeline out entirely until you add a line, so there is no empty section on your
              page while you think about it.
            </p>
            <Button type="button" className="mx-auto mt-4" onClick={startAdding}>
              Add your first entry
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-3"
              >
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium">
                    {entry.role}
                    {entry.company && <span className="text-muted"> · {entry.company}</span>}
                  </p>
                  <p className="text-xs text-muted">{entry.year || "No dates yet"}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === entries.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button type="button" className="hover:underline" onClick={() => startEditing(entry)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(entry)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
