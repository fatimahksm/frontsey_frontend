import { apiFetch } from "@/lib/api/client";
import type { GalleryImageResponse } from "@/lib/api/types";

/** `/api/websites/{id}/gallery` (BRD 9.11). */
export const galleryApi = {
  list(accessToken: string, websiteId: string): Promise<GalleryImageResponse[]> {
    return apiFetch<GalleryImageResponse[]>(`/websites/${websiteId}/gallery`, { accessToken });
  },

  add(accessToken: string, websiteId: string, imageUrl: string): Promise<GalleryImageResponse> {
    return apiFetch<GalleryImageResponse>(`/websites/${websiteId}/gallery`, {
      method: "POST",
      body: { imageUrl },
      accessToken,
    });
  },

  delete(accessToken: string, websiteId: string, imageId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/gallery/${imageId}`, { method: "DELETE", accessToken });
  },

  setCover(accessToken: string, websiteId: string, imageId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/gallery/${imageId}/cover`, { method: "PUT", accessToken });
  },

  reorder(accessToken: string, websiteId: string, imageIds: string[]): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/gallery/reorder`, {
      method: "PUT",
      body: imageIds,
      accessToken,
    });
  },
};
