import { apiFetch } from "@/lib/api/client";
import type { PlanResponse } from "@/lib/api/types";

/** `/api/public/plans` - read-only pricing listing (7.2), public/permitAll. */
export const plansApi = {
  list(): Promise<PlanResponse[]> {
    return apiFetch<PlanResponse[]>("/public/plans");
  },
};
