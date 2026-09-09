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

  /**
   * The templates currently on offer.
   *
   * The picker's own list (TEMPLATE_OPTIONS) is a fixed array of labels and
   * descriptions - it says what each template *is*, not whether it may be
   * chosen. That is the admin's call, it lives in template_prices.active, and
   * this is how the picker learns it. Without it, switching a template off
   * hid it from pricing and checkout but left it on display, so an owner could
   * pick it and only hit the wall after building on it.
   */
  offeredTemplates(): Promise<TemplatePriceResponse[]> {
    return apiFetch<TemplatePriceResponse[]>("/public/plans/templates");
  },

  /** How long the free trial runs. Config on the server, so never a literal here. */
  trialDays(): Promise<number> {
    return apiFetch<number>("/public/plans/trial-days");
  },
};
