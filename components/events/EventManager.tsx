"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { friendlyMessage } from "@/lib/api/client";
import { eventsApi } from "@/lib/api/events";
import type { EventDetailsRequest, ScheduleEntryRequest, ScheduleEntryResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

const EMPTY_DETAILS: EventDetailsRequest = {
  eventDate: "",
  startTime: "",
  endTime: "",
  venueName: "",
  dressCode: "",
  rsvpBy: "",
  note: "",
};

const EMPTY_ENTRY: ScheduleEntryRequest = { time: "", title: "", detail: "" };

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/** Blank strings are how an empty text input reads; the API wants null for "not set". */
function orNull(value: string | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * The occasion and its running order.
 *
 * Every field is free text on purpose, including the date and the times. Hosts
 * write "14 June 2026", "Saturday the 14th", "after sunset" - a date picker
 * that refuses the third makes for a worse invitation, not a tidier one.
 */
export function EventManager() {
  const { website, accessToken } = useWebsite();
  const [details, setDetails] = useState<EventDetailsRequest>(EMPTY_DETAILS);
  const [schedule, setSchedule] = useState<ScheduleEntryResponse[]>([]);
  const [draft, setDraft] = useState<ScheduleEntryRequest>(EMPTY_ENTRY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const [loadedDetails, loadedSchedule] = await Promise.all([
      eventsApi.details(accessToken, website.id),
      eventsApi.schedule(accessToken, website.id),
    ]);
    setDetails({
      eventDate: loadedDetails.eventDate ?? "",
      startTime: loadedDetails.startTime ?? "",
      endTime: loadedDetails.endTime ?? "",
      venueName: loadedDetails.venueName ?? "",
      dressCode: loadedDetails.dressCode ?? "",
      rsvpBy: loadedDetails.rsvpBy ?? "",
      note: loadedDetails.note ?? "",
    });
    setSchedule([...loadedSchedule].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load the event.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function saveDetails(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsBusy(true);
    try {
      await eventsApi.saveDetails(accessToken, website.id, {
        eventDate: orNull(details.eventDate),
        startTime: orNull(details.startTime),
        endTime: orNull(details.endTime),
        venueName: orNull(details.venueName),
        dressCode: orNull(details.dressCode),
        rsvpBy: orNull(details.rsvpBy),
        note: orNull(details.note),
      });
      setSaved(true);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save the event details."));
    } finally {
      setIsBusy(false);
    }
  }

  async function submitEntry(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      const request: ScheduleEntryRequest = {
        time: orNull(draft.time),
        title: draft.title.trim(),
        detail: orNull(draft.detail),
      };
      if (editingId) {
        await eventsApi.updateEntry(accessToken, website.id, editingId, request);
      } else {
        await eventsApi.addEntry(accessToken, website.id, request);
      }
      setDraft(EMPTY_ENTRY);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save that line."));
    } finally {
      setIsBusy(false);
    }
  }

  async function removeEntry(id: string) {
    setError(null);
    try {
      await eventsApi.deleteEntry(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to remove that line."));
    }
  }

  async function reorder(from: number, to: number) {
    if (to < 0 || to >= schedule.length) return;
    const next = moved(schedule, from, to);
    // Shown in the new order straight away; the server is told after, and a
    // failure reloads the truth rather than leaving the list lying.
    setSchedule(next);
    try {
      await eventsApi.reorder(accessToken, website.id, next.map((entry) => entry.id));
    } catch (err) {
      setError(friendlyMessage(err, "Failed to reorder the day."));
      await load().catch(() => {});
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <form onSubmit={saveDetails} className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold">The occasion</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Write these however you say them out loud - &ldquo;Saturday the 14th&rdquo; and &ldquo;after sunset&rdquo; are
              perfectly good answers. Anything you leave blank simply will not appear.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Date"
              value={details.eventDate ?? ""}
              onChange={(e) => setDetails({ ...details, eventDate: e.target.value })}
              placeholder="Saturday 14 June 2026"
            />
            <TextField
              label="Venue"
              value={details.venueName ?? ""}
              onChange={(e) => setDetails({ ...details, venueName: e.target.value })}
              placeholder="The Old Orangery"
            />
            <TextField
              label="Starts"
              value={details.startTime ?? ""}
              onChange={(e) => setDetails({ ...details, startTime: e.target.value })}
              placeholder="6:00 PM"
            />
            <TextField
              label="Ends"
              value={details.endTime ?? ""}
              onChange={(e) => setDetails({ ...details, endTime: e.target.value })}
              placeholder="late"
            />
            <TextField
              label="Dress code"
              value={details.dressCode ?? ""}
              onChange={(e) => setDetails({ ...details, dressCode: e.target.value })}
              placeholder="Summer formal"
            />
            <TextField
              label="RSVP by"
              value={details.rsvpBy ?? ""}
              onChange={(e) => setDetails({ ...details, rsvpBy: e.target.value })}
              placeholder="the end of May"
            />
          </div>

          <Textarea
            label="Good to know"
            value={details.note ?? ""}
            onChange={(e) => setDetails({ ...details, note: e.target.value })}
            placeholder="Parking, children, gifts - anything guests ask you twice."
            rows={3}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Saving…" : "Save"}
            </Button>
            {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</span>}
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The address and map link live on <strong>Business profile</strong>, and the photographs on{" "}
            <strong>Memories</strong> - they are shared with the rest of the site rather than kept twice.
          </p>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold">The day</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              The running order, in the order you want it read - not sorted by the clock, so &ldquo;after dinner&rdquo;
              sits exactly where you put it.
            </p>
          </div>

          <form onSubmit={submitEntry} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
            <TextField
              label="Time"
              value={draft.time ?? ""}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              placeholder="7:00 PM"
            />
            <TextField
              label="What happens"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ceremony"
              required
            />
            <Button type="submit" disabled={isBusy || !draft.title.trim()}>
              {editingId ? "Save" : "Add"}
            </Button>
            <div className="sm:col-span-3">
              <TextField
                label="Detail (optional)"
                value={draft.detail ?? ""}
                onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
                placeholder="In the walled garden. Please be seated by ten to."
              />
            </div>
          </form>

          {editingId && (
            <button
              type="button"
              className="self-start text-sm underline"
              onClick={() => {
                setEditingId(null);
                setDraft(EMPTY_ENTRY);
              }}
            >
              Cancel edit
            </button>
          )}

          {schedule.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nothing yet. A page with no running order is still a perfectly good invitation.
            </p>
          ) : (
            <StaggerGroup className="flex flex-col gap-2">
              {schedule.map((entry, index) => (
                <StaggerItem key={entry.id}>
                  <div className="flex items-start gap-3 rounded-lg border border-black/[.08] p-3 dark:border-white/[.12]">
                    <div className="w-24 shrink-0 text-sm font-medium tabular-nums">{entry.time ?? "—"}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{entry.title}</p>
                      {entry.detail && (
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{entry.detail}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="Move earlier"
                        className="rounded px-2 py-1 text-sm disabled:opacity-30"
                        disabled={index === 0}
                        onClick={() => reorder(index, index - 1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Move later"
                        className="rounded px-2 py-1 text-sm disabled:opacity-30"
                        disabled={index === schedule.length - 1}
                        onClick={() => reorder(index, index + 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm underline"
                        onClick={() => {
                          setEditingId(entry.id);
                          setDraft({ time: entry.time ?? "", title: entry.title, detail: entry.detail ?? "" });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm text-red-600 underline dark:text-red-400"
                        onClick={() => removeEntry(entry.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </Card>
    </div>
  );
}
