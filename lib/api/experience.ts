import { apiFetch } from "@/lib/api/client";
import type { ExperienceEntryRequest, ExperienceEntryResponse } from "@/lib/api/types";

/**
 * `/api/websites/{id}/experience` - the work history behind the timeline two
 * of the Portfolio templates render.
 *
 * They have always drawn that timeline from `about.experience` inside a
 * section's free-form JSON, which no screen in the console could write. So it
 * appeared on the seeded sample sites and could never appear on a real
 * owner's. The templates still read the old field when a site has no entries,
 * so nothing saved earlier changes shape.
 */
export const experienceApi = {
  list(accessToken: string, websiteId: string): Promise<ExperienceEntryResponse[]> {
    return apiFetch<ExperienceEntryResponse[]>(`/websites/${websiteId}/experience`, { accessToken });
  },

  create(accessToken: string, websiteId: string, request: ExperienceEntryRequest): Promise<ExperienceEntryResponse> {
    return apiFetch<ExperienceEntryResponse>(`/websites/${websiteId}/experience`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  update(
    accessToken: string,
    websiteId: string,
    entryId: string,
    request: ExperienceEntryRequest,
  ): Promise<ExperienceEntryResponse> {
    return apiFetch<ExperienceEntryResponse>(`/websites/${websiteId}/experience/${entryId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, entryId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/experience/${entryId}`, { method: "DELETE", accessToken });
  },

  reorder(accessToken: string, websiteId: string, entryIds: string[]): Promise<ExperienceEntryResponse[]> {
    return apiFetch<ExperienceEntryResponse[]>(`/websites/${websiteId}/experience/reorder`, {
      method: "PUT",
      body: entryIds,
      accessToken,
    });
  },
};
