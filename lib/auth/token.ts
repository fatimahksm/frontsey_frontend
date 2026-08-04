import type { AuthResponse } from "@/lib/api/types";

/**
 * Client-side storage for the authenticated session. The backend is a
 * stateless bearer-token API (no session cookie), so the token - and the
 * small amount of account info the login response carries - has to live
 * somewhere in the browser. Access is guarded behind `typeof window` checks
 * so this module is safe to import from server components too.
 */

const STORAGE_KEY = "dbwb.session";

export function getStoredSession(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
