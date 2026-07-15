"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

export default function NotificationsPage() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!session) return;
    setNotifications(await notificationsApi.list(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load notifications."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function markAsRead(id: string) {
    if (!session) return;
    await notificationsApi.markAsRead(session.accessToken, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllAsRead() {
    if (!session) return;
    await notificationsApi.markAllAsRead(session.accessToken);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" className="w-auto px-4" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-zinc-500">No notifications yet.</p>
      ) : (
        <StaggerGroup as="ul" className="flex flex-col gap-2">
          {notifications.map((n) => (
            <StaggerItem
              as="li"
              key={n.id}
              className={`rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145] ${n.read ? "" : "bg-black/[.02] dark:bg-white/[.04]"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={n.read ? "" : "font-medium"}>{n.message}</p>
                {!n.read && (
                  <button type="button" className="shrink-0 text-xs text-zinc-500 hover:underline" onClick={() => markAsRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(n.createdAt)}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
