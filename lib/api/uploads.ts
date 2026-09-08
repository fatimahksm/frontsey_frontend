import { apiFetch } from "@/lib/api/client";
import type { PreparedImage } from "@/lib/images/prepare-upload";

/** `/api/uploads/**` - stores an image on the backend and returns its public URL. */
export const uploadsApi = {
  /**
   * Sends the picture and, when there is one, the small copy that goes with
   * it. The server stores the copy under a key derived from the picture's, so
   * only one URL comes back and nothing downstream needs a second field.
   */
  uploadImage(accessToken: string, image: PreparedImage | File): Promise<{ url: string }> {
    const prepared = image instanceof File ? { file: image, thumbnail: null } : image;
    const formData = new FormData();
    formData.append("file", prepared.file);
    if (prepared.thumbnail) formData.append("thumbnail", prepared.thumbnail);
    return apiFetch<{ url: string }>("/uploads/images", { method: "POST", body: formData, accessToken });
  },
};
