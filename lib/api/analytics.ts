import { apiFetch, apiFetchBlob } from "@/lib/api/client";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";

/** `/api/websites/{id}/analytics/**` (BR-AN-001..003). */
export const analyticsApi = {
  summary(accessToken: string, websiteId: string, from?: string, to?: string): Promise<AnalyticsSummaryResponse> {
    return apiFetch<AnalyticsSummaryResponse>(`/websites/${websiteId}/analytics/summary`, {
      query: { from, to },
      accessToken,
    });
  },

  exportCsv(accessToken: string, websiteId: string, from?: string, to?: string): Promise<Blob> {
    return apiFetchBlob(`/websites/${websiteId}/analytics/export`, {
      query: { from, to },
      accessToken,
    });
  },
};
