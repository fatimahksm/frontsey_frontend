/**
 * Single source of truth for environment-dependent frontend configuration.
 * Every URL, endpoint prefix, or environment-dependent constant is read from
 * here - never constructed inline in a component or page.
 *
 * `NEXT_PUBLIC_*` variables are inlined into the browser bundle at build
 * time, so they must never carry secrets - only public, non-sensitive values
 * such as the backend base URL belong here.
 */

const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const config = {
  /** Base URL of the Spring Boot backend (no trailing slash). */
  apiBaseUrl: (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
  ).replace(/\/+$/, ""),

  /** Prefix under which every backend REST endpoint is mounted. */
  apiPrefix: "/api",
} as const;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseUrl}${config.apiPrefix}${normalizedPath}`;
}
