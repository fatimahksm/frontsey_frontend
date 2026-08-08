import { apiFetch } from "@/lib/api/client";
import type { PortfolioProjectRequest, PortfolioProjectResponse } from "@/lib/api/types";

/**
 * `/api/websites/{id}/projects` - the structured store behind every Portfolio
 * template's work section.
 *
 * Before this existed, a project's title, year and links had nowhere to live
 * except free-form JSON inside a custom section, so real owners ended up with
 * untitled gallery images while the samples looked complete. The templates
 * still read the gallery when a site has no projects, so nothing saved earlier
 * changes shape.
 */
export const projectsApi = {
  list(accessToken: string, websiteId: string): Promise<PortfolioProjectResponse[]> {
    return apiFetch<PortfolioProjectResponse[]>(`/websites/${websiteId}/projects`, { accessToken });
  },

  create(accessToken: string, websiteId: string, request: PortfolioProjectRequest): Promise<PortfolioProjectResponse> {
    return apiFetch<PortfolioProjectResponse>(`/websites/${websiteId}/projects`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  update(
    accessToken: string,
    websiteId: string,
    projectId: string,
    request: PortfolioProjectRequest,
  ): Promise<PortfolioProjectResponse> {
    return apiFetch<PortfolioProjectResponse>(`/websites/${websiteId}/projects/${projectId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, projectId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/projects/${projectId}`, { method: "DELETE", accessToken });
  },

  reorder(accessToken: string, websiteId: string, projectIds: string[]): Promise<PortfolioProjectResponse[]> {
    return apiFetch<PortfolioProjectResponse[]>(`/websites/${websiteId}/projects/reorder`, {
      method: "PUT",
      body: projectIds,
      accessToken,
    });
  },
};
