"use client";

import { BellIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationResponse } from "@/lib/api/types";

export function NotificationsBell({ accessToken }: { accessToken: string }) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    notificationsApi
      .list(accessToken)
      .then((list) => {
        if (!cancelled) setNotifications(list);
      })
      .catch(() => {
        // Non-critical: the bell just stays empty if this fails, no need to disrupt the page.
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: string) {
    try {
      await notificationsApi.markAsRead(accessToken, id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // Non-critical: leave the notification as unread if this fails.
    }
  }

  async function markAllAsRead() {
    try {
      await notificationsApi.markAllAsRead(accessToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Non-critical: leave notifications as-is if this fails.
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-card border border-line bg-surface p-2 shadow-lift">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead} className="text-xs text-muted hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markAsRead(n.id)}
                className={`block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-muted ${
 n.read ? "text-muted" : "font-medium"
                }`}
              >
                {n.message}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/notifications"
            className="mt-1 block rounded-lg px-2 py-1.5 text-center text-xs text-muted hover:underline"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
