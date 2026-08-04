import { apiFetch } from "@/lib/api/client";
import type { SubmitSupportTicketRequest, SupportTicketResponse } from "@/lib/api/types";

/** `/api/support/tickets` (BRD 9.15): contact-form support for the authenticated account. */
export const supportApi = {
  submit(accessToken: string, request: SubmitSupportTicketRequest): Promise<SupportTicketResponse> {
    return apiFetch<SupportTicketResponse>("/support/tickets", { method: "POST", body: request, accessToken });
  },

  listMine(accessToken: string): Promise<SupportTicketResponse[]> {
    return apiFetch<SupportTicketResponse[]>("/support/tickets", { accessToken });
  },
};
