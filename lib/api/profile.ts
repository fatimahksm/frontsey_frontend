import { apiFetch } from "@/lib/api/client";
import type { BusinessProfileRequest, BusinessProfileResponse, OpeningHoursEntry } from "@/lib/api/types";

/** `/api/websites/{id}/profile` and `/opening-hours` (BRD 9.4/9.5). */
export const profileApi = {
  get(accessToken: string, websiteId: string): Promise<BusinessProfileResponse> {
    return apiFetch<BusinessProfileResponse>(`/websites/${websiteId}/profile`, { accessToken });
  },

  update(accessToken: string, websiteId: string, request: BusinessProfileRequest): Promise<BusinessProfileResponse> {
    return apiFetch<BusinessProfileResponse>(`/websites/${websiteId}/profile`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  getOpeningHours(accessToken: string, websiteId: string): Promise<OpeningHoursEntry[]> {
    return apiFetch<OpeningHoursEntry[]>(`/websites/${websiteId}/opening-hours`, { accessToken });
  },

  updateOpeningHours(
    accessToken: string,
    websiteId: string,
    entries: OpeningHoursEntry[],
  ): Promise<OpeningHoursEntry[]> {
    return apiFetch<OpeningHoursEntry[]>(`/websites/${websiteId}/opening-hours`, {
      method: "PUT",
      body: entries,
      accessToken,
    });
  },
};
