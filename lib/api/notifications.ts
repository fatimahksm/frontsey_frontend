import { apiFetch } from "@/lib/api/client";
import type { NotificationResponse } from "@/lib/api/types";

/** `/api/notifications` (BRD 9.15): dashboard notification bell. */
export const notificationsApi = {
  list(accessToken: string): Promise<NotificationResponse[]> {
    return apiFetch<NotificationResponse[]>("/notifications", { accessToken });
  },

  markAsRead(accessToken: string, id: string): Promise<void> {
    return apiFetch<void>(`/notifications/${id}/read`, { method: "PUT", accessToken });
  },

  markAllAsRead(accessToken: string): Promise<void> {
    return apiFetch<void>("/notifications/read-all", { method: "PUT", accessToken });
  },
};
