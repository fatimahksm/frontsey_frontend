import { apiFetch } from "@/lib/api/client";

/** `/api/uploads/**` - stores an image on the backend and returns its public URL. */
export const uploadsApi = {
  uploadImage(accessToken: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/uploads/images", { method: "POST", body: formData, accessToken });
  },
};
