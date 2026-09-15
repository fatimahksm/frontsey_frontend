import { apiFetch } from "@/lib/api/client";
import type { PublicWebsiteEnvelope } from "@/lib/api/types";

/** `/api/public/websites/**` - no authentication (SecurityConfig permitAll). */
export const publicSiteApi = {
  getBySlug(slug: string): Promise<PublicWebsiteEnvelope> {
    return apiFetch<PublicWebsiteEnvelope>(`/public/websites/${slug}`);
  },

  /**
   * Counts one visit.
   *
   * Separate from loading the page on purpose. Counting used to be a side
   * effect of the GET, which made the whole payload uncacheable - a response
   * that changes something cannot be served from a browser or a CDN without
   * losing the change. The page is cacheable now and this is what keeps the
   * number honest, so it is sent on every load, cached page or not.
   */
  recordPageView(slug: string): Promise<void> {
    return apiFetch<void>(`/public/websites/${slug}/view`, { method: "POST" });
  },

  recordItemView(slug: string, itemId: string): Promise<void> {
    return apiFetch<void>(`/public/websites/${slug}/items/${itemId}/view`, { method: "POST" });
  },
};
