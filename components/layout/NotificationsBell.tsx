"use client";

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
    notificationsApi.list(accessToken).then((list) => {
      if (!cancelled) setNotifications(list);
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
    await notificationsApi.markAsRead(accessToken, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllAsRead() {
    await notificationsApi.markAllAsRead(accessToken);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.06]"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-black/[.08] bg-white p-2 shadow-lg dark:border-white/[.145] dark:bg-zinc-950">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead} className="text-xs text-zinc-500 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-zinc-500">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markAsRead(n.id)}
                className={`block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] ${
                  n.read ? "text-zinc-500" : "font-medium"
                }`}
              >
                {n.message}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/notifications"
            className="mt-1 block rounded-lg px-2 py-1.5 text-center text-xs text-zinc-500 hover:underline"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
