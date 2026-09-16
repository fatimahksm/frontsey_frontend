import { apiFetch } from "@/lib/api/client";
import type {
  AccountDataExportResponse,
  AccountProfileResponse,
  ChangePasswordRequest,
  UpdateAccountProfileRequest,
} from "@/lib/api/types";

/** `/api/account/**` (BR-AUTH-006/BR-DATA-005): the authenticated account's own deletion lifecycle and data export. */
export const accountApi = {
  /**
   * Who you are signed in as.
   *
   * Read from the API rather than from the session token: the token is minted
   * at sign-in and does not change when you rename yourself on this very
   * screen.
   */
  me(accessToken: string): Promise<AccountProfileResponse> {
    return apiFetch<AccountProfileResponse>("/account/me", { accessToken });
  },

  updateProfile(accessToken: string, request: UpdateAccountProfileRequest): Promise<AccountProfileResponse> {
    return apiFetch<AccountProfileResponse>("/account/me", { method: "PUT", body: request, accessToken });
  },

  changePassword(accessToken: string, request: ChangePasswordRequest): Promise<void> {
    return apiFetch<void>("/account/password", { method: "POST", body: request, accessToken });
  },

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
