import { apiUrl } from "@/lib/config";
import type { ApiResponse, AuthResponse } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { emitSessionExpired } from "@/lib/auth/session-events";
import { setStoredSession } from "@/lib/auth/token";

// Re-exported so the many `import { ApiError } from "@/lib/api/client"` call
// sites keep working now that the type itself lives with its taxonomy.
export { ApiError } from "@/lib/api/errors";
export type { ApiErrorKind } from "@/lib/api/errors";
export { friendlyMessage, isSessionExpired } from "@/lib/api/errors";

/** No request should hang forever; a dead connection must surface as an error the UI can show. */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Runs a fetch with a timeout, converting the two ways a request can fail
 * without ever producing a response into typed errors. Everything downstream
 * can then assume a failure is an ApiError.
 */
async function fetchOrThrow(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw ApiError.timeout();
    }
    throw ApiError.network();
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
        const response = await fetchOrThrow(apiUrl("/auth/refresh"), { method: "POST", credentials: "include" });
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
    return fetchOrThrow(url.toString(), { method: options.method ?? "GET", headers, body, credentials: "include" });
  }

  let response = await attempt(options.accessToken);

  if (response.status === 401 && options.accessToken && !path.startsWith("/auth/")) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      response = await attempt(newAccessToken);
    }
    // Still refused with a token we just minted (or we could not mint one at
    // all): the refresh cookie is gone, expired, or revoked. Nothing the
    // client can do will recover it, so end the session rather than leaving
    // the user apparently signed in with every request failing.
    if (!newAccessToken || response.status === 401) {
      emitSessionExpired();
    }
  }

  const envelope = (await parseEnvelope(response)) as ApiResponse<T>;

  if (!response.ok || !envelope.success) {
    // An empty message is left empty on purpose: friendlyMessage() then picks
    // the wording for the failure kind instead of a generic catch-all.
    throw new ApiError(envelope.message ?? "", response.status);
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

  const response = await fetchOrThrow(url.toString(), { method: options.method ?? "GET", headers, credentials: "include" });
  if (!response.ok) {
    throw new ApiError("Failed to download file.", response.status);
  }
  return response.blob();
}
