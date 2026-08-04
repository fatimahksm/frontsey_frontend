import { apiFetch } from "@/lib/api/client";
import type {
  CreateWebsiteRequest,
  LayoutVariant,
  PublicWebsiteResponse,
  UpdateDraftContentRequest,
  WebsiteResponse,
} from "@/lib/api/types";

/** `/api/websites/**` (BRD 9.2/9.3/9.9) - create, list, draft/publish lifecycle. */
export const websitesApi = {
  create(accessToken: string, request: CreateWebsiteRequest): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>("/websites", { method: "POST", body: request, accessToken });
  },

  listMine(accessToken: string): Promise<WebsiteResponse[]> {
    return apiFetch<WebsiteResponse[]>("/websites", { accessToken });
  },

  /** Phase 4 (BR-MGR): every website the caller owns or has accepted manager access to. */
  listAccessible(accessToken: string): Promise<WebsiteResponse[]> {
    return apiFetch<WebsiteResponse[]>("/websites/accessible", { accessToken });
  },

  get(accessToken: string, websiteId: string): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}`, { accessToken });
  },

  /** Renders the current draft (unpublished changes included) exactly as customers would see it. */
  preview(accessToken: string, websiteId: string): Promise<PublicWebsiteResponse> {
    return apiFetch<PublicWebsiteResponse>(`/websites/${websiteId}/preview`, { accessToken });
  },

  saveDraft(accessToken: string, websiteId: string, request: UpdateDraftContentRequest): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}/draft`, { method: "PUT", body: request, accessToken });
  },

  publish(accessToken: string, websiteId: string): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}/publish`, { method: "POST", accessToken });
  },

  restorePreviousVersion(accessToken: string, websiteId: string): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}/restore-previous-version`, {
      method: "POST",
      accessToken,
    });
  },

  updateTheme(accessToken: string, websiteId: string, themeId: string | null): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}/theme`, {
      method: "PUT",
      body: { themeId },
      accessToken,
    });
  },

  updateLayoutVariant(accessToken: string, websiteId: string, layoutVariant: LayoutVariant): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/websites/${websiteId}/layout`, {
      method: "PUT",
      body: { layoutVariant },
      accessToken,
    });
  },
};
