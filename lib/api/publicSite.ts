import { apiFetch } from "@/lib/api/client";
import type { PublicWebsiteEnvelope } from "@/lib/api/types";

/** `/api/public/websites/**` - no authentication (SecurityConfig permitAll). */
export const publicSiteApi = {
  getBySlug(slug: string): Promise<PublicWebsiteEnvelope> {
    return apiFetch<PublicWebsiteEnvelope>(`/public/websites/${slug}`);
  },

  recordItemView(slug: string, itemId: string): Promise<void> {
    return apiFetch<void>(`/public/websites/${slug}/items/${itemId}/view`, { method: "POST" });
  },
};
