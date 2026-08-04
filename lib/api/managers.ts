import { apiFetch } from "@/lib/api/client";
import type { InviteManagerRequest, ManagerAccessResponse, Permission } from "@/lib/api/types";

/** `/api/websites/{id}/managers` (BRD 9.13/9.14). */
export const managersApi = {
  invite(accessToken: string, websiteId: string, request: InviteManagerRequest): Promise<ManagerAccessResponse> {
    return apiFetch<ManagerAccessResponse>(`/websites/${websiteId}/managers`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  list(accessToken: string, websiteId: string): Promise<ManagerAccessResponse[]> {
    return apiFetch<ManagerAccessResponse[]>(`/websites/${websiteId}/managers`, { accessToken });
  },

  updatePermissions(
    accessToken: string,
    websiteId: string,
    accessId: string,
    permissions: Permission[],
  ): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/managers/${accessId}/permissions`, {
      method: "PUT",
      body: permissions,
      accessToken,
    });
  },

  revoke(accessToken: string, websiteId: string, accessId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/managers/${accessId}`, { method: "DELETE", accessToken });
  },
};
