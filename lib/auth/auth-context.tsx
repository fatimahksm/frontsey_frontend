"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/auth/api";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/lib/auth/token";
import type { AuthResponse, LoginRequest } from "@/lib/api/types";

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

  useEffect(() => {
    // localStorage doesn't exist during server rendering, so the session can
    // only be known once we're running in the browser - this is a one-time
    // sync with that external system, not state that could be derived during
    // render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getStoredSession());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request);
    setStoredSession(response);
    setSession(response);
    return response;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

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
