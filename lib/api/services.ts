import { apiFetch } from "@/lib/api/client";
import type { ServiceItemRequest, ServiceItemResponse } from "@/lib/api/types";

/** `/api/websites/{id}/services` - the PORTFOLIO-template counterpart to the menu module. */
export const servicesApi = {
  list(accessToken: string, websiteId: string): Promise<ServiceItemResponse[]> {
    return apiFetch<ServiceItemResponse[]>(`/websites/${websiteId}/services`, { accessToken });
  },

  create(accessToken: string, websiteId: string, request: ServiceItemRequest): Promise<ServiceItemResponse> {
    return apiFetch<ServiceItemResponse>(`/websites/${websiteId}/services`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  update(
    accessToken: string,
    websiteId: string,
    serviceId: string,
    request: ServiceItemRequest,
  ): Promise<ServiceItemResponse> {
    return apiFetch<ServiceItemResponse>(`/websites/${websiteId}/services/${serviceId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, serviceId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/services/${serviceId}`, { method: "DELETE", accessToken });
  },

  reorder(accessToken: string, websiteId: string, serviceIds: string[]): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/services/reorder`, {
      method: "PUT",
      body: serviceIds,
      accessToken,
    });
  },
};
