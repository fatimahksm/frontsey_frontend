import { apiFetch } from "@/lib/api/client";
import type { PlanResponse } from "@/lib/api/types";

/** `/api/public/plans` - read-only pricing listing (7.2), public/permitAll. */
export const plansApi = {
  list(): Promise<PlanResponse[]> {
    return apiFetch<PlanResponse[]>("/public/plans");
  },

  /** How long the free trial runs. Config on the server, so never a literal here. */
  trialDays(): Promise<number> {
    return apiFetch<number>("/public/plans/trial-days");
  },
};
