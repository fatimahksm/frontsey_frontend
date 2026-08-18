import { apiFetch } from "@/lib/api/client";
import type { LayoutVariant, PlanResponse, TemplatePriceResponse } from "@/lib/api/types";

/** `/api/public/plans` - read-only pricing listing (7.2), public/permitAll. */
export const plansApi = {
  list(): Promise<PlanResponse[]> {
    return apiFetch<PlanResponse[]>("/public/plans");
  },

  /**
   * What one template costs, monthly and yearly. Public because the subscription
   * screen quotes it before anybody has committed to anything.
   */
  templatePrice(layoutVariant: LayoutVariant): Promise<TemplatePriceResponse> {
    return apiFetch<TemplatePriceResponse>(`/public/plans/template/${layoutVariant}`);
  },

  /** How long the free trial runs. Config on the server, so never a literal here. */
  trialDays(): Promise<number> {
    return apiFetch<number>("/public/plans/trial-days");
  },
};
