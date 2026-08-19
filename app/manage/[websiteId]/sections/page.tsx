"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { friendlyMessage } from "@/lib/api/client";
import { sectionsApi } from "@/lib/api/sections";
import type { PageSectionResponse, PageSectionType } from "@/lib/api/types";
import {
  emptySectionData,
  parseSectionData,
  serializeSectionData,
  SECTION_TYPE_LABELS,
  type AboutSectionData,
  type FaqSectionData,
  type TeamSectionData,
  type TestimonialsSectionData,
} from "@/lib/website/page-sections";
import { contentPlanFor, sectionLabel } from "@/lib/website/template-content";
import { useWebsite } from "@/lib/website/website-context";

type DraftData = AboutSectionData | TestimonialsSectionData | FaqSectionData | TeamSectionData;

/** What is actually in a block, in one line, for the list. */
function summarize(section: PageSectionResponse): string {
  const data = parseSectionData<{ heading: string; items?: unknown[]; body?: string }>(section.data, section.type);
  if (Array.isArray(data.items)) return `${data.items.length} ${data.items.length === 1 ? "entry" : "entries"}`;
  const body = (data.body ?? "").trim();
  return body ? `${body.slice(0, 80)}${body.length > 80 ? "…" : ""}` : "Empty";
}

export default function SectionsPage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();

  // Every name on this page comes from the template's plan, so the editor calls
  // each block what the site calls it.
  const planLabel = sectionLabel(website.layoutVariant, "sections", "Sections");
  const blocks = contentPlanFor(website.layoutVariant).blocks;
  const [sections, setSections] = useState<PageSectionResponse[]>([]);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<PageSectionType | null>(null);
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // A block the template does not define, or a second copy of one it does.
  const blockTypes = new Set(blocks.map((block) => block.type));
  const claimed = new Set<string>();
  for (const block of blocks) {
    const first = sections.find((section) => section.type === block.type);
    if (first) claimed.add(first.id);
  }
  const leftovers = sections.filter((section) => !claimed.has(section.id) || !blockTypes.has(section.type));

  async function load() {
    const list = await sectionsApi.list(accessToken, website.id);
    setSections([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load sections.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  /**
   * Open a block for editing, whether or not it has been filled in yet.
   *
   * There is no "pick a type" step any more: the template decides which blocks
   * its page has, so the only choice left is what goes in them.
   */
  function openBlock(type: PageSectionType, existing?: PageSectionResponse) {
    setEditingId(existing?.id ?? null);
    setEditingType(type);
    setDraft(existing ? parseSectionData(existing.data, existing.type) : emptySectionData(type));
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
      setError(friendlyMessage(err, "Failed to save section."));
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
      setError(friendlyMessage(err, "Failed to delete section."));
    } finally {
      setIsBusy(false);
    }
  }


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{planLabel}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The blocks your template&apos;s page is made of. Fill in the ones you want; anything left empty is simply not
          shown.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      {mode === "list" && (
        <>
          {blocks.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This template is deliberately just your menu - it has no extra blocks.
              </p>
            </Card>
          ) : isLoading ? (
            <Card>
              <p className="text-sm text-zinc-500">Loading…</p>
            </Card>
          ) : (
            <StaggerGroup as="ul" className="flex flex-col gap-3">
              {blocks.map((block) => {
                const existing = sections.find((section) => section.type === block.type);
                return (
                  <StaggerItem
                    as="li"
                    key={block.type}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[.08] bg-surface p-4 dark:border-white/[.12]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{block.label}</p>
                        {!existing && (
                          <span className="rounded-full bg-black/[.05] px-2 py-0.5 text-xs text-zinc-500 dark:bg-white/[.08] dark:text-zinc-400">
                            Not shown yet
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {existing ? summarize(existing) : block.hint}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => openBlock(block.type, existing)}
                        className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background"
                      >
                        {existing ? "Edit" : "Add"}
                      </button>
                      {existing && (
                        <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(existing.id)}>
                          Clear
                        </button>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          )}

          {/* Content saved under a previous template, or duplicated before the
              blocks were fixed. Never dropped silently - shown, labelled, and
              removable, so switching template cannot lose someone's writing. */}
          {leftovers.length > 0 && (
            <Card
              title="Not part of this template"
              description="Written earlier, or under a different template. Your page doesn't show it."
            >
              <ul className="flex flex-col gap-2">
                {leftovers.map((section) => (
                  <li
                    key={section.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-black/[.12] p-3 text-sm dark:border-white/[.18]"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{SECTION_TYPE_LABELS[section.type]}</span>
                      <span className="ms-2 text-zinc-500 dark:text-zinc-400">{summarize(section)}</span>
                    </span>
                    <button type="button" className="shrink-0 text-red-600 hover:underline" onClick={() => handleDelete(section.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {mode === "edit" && editingType && draft && (
        <Card
          title={blocks.find((block) => block.type === editingType)?.label ?? SECTION_TYPE_LABELS[editingType]}
          description={blocks.find((block) => block.type === editingType)?.hint}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SectionForm type={editingType} draft={draft} onChange={setDraft} accessToken={accessToken} />
            <div className="flex gap-3">
              <Button type="submit" isLoading={isBusy} className="!w-auto px-5">
                Save
              </Button>
              <Button type="button" variant="secondary" className="!w-auto px-5" onClick={cancelEdit}>
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
