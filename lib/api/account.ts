import { apiFetch } from "@/lib/api/client";
import type { AccountDataExportResponse } from "@/lib/api/types";

/** `/api/account/**` (BR-AUTH-006/BR-DATA-005): the authenticated account's own deletion lifecycle and data export. */
export const accountApi = {
  exportData(accessToken: string): Promise<AccountDataExportResponse> {
    return apiFetch<AccountDataExportResponse>("/account/data-export", { accessToken });
  },

  requestDeletion(accessToken: string): Promise<void> {
    return apiFetch<void>("/account/deletion/request", { method: "POST", accessToken });
  },

  cancelDeletion(accessToken: string): Promise<void> {
    return apiFetch<void>("/account/deletion/cancel", { method: "POST", accessToken });
  },
};
