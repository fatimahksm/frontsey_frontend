import { apiFetch } from "@/lib/api/client";
import type { SeoMetadataRequest, SeoMetadataResponse } from "@/lib/api/types";

/** `/api/websites/{id}/seo` (BRD 9.12). */
export const seoApi = {
  get(accessToken: string, websiteId: string): Promise<SeoMetadataResponse> {
    return apiFetch<SeoMetadataResponse>(`/websites/${websiteId}/seo`, { accessToken });
  },

  update(accessToken: string, websiteId: string, request: SeoMetadataRequest): Promise<SeoMetadataResponse> {
    return apiFetch<SeoMetadataResponse>(`/websites/${websiteId}/seo`, { method: "PUT", body: request, accessToken });
  },
};
