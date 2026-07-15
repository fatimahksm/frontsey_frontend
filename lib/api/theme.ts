import { apiFetch } from "@/lib/api/client";
import type { ThemeResponse } from "@/lib/api/types";

/** `/api/public/themes` - read-only theme catalog (BRD 9.2/9.3), public/permitAll. */
export const themeApi = {
  list(): Promise<ThemeResponse[]> {
    return apiFetch<ThemeResponse[]>("/public/themes");
  },

  get(id: string): Promise<ThemeResponse> {
    return apiFetch<ThemeResponse>(`/public/themes/${id}`);
  },
};
