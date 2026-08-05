"use client"; // Error boundaries must be Client Components.

import Link from "next/link";

import { unexpectedErrorMessage } from "@/lib/api/errors";

/**
 * The catch-all for anything thrown while rendering that no call site caught.
 *
 * Handled failures already get specific wording through friendlyMessage(), but
 * an unhandled throw - a bug, or a failure type nothing knows about yet - used
 * to take the page down to a blank screen (or, in development, a stack trace).
 * Something the user cannot read is worse than a plain sentence, so anything
 * that gets this far still ends up with a clear message and a way forward.
 *
 * `digest` is the hash Next generates for the error. In production the real
 * message never reaches the browser, deliberately, so this code is the only
 * thing tying what the user saw to the server-side log entry - which makes it
 * worth showing, quietly, rather than hiding.
 */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/12 text-2xl" aria-hidden>
        ⚠️
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{unexpectedErrorMessage(error)}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white shadow-soft"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-black/[.1] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
        >
          Back to dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="font-mono text-xs text-zinc-400">
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
