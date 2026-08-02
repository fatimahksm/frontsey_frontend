import { apiUrl } from "@/lib/config";
import type { ApiResponse, AuthResponse } from "@/lib/api/types";
import { setStoredSession } from "@/lib/auth/token";

/**
 * Thrown whenever the backend responds with `{ success: false }` or a
 * non-2xx status. Callers can rely on `.message` being safe, user-facing
 * text - the backend's GlobalExceptionHandler guarantees it never leaks
 * internal diagnostics.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Query string parameters, appended to the URL. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Bearer token for authenticated endpoints. */
  accessToken?: string | null;
}

/**
 * BR-AUTH-007: a single in-flight refresh at a time - concurrent 401s from
 * several simultaneous requests all await the same refresh instead of each
 * triggering their own (which would race token rotation and fail all but one).
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(apiUrl("/auth/refresh"), { method: "POST", credentials: "include" });
        const envelope = (await parseEnvelope(response)) as ApiResponse<AuthResponse>;
        if (!response.ok || !envelope.success || !envelope.data) return null;
        setStoredSession(envelope.data);
        return envelope.data.accessToken;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * The single fetch wrapper every API call in the app goes through. It
 * applies the shared backend base URL, attaches the bearer token, unwraps
 * the `{ success, data, message }` envelope, and normalizes failures into
 * `ApiError`. `credentials: "include"` sends the httpOnly refresh-token
 * cookie along on every call (harmless outside /auth/**, where it's the
 * only thing that reads it) - a 401 on an authenticated call transparently
 * tries one silent refresh-and-retry before giving up.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = new URL(apiUrl(path));

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const isFormData = options.body instanceof FormData;
  const body =
    options.body === undefined ? undefined : isFormData ? (options.body as FormData) : JSON.stringify(options.body);

  async function attempt(accessToken: string | null | undefined): Promise<Response> {
    const headers: Record<string, string> = {};
    if (options.body !== undefined && !isFormData) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return fetch(url.toString(), { method: options.method ?? "GET", headers, body, credentials: "include" });
  }

  let response = await attempt(options.accessToken);

  if (response.status === 401 && options.accessToken && !path.startsWith("/auth/")) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      response = await attempt(newAccessToken);
    }
  }

  const envelope = (await parseEnvelope(response)) as ApiResponse<T>;

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.message ?? "An unexpected error occurred. Please try again.",
      response.status,
    );
  }

  return envelope.data as T;
}

async function parseEnvelope(response: Response): Promise<ApiResponse<unknown>> {
  try {
    return await response.json();
  } catch {
    return { success: false, data: null, message: response.statusText };
  }
}

/**
 * For the handful of endpoints that return a raw file body (e.g. the
 * analytics CSV export) instead of the `{ success, data, message }`
 * envelope - unwrapping JSON would just fail on these.
 */
export async function apiFetchBlob(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Blob> {
  const url = new URL(apiUrl(path));
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  if (options.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(url.toString(), { method: options.method ?? "GET", headers, credentials: "include" });
  if (!response.ok) {
    throw new ApiError("Failed to download file.", response.status);
  }
  return response.blob();
}
