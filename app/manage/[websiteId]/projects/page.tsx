"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { friendlyMessage } from "@/lib/api/client";
import { projectsApi } from "@/lib/api/projects";
import type { PortfolioProjectRequest, PortfolioProjectResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

/**
 * The Projects editor.
 *
 * This page exists because of a gap the templates could not paper over: a
 * portfolio's work needs a title, a date, a description and a link, and until
 * now the only place to put any of that was hand-written JSON inside a custom
 * section. Owners could upload pictures and nothing else, so every real site
 * showed untitled images while the design gallery's samples looked finished.
 *
 * One deliberate choice about the form: only the title is required. Every
 * template renders the fields that are filled and hides the rest, so a half-
 * filled project still looks composed - which is why the helper text says so
 * rather than marking six fields optional and hoping.
 */

/** Empty form state - also what "Add project" resets to. */
const BLANK: PortfolioProjectRequest = {
  name: "",
  discipline: "",
  year: "",
  summary: "",
  tags: "",
  imageUrl: "",
  liveUrl: "",
  repoUrl: "",
};

function toForm(project: PortfolioProjectResponse): PortfolioProjectRequest {
  return {
    name: project.name,
    discipline: project.discipline ?? "",
    year: project.year ?? "",
    summary: project.summary ?? "",
    // Stored comma-separated, split for the templates, rejoined for the form.
    tags: project.tags.join(", "),
    imageUrl: project.imageUrl ?? "",
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
  };
}

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function ProjectsPage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();
  const [projects, setProjects] = useState<PortfolioProjectResponse[]>([]);
  const [form, setForm] = useState<PortfolioProjectRequest>(BLANK);
  /** null = the form is adding; an id = the form is editing that project. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const list = await projectsApi.list(accessToken, website.id);
    setProjects([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load your projects.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  function set<K extends keyof PortfolioProjectRequest>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startAdding() {
    setForm(BLANK);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function startEditing(project: PortfolioProjectResponse) {
    setForm(toForm(project));
    setEditingId(project.id);
    setIsFormOpen(true);
  }

  function cancel() {
    setForm(BLANK);
    setEditingId(null);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name?.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      if (editingId) {
        await projectsApi.update(accessToken, website.id, editingId, form);
      } else {
        await projectsApi.create(accessToken, website.id, form);
      }
      await load();
      notifyDraftChanged();
      cancel();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save the project."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(project: PortfolioProjectResponse) {
    if (!window.confirm(`Remove "${project.name}" from your website?`)) return;
    setError(null);
    setIsBusy(true);
    try {
      await projectsApi.delete(accessToken, website.id, project.id);
      if (editingId === project.id) cancel();
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to remove the project."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const reordered = moved(projects, index, target);
    // Optimistic, so the arrows feel immediate; `load()` below is the authority.
    setProjects(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await projectsApi.reorder(accessToken, website.id, reordered.map((p) => p.id));
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to reorder your projects."));
      await load().catch(() => undefined);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            The work your website shows. Add a title and a picture to start - every other field is optional, and your
            template simply leaves out whatever you have not filled in.
          </p>
        </div>
        {!isFormOpen && (
          <Button type="button" className="!w-auto shrink-0 px-5" onClick={startAdding}>
            Add project
          </Button>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {isFormOpen && (
        <Card
          title={editingId ? "Edit project" : "New project"}
          description="Only the title is required. Fill in the rest whenever you like."
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              id="name"
              label="Title"
              required
              placeholder="e.g. Meridian brand identity"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="discipline"
                label="Type of work"
                placeholder="e.g. Brand identity, Kitchen fit-out, Wedding shoot"
                value={form.discipline ?? ""}
                onChange={(e) => set("discipline", e.target.value)}
              />
              <TextField
                id="year"
                label="When"
                placeholder="e.g. 2026, or Spring 2025"
                value={form.year ?? ""}
                onChange={(e) => set("year", e.target.value)}
              />
            </div>
            <Textarea
              id="summary"
              label="Description"
              placeholder="A sentence or two about what you did and how it turned out."
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
            />
            <TextField
              id="tags"
              label="Labels"
              placeholder="Separate with commas - e.g. Packaging, Print, Photography"
              value={form.tags ?? ""}
              onChange={(e) => set("tags", e.target.value)}
            />
            <ImageUploadField
              id="imageUrl"
              label="Picture"
              helperText="One image for this project. Landscape photos look best in every template."
              value={form.imageUrl ?? ""}
              onChange={(url) => set("imageUrl", url)}
              accessToken={accessToken}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="liveUrl"
                label="Link"
                placeholder="https://…"
                value={form.liveUrl ?? ""}
                onChange={(e) => set("liveUrl", e.target.value)}
              />
              <TextField
                id="repoUrl"
                label="Second link"
                placeholder="https://… (optional)"
                value={form.repoUrl ?? ""}
                onChange={(e) => set("repoUrl", e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={isBusy} className="w-auto px-5">
                {editingId ? "Save changes" : "Add project"}
              </Button>
              <Button type="button" variant="secondary" className="w-auto px-5" onClick={cancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Your projects" description="Drag order with the arrows - visitors see them top to bottom.">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/[.12] p-8 text-center dark:border-white/[.16]">
            <p className="text-sm font-medium">No projects yet.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Until you add one, your website falls back to the pictures in your Gallery, shown without titles. Adding
              projects here is what gives each piece of work a name, a date and a link.
            </p>
            <Button type="button" className="mx-auto mt-4 w-auto px-5" onClick={startAdding}>
              Add your first project
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {projects.map((project, index) => (
              <li
                key={project.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-black/[.08] p-3 dark:border-white/[.12]"
              >
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URLs; next/image would need a configured remote pattern per business
                  <img src={project.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-black/[.12] text-xs text-zinc-400 dark:border-white/[.16]">
                    No picture
                  </div>
                )}
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {[project.discipline, project.year].filter(Boolean).join(" · ") || "No details yet"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === projects.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button type="button" className="hover:underline" onClick={() => startEditing(project)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(project)}>
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
