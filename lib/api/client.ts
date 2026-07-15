import { apiUrl } from "@/lib/config";
import type { ApiResponse } from "@/lib/api/types";

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
 * The single fetch wrapper every API call in the app goes through. It
 * applies the shared backend base URL, attaches the bearer token, unwraps
 * the `{ success, data, message }` envelope, and normalizes failures into
 * `ApiError`.
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

  const headers: Record<string, string> = {};
  if (options.body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (options.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

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

  const response = await fetch(url.toString(), { method: options.method ?? "GET", headers });
  if (!response.ok) {
    throw new ApiError("Failed to download file.", response.status);
  }
  return response.blob();
}
