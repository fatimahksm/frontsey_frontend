import { apiFetch } from "@/lib/api/client";
import type { CheckoutRequest, MockPaymentResponse, MockPaymentStatus, SubscriptionResponse } from "@/lib/api/types";

/** `/api/websites/{id}/subscription` + mock Whish payment gateway (BRD 9.16). */
export const subscriptionApi = {
  get(accessToken: string, websiteId: string): Promise<SubscriptionResponse> {
    return apiFetch<SubscriptionResponse>(`/websites/${websiteId}/subscription`, { accessToken });
  },

  checkout(accessToken: string, websiteId: string, request: CheckoutRequest): Promise<MockPaymentResponse> {
    return apiFetch<MockPaymentResponse>(`/websites/${websiteId}/subscription/checkout`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  simulateOutcome(accessToken: string, paymentId: string, outcome: MockPaymentStatus): Promise<MockPaymentResponse> {
    return apiFetch<MockPaymentResponse>(`/payments/mock/${paymentId}/simulate`, {
      method: "POST",
      query: { outcome },
      accessToken,
    });
  },
};
