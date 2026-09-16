"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Whether the person reading has folded the sidebar down to its icons.
 *
 * Remembered across visits, because it is a preference about how someone wants
 * to work rather than a state of the page - an owner on a small laptop who
 * wants the width back should not have to ask for it again every morning.
 *
 * localStorage is an external store, so it is read through useSyncExternalStore
 * rather than copied into state inside an effect: that gives a server snapshot
 * for the render that has to match the server's markup, the real value on the
 * very next one, and - because the store notifies - two open tabs that agree
 * with each other instead of drifting apart.
 */
const KEY = "frontsey.sidebar.collapsed";
const EVENT = "frontsey:sidebar-collapsed";

function subscribe(onChange: () => void): () => void {
  // "storage" covers the other tabs; the custom event covers this one, which
  // the browser deliberately does not notify about its own writes.
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readStored(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    // Private mode, or storage disabled. The sidebar simply starts open.
    return false;
  }
}

/** The server has no preference to read, and an open sidebar is the safe thing to render. */
function serverSnapshot(): boolean {
  return false;
}

export function useSidebarCollapsed(): {
  collapsed: boolean;
  /**
   * True once this person has folded or unfolded it during this visit.
   *
   * The width transition is gated on it so the fold animates when someone asks
   * for it and not on page load, where the first paint is the server's open
   * sidebar and the second is their stored preference - animating that reads as
   * the menu closing itself.
   */
  hasToggled: boolean;
  toggle(): void;
} {
  const collapsed = useSyncExternalStore(subscribe, readStored, serverSnapshot);
  const [hasToggled, setHasToggled] = useState(false);

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, String(!readStored()));
    } catch {
      // Not remembered. Nothing else to do: without storage there is no
      // preference to keep, and pretending otherwise would desync the tabs.
    }
    setHasToggled(true);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { collapsed, hasToggled, toggle };
}
