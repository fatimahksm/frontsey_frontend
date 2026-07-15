import { apiFetch } from "@/lib/api/client";
import type { ConfirmImportRequest, ImportOutcomeResponse, ImportPreviewResponse } from "@/lib/api/types";

/** `/api/websites/{id}/menu/import/**` (BRD 9.8): CSV preview-then-confirm. */
export const menuImportApi = {
  preview(accessToken: string, websiteId: string, file: File): Promise<ImportPreviewResponse> {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<ImportPreviewResponse>(`/websites/${websiteId}/menu/import/preview`, {
      method: "POST",
      body: form,
      accessToken,
    });
  },

  confirm(
    accessToken: string,
    websiteId: string,
    file: File,
    request: ConfirmImportRequest,
  ): Promise<ImportOutcomeResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("decisions", new Blob([JSON.stringify(request)], { type: "application/json" }));
    return apiFetch<ImportOutcomeResponse>(`/websites/${websiteId}/menu/import/confirm`, {
      method: "POST",
      body: form,
      accessToken,
    });
  },
};
