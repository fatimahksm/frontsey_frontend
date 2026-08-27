import { apiFetch } from "@/lib/api/client";
import type {
  EventDetailsRequest,
  EventDetailsResponse,
  ScheduleEntryRequest,
  ScheduleEntryResponse,
} from "@/lib/api/types";

/**
 * `/api/websites/{id}/event` - the occasion behind an EVENTS website.
 *
 * Where and how to reach the hosts live on the business profile, and the
 * photographs are the gallery; this is only what neither has anywhere to put -
 * the date, the venue, and the running order of the day.
 */
export const eventsApi = {
  /** Comes back with every field null when nothing has been filled in yet, so the form always has a shape to bind to. */
  details(accessToken: string, websiteId: string): Promise<EventDetailsResponse> {
    return apiFetch<EventDetailsResponse>(`/websites/${websiteId}/event`, { accessToken });
  },

  saveDetails(accessToken: string, websiteId: string, request: EventDetailsRequest): Promise<EventDetailsResponse> {
    return apiFetch<EventDetailsResponse>(`/websites/${websiteId}/event`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  schedule(accessToken: string, websiteId: string): Promise<ScheduleEntryResponse[]> {
    return apiFetch<ScheduleEntryResponse[]>(`/websites/${websiteId}/event/schedule`, { accessToken });
  },

  addEntry(accessToken: string, websiteId: string, request: ScheduleEntryRequest): Promise<ScheduleEntryResponse> {
    return apiFetch<ScheduleEntryResponse>(`/websites/${websiteId}/event/schedule`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  updateEntry(
    accessToken: string,
    websiteId: string,
    entryId: string,
    request: ScheduleEntryRequest,
  ): Promise<ScheduleEntryResponse> {
    return apiFetch<ScheduleEntryResponse>(`/websites/${websiteId}/event/schedule/${entryId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  deleteEntry(accessToken: string, websiteId: string, entryId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/event/schedule/${entryId}`, { method: "DELETE", accessToken });
  },

  reorder(accessToken: string, websiteId: string, entryIds: string[]): Promise<ScheduleEntryResponse[]> {
    return apiFetch<ScheduleEntryResponse[]>(`/websites/${websiteId}/event/schedule/reorder`, {
      method: "PUT",
      body: entryIds,
      accessToken,
    });
  },
};
