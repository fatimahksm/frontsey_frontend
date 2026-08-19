"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/auth/api";
import { decodeJwtExpiryMs } from "@/lib/auth/jwt";
import { onSessionExpired } from "@/lib/auth/session-events";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/lib/auth/token";
import type { AuthResponse, LoginRequest } from "@/lib/api/types";

/** BR-AUTH-007: refresh this long before the access token actually expires, so a normal request never races an in-flight expiry. */
const REFRESH_BUFFER_MS = 2 * 60 * 1000;
/** Absolute floor on the scheduled delay: if the access-token TTL is ever configured shorter than REFRESH_BUFFER_MS, the naive "expiry - buffer" math goes negative every time a fresh token is issued, which would otherwise refresh in a tight infinite loop. */
const MIN_REFRESH_DELAY_MS = 10 * 1000;

interface AuthContextValue {
  /** The current session, or null when signed out. */
  session: AuthResponse | null;
  /** True until the session has been read from storage once on mount. Server render and the first client render are always "loading" so there is no server/client mismatch to reconcile. */
  isLoading: boolean;
  login(request: LoginRequest): Promise<AuthResponse>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Indirection so the recurring timer can call "the current scheduleRefresh" without
  // scheduleRefresh needing to close over itself (which the hooks lint rule rejects).
  const scheduleRefreshRef = useRef<(accessToken: string) => void>(() => {});

  /**
   * BR-AUTH-007: proactively renews the access token ~2 minutes before it
   * expires, so a normal session never actually hits a 401 due to expiry.
   * apiFetch's own reactive refresh-and-retry (see lib/api/client.ts) is
   * only the safety net for what this misses (e.g. a suspended/backgrounded
   * tab) - it updates localStorage directly but not this component's state,
   * so this timer is what keeps `session` itself current in the common case.
   */
  const scheduleRefresh = useCallback((accessToken: string) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const expiryMs = decodeJwtExpiryMs(accessToken);
    if (expiryMs == null) return;
    const delay = Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, MIN_REFRESH_DELAY_MS);
    refreshTimer.current = setTimeout(async () => {
      try {
        const refreshed = await authApi.refresh();
        setStoredSession(refreshed);
        setSession(refreshed);
        scheduleRefreshRef.current(refreshed.accessToken);
      } catch {
        // Refresh cookie missing/expired/revoked - reflect being logged out rather than retrying forever.
        clearStoredSession();
        setSession(null);
      }
    }, delay);
  }, []);

  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  /**
   * Ends the session locally. Used both by the explicit logout button and by
   * the fetch wrapper's "this 401 survived a refresh" signal, so an expired
   * session clears itself wherever it is discovered rather than leaving the
   * user apparently signed in with every request failing.
   */
  const endSession = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    clearStoredSession();
    setSession(null);
  }, []);

  useEffect(() => onSessionExpired(endSession), [endSession]);

  useEffect(() => {
    // localStorage doesn't exist during server rendering, so the session can
    // only be known once we're running in the browser - this is a one-time
    // sync with that external system, not state that could be derived during
    // render.
    const stored = getStoredSession();
    const expiryMs = stored ? decodeJwtExpiryMs(stored.accessToken) : null;
    // A tab closed for longer than the token's lifetime reopens with a stored
    // session that is already dead. Restoring it would show a signed-in UI
    // that 401s on its first request; renewing first means the user either
    // stays signed in properly or lands on the login screen, with no broken
    // state in between.
    const isExpired = expiryMs != null && expiryMs <= Date.now();

    if (stored && isExpired) {
      authApi
        .refresh()
        .then((refreshed) => {
          setStoredSession(refreshed);
          setSession(refreshed);
          scheduleRefresh(refreshed.accessToken);
        })
        .catch(() => {
          clearStoredSession();
          setSession(null);
        })
        .finally(() => setIsLoading(false));
      return () => {
        if (refreshTimer.current) clearTimeout(refreshTimer.current);
      };
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(stored);
    setIsLoading(false);
    if (stored) scheduleRefresh(stored.accessToken);

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request);
    setStoredSession(response);
    setSession(response);
    scheduleRefresh(response.accessToken);
    return response;
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    endSession();
    // Best-effort - revokes the refresh token server-side so a copied/stale cookie can't be replayed after logout.
    authApi.logout().catch(() => {});
  }, [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isLoading, login, logout }),
    [session, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
