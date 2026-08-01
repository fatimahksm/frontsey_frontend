import { apiFetch } from "@/lib/api/client";
import type { ManagerInvitationResponse } from "@/lib/api/types";

/** `/api/managers/invitations` (Phase 4, BR-MGR-008) - the invited person's own pending invitations, across every website. */
export const managerInvitationsApi = {
  list(accessToken: string): Promise<ManagerInvitationResponse[]> {
    return apiFetch<ManagerInvitationResponse[]>("/managers/invitations", { accessToken });
  },

  accept(accessToken: string, accessId: string): Promise<ManagerInvitationResponse> {
    return apiFetch<ManagerInvitationResponse>(`/managers/invitations/${accessId}/accept`, {
      method: "POST",
      accessToken,
    });
  },

  reject(accessToken: string, accessId: string): Promise<void> {
    return apiFetch<void>(`/managers/invitations/${accessId}/reject`, {
      method: "POST",
      accessToken,
    });
  },
};
