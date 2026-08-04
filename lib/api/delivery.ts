import { apiFetch } from "@/lib/api/client";
import type { DeliveryAreaResponse } from "@/lib/api/types";

/** `/api/websites/{id}/delivery-areas` (BRD 9.10). */
export const deliveryApi = {
  list(accessToken: string, websiteId: string): Promise<DeliveryAreaResponse[]> {
    return apiFetch<DeliveryAreaResponse[]>(`/websites/${websiteId}/delivery-areas`, { accessToken });
  },

  create(
    accessToken: string,
    websiteId: string,
    input: { name: string; fee: string; minimumOrder: string; freeThreshold?: string },
  ): Promise<DeliveryAreaResponse> {
    return apiFetch<DeliveryAreaResponse>(`/websites/${websiteId}/delivery-areas`, {
      method: "POST",
      query: {
        name: input.name,
        fee: input.fee,
        minimumOrder: input.minimumOrder,
        freeThreshold: input.freeThreshold,
      },
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, areaId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/delivery-areas/${areaId}`, { method: "DELETE", accessToken });
  },
};
