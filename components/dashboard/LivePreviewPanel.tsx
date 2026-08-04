"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useWebsite } from "@/lib/website/website-context";

/**
 * Fallback poll, for saves that don't announce themselves through
 * `notifyDraftChanged`. Deliberately slow: the preview already refreshes the
 * instant a save reports in, so this only exists so nothing can sit stale
 * indefinitely - it is not how the panel is meant to stay current.
 */
const FALLBACK_REFRESH_MS = 20_000;

/**
 * A persistent split-screen preview of the current draft, shown alongside
 * the builder forms (see WebsiteShell) instead of requiring a separate tab.
 * Reuses the existing /preview/[websiteId] route inside an iframe so there's
 * a single source of truth for "what does the draft look like."
 *
 * The refresh is deliberately not a remount. Keying the iframe on a counter
 * tears the element down and builds a new one, which blanks the panel and
 * throws away the visitor's scroll position - every five seconds, whether or
 * not anything had changed. Reloading the existing frame's document keeps the
 * element (and its scroll position) and only repaints its contents.
 */
export function LivePreviewPanel({ websiteId }: { websiteId: string }) {
  const { draftVersion } = useWebsite();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    setIsRefreshing(true);
    // Same-origin, so the frame's own history entry can be replaced without
    // adding to the parent's. Falling back to re-assigning src covers the case
    // where the document isn't reachable yet (first paint, or a failed load).
    try {
      frame.contentWindow?.location.replace(`/preview/${websiteId}?embedded=1`);
    } catch {
      frame.src = `/preview/${websiteId}?embedded=1`;
    }
  }, [websiteId]);

  // Skips the initial render: the iframe's own src already loads that.
  const seenVersion = useRef(draftVersion);
  useEffect(() => {
    if (seenVersion.current === draftVersion) return;
    seenVersion.current = draftVersion;
    refresh();
  }, [draftVersion, refresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Reloading a panel nobody is looking at just burns requests; the
      // visibility handler below catches up when the tab comes back.
      if (document.hidden) return;
      refresh();
    }, FALLBACK_REFRESH_MS);

    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return (
    <aside className="hidden w-[380px] shrink-0 xl:block">
      <div className="sticky top-6 flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-black/[.08] bg-surface shadow-soft dark:border-white/[.145]">
        <div className="flex items-center justify-between gap-2 border-b border-black/[.06] px-3 py-2 dark:border-white/[.1]">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Live preview</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refresh}
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
          ref={frameRef}
          src={`/preview/${websiteId}?embedded=1`}
          title="Live preview"
          onLoad={() => setIsRefreshing(false)}
          className={`min-h-0 flex-1 border-0 bg-white transition-opacity duration-200 ${isRefreshing ? "opacity-70" : "opacity-100"}`}
        />
      </div>
    </aside>
  );
}
