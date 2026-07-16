"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Auto-refresh interval - short enough to feel "live" without hammering the backend on every keystroke. */
const AUTO_REFRESH_MS = 5000;

/**
 * A persistent split-screen preview of the current draft, shown alongside
 * the builder forms (see WebsiteShell) instead of requiring a separate tab.
 * Reuses the existing /preview/[websiteId] route inside an iframe so there's
 * a single source of truth for "what does the draft look like."
 */
export function LivePreviewPanel({ websiteId }: { websiteId: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setReloadKey((k) => k + 1), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <aside className="hidden w-[380px] shrink-0 xl:block">
      <div className="sticky top-6 flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-black/[.08] bg-surface shadow-soft dark:border-white/[.145]">
        <div className="flex items-center justify-between gap-2 border-b border-black/[.06] px-3 py-2 dark:border-white/[.1]">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Live preview</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="text-xs font-medium text-[var(--accent-solid)] hover:underline"
              title="Refresh now"
            >
              ↻ Refresh
            </button>
            <Link
              href={`/preview/${websiteId}`}
              target="_blank"
              className="text-xs font-medium text-[var(--accent-solid)] hover:underline"
            >
              Open ↗
            </Link>
          </div>
        </div>
        <iframe
          key={reloadKey}
          src={`/preview/${websiteId}?embedded=1`}
          title="Live preview"
          className="min-h-0 flex-1 border-0 bg-white"
        />
      </div>
    </aside>
  );
}
