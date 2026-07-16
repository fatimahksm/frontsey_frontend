import { apiFetch } from "@/lib/api/client";
import type { PageSectionRequest, PageSectionResponse } from "@/lib/api/types";

/** `/api/websites/{id}/sections` - owner-added extra sections, available on both template types. */
export const sectionsApi = {
  list(accessToken: string, websiteId: string): Promise<PageSectionResponse[]> {
    return apiFetch<PageSectionResponse[]>(`/websites/${websiteId}/sections`, { accessToken });
  },

  create(accessToken: string, websiteId: string, request: PageSectionRequest): Promise<PageSectionResponse> {
    return apiFetch<PageSectionResponse>(`/websites/${websiteId}/sections`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  update(
    accessToken: string,
    websiteId: string,
    sectionId: string,
    request: PageSectionRequest,
  ): Promise<PageSectionResponse> {
    return apiFetch<PageSectionResponse>(`/websites/${websiteId}/sections/${sectionId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, sectionId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/sections/${sectionId}`, { method: "DELETE", accessToken });
  },

  reorder(accessToken: string, websiteId: string, sectionIds: string[]): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/sections/reorder`, {
      method: "PUT",
      body: sectionIds,
      accessToken,
    });
  },
};
