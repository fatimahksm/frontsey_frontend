"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { sectionsApi } from "@/lib/api/sections";
import type { PageSectionResponse, PageSectionType } from "@/lib/api/types";
import {
  emptySectionData,
  parseSectionData,
  serializeSectionData,
  SECTION_TYPE_DESCRIPTIONS,
  SECTION_TYPE_LABELS,
  type AboutSectionData,
  type FaqSectionData,
  type TeamSectionData,
  type TestimonialsSectionData,
} from "@/lib/website/page-sections";
import { useWebsite } from "@/lib/website/website-context";

const SECTION_TYPES: PageSectionType[] = ["ABOUT", "TESTIMONIALS", "FAQ", "TEAM"];

type DraftData = AboutSectionData | TestimonialsSectionData | FaqSectionData | TeamSectionData;

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function summarize(section: PageSectionResponse): string {
  const data = parseSectionData<{ heading: string; items?: unknown[]; body?: string }>(section.data, section.type);
  const count = Array.isArray(data.items) ? ` (${data.items.length})` : "";
  return `${data.heading}${count}`;
}

export default function SectionsPage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();
  const [sections, setSections] = useState<PageSectionResponse[]>([]);
  const [mode, setMode] = useState<"list" | "pick-type" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<PageSectionType | null>(null);
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const list = await sectionsApi.list(accessToken, website.id);
    setSections([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load sections."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  function startAdd(type: PageSectionType) {
    setEditingId(null);
    setEditingType(type);
    setDraft(emptySectionData(type));
    setMode("edit");
  }

  function startEdit(section: PageSectionResponse) {
    setEditingId(section.id);
    setEditingType(section.type);
    setDraft(parseSectionData(section.data, section.type));
    setMode("edit");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingType(null);
    setDraft(null);
    setMode("list");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingType || !draft) return;
    setError(null);
    setIsBusy(true);
    try {
      const request = { type: editingType, data: serializeSectionData(draft) };
      if (editingId) {
        await sectionsApi.update(accessToken, website.id, editingId, request);
      } else {
        await sectionsApi.create(accessToken, website.id, request);
      }
      cancelEdit();
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save section.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await sectionsApi.delete(accessToken, website.id, id);
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete section.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = moved(sections, index, target);
    setSections(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await sectionsApi.reorder(accessToken, website.id, reordered.map((s) => s.id));
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder sections.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sections</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Add extra sections beyond your core content - About, Testimonials, FAQ, or Team. Add as many as you like, in
          any order.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Your sections">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-2">
            {sections.map((section, index) => (
              <StaggerItem
                as="li"
                key={section.id}
                className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]"
              >
                <div className="min-w-0">
                  <span className="rounded-full bg-black/[.05] px-2 py-0.5 text-xs font-medium dark:bg-white/[.08]">
                    {SECTION_TYPE_LABELS[section.type]}
                  </span>
                  <p className="mt-1 truncate font-medium">{summarize(section)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button type="button" className="hover:underline" onClick={() => startEdit(section)}>
                    Edit
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(section.id)}>
                    Delete
                  </button>
                </div>
              </StaggerItem>
            ))}
            {sections.length === 0 && <p className="text-sm text-zinc-500">No extra sections yet.</p>}
          </StaggerGroup>
        )}
      </Card>

      {mode === "list" && (
        <Button className="w-auto px-5" onClick={() => setMode("pick-type")}>
          Add a section
        </Button>
      )}

      {mode === "pick-type" && (
        <Card title="Pick a section type">
          <StaggerGroup className="grid gap-4 sm:grid-cols-2">
            {SECTION_TYPES.map((type) => (
              <StaggerItem key={type}>
                <button
                  type="button"
                  onClick={() => startAdd(type)}
                  className="flex h-full w-full flex-col gap-1 rounded-xl border border-black/[.08] p-4 text-left text-sm shadow-soft transition-colors duration-200 hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.04]"
                >
                  <span className="font-semibold">{SECTION_TYPE_LABELS[type]}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{SECTION_TYPE_DESCRIPTIONS[type]}</span>
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Button variant="secondary" className="mt-4 w-auto px-5" onClick={() => setMode("list")}>
            Cancel
          </Button>
        </Card>
      )}

      {mode === "edit" && editingType && draft && (
        <Card title={editingId ? `Edit ${SECTION_TYPE_LABELS[editingType]}` : `Add ${SECTION_TYPE_LABELS[editingType]}`}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SectionForm type={editingType} draft={draft} onChange={setDraft} accessToken={accessToken} />
            <div className="flex gap-3">
              <Button type="submit" isLoading={isBusy} className="w-auto px-5">
                {editingId ? "Save changes" : "Add section"}
              </Button>
              <Button type="button" variant="secondary" className="w-auto px-5" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function SectionForm({
  type,
  draft,
  onChange,
  accessToken,
}: {
  type: PageSectionType;
  draft: DraftData;
  onChange(next: DraftData): void;
  accessToken: string;
}) {
  if (type === "ABOUT") {
    const data = draft as AboutSectionData;
    return (
      <>
        <TextField id="aboutHeading" label="Heading" value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} />
        <Textarea id="aboutBody" label="Body" value={data.body} onChange={(e) => onChange({ ...data, body: e.target.value })} />
        <ImageUploadField
          id="aboutImage"
          label="Image (optional)"
          value={data.imageUrl ?? ""}
          onChange={(url) => onChange({ ...data, imageUrl: url || null })}
          accessToken={accessToken}
        />
      </>
    );
  }

  if (type === "TESTIMONIALS") {
    const data = draft as TestimonialsSectionData;
    return (
      <>
        <TextField id="testimonialsHeading" label="Heading" value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} />
        <RepeatableItems
          items={data.items}
          onChange={(items) => onChange({ ...data, items })}
          emptyItem={{ name: "", quote: "", imageUrl: null }}
          renderFields={(item, update, index) => (
            <>
              <TextField id={`testimonialName${index}`} label="Name" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} />
              <Textarea id={`testimonialQuote${index}`} label="Quote" value={item.quote} onChange={(e) => update({ ...item, quote: e.target.value })} />
              <ImageUploadField
                id={`testimonialImage${index}`}
                label="Photo (optional)"
                value={item.imageUrl ?? ""}
                onChange={(url) => update({ ...item, imageUrl: url || null })}
                accessToken={accessToken}
              />
            </>
          )}
        />
      </>
    );
  }

  if (type === "FAQ") {
    const data = draft as FaqSectionData;
    return (
      <>
        <TextField id="faqHeading" label="Heading" value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} />
        <RepeatableItems
          items={data.items}
          onChange={(items) => onChange({ ...data, items })}
          emptyItem={{ question: "", answer: "" }}
          renderFields={(item, update, index) => (
            <>
              <TextField id={`faqQuestion${index}`} label="Question" value={item.question} onChange={(e) => update({ ...item, question: e.target.value })} />
              <Textarea id={`faqAnswer${index}`} label="Answer" value={item.answer} onChange={(e) => update({ ...item, answer: e.target.value })} />
            </>
          )}
        />
      </>
    );
  }

  const data = draft as TeamSectionData;
  return (
    <>
      <TextField id="teamHeading" label="Heading" value={data.heading} onChange={(e) => onChange({ ...data, heading: e.target.value })} />
      <RepeatableItems
        items={data.items}
        onChange={(items) => onChange({ ...data, items })}
        emptyItem={{ name: "", role: "", imageUrl: null }}
        renderFields={(item, update, index) => (
          <>
            <TextField id={`teamName${index}`} label="Name" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} />
            <TextField id={`teamRole${index}`} label="Role" value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} />
            <ImageUploadField
              id={`teamImage${index}`}
              label="Photo (optional)"
              value={item.imageUrl ?? ""}
              onChange={(url) => update({ ...item, imageUrl: url || null })}
              accessToken={accessToken}
            />
          </>
        )}
      />
    </>
  );
}

function RepeatableItems<T>({
  items,
  onChange,
  emptyItem,
  renderFields,
}: {
  items: T[];
  onChange(items: T[]): void;
  emptyItem: T;
  renderFields(item: T, update: (next: T) => void, index: number): React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border border-dashed border-black/[.12] p-4 dark:border-white/[.18]">
          {renderFields(item, (next) => onChange(items.map((it, i) => (i === index ? next : it))), index)}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="self-start text-xs font-medium text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, emptyItem])}
        className="self-start text-sm font-medium text-[var(--accent-solid)] hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}
