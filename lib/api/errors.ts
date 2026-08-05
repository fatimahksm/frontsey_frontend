/**
 * One error type for everything that can go wrong talking to the backend, and
 * one place that decides what a human should be told about it.
 *
 * Call sites used to each carry their own fallback string ("Failed to save
 * business profile."), which meant a dropped connection, an expired session
 * and a server crash all produced the same sentence - and the one thing the
 * user could actually act on (their wifi is off) was never said out loud.
 */

/**
 * What kind of failure this was, in terms a UI can branch on. Deliberately
 * coarser than HTTP status codes: the distinctions that matter to a person are
 * "you can't do this", "that's gone", "your session ended", "we're broken" and
 * "the network is", not 409 vs 422.
 */
export type ApiErrorKind =
  /** The request never reached the server - offline, DNS, CORS, connection reset. */
  | "network"
  /** The request was abandoned before the server answered. */
  | "timeout"
  /** 401 after a refresh attempt already failed: the session is genuinely over. */
  | "unauthorized"
  /** 403: authenticated, but not allowed to do this. */
  | "forbidden"
  /** 404 */
  | "not_found"
  /** 409: a rule about the current state was violated. */
  | "conflict"
  /** 400/422: the submitted values were rejected. */
  | "validation"
  /** 429 */
  | "rate_limited"
  /** 5xx */
  | "server"
  /** Anything unclassified - a status we don't model, or a non-Error throw. */
  | "unknown";

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

/**
 * Thrown for every backend failure - a non-2xx status, an `{ success: false }`
 * envelope, or the request never completing at all.
 *
 * `message` is safe to show: for a response that carried one it is the
 * backend's own text (its GlobalExceptionHandler guarantees that never leaks
 * internals), and otherwise it is written here.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  /** True when retrying the same request unchanged could plausibly succeed. */
  readonly isRetryable: boolean;

  constructor(message: string, status: number, kind?: ApiErrorKind) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind ?? kindForStatus(status);
    this.isRetryable = this.kind === "network" || this.kind === "timeout" || this.kind === "server" || this.kind === "rate_limited";
  }

  /** `status` is 0 for failures where no response ever arrived. */
  static network(message = "Can't reach the server. Check your connection and try again."): ApiError {
    return new ApiError(message, 0, "network");
  }

  static timeout(message = "That took too long to respond. Please try again."): ApiError {
    return new ApiError(message, 0, "timeout");
  }
}

/**
 * Default wording per kind, used when a failure carried no server message of
 * its own. Phrased as what happened plus what to do about it - "try again" is
 * only offered where trying again might actually help.
 */
const FALLBACK_BY_KIND: Record<ApiErrorKind, string> = {
  network: "Can't reach the server. Check your connection and try again.",
  timeout: "That took too long to respond. Please try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find that. It may have been deleted.",
  conflict: "That conflicts with the current state. Refresh and try again.",
  validation: "Some details weren't accepted. Please check them and try again.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  server: "Something went wrong on our side. Please try again in a moment.",
  unknown: "Something went wrong. Please try again.",
};

/**
 * Turns anything thrown into text worth showing a user.
 *
 * `fallback` covers the caller's own context ("Failed to save the menu item.")
 * and is used only where this can't say something more specific - a server
 * message, or a known failure kind. A dropped connection should read as a
 * dropped connection on every screen, not as whichever action happened to be
 * in flight.
 */
export function friendlyMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError) {
    // The backend's own message is the most specific thing available, but for
    // network/timeout there is no response and the constructor already wrote
    // the right sentence.
    return error.message || FALLBACK_BY_KIND[error.kind];
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return FALLBACK_BY_KIND.timeout;
  }
  // A bare TypeError from fetch is the browser's way of saying the request
  // never left - apiFetch normalises those, so reaching here means it came
  // from somewhere else that called fetch directly.
  if (error instanceof TypeError) {
    return FALLBACK_BY_KIND.network;
  }
  return fallback ?? FALLBACK_BY_KIND.unknown;
}

/** True when the failure means the session is over and the user must sign in again. */
export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "unauthorized";
}
