"use client"; // Error boundaries must be Client Components.

import "./globals.css";

/**
 * The last resort: an error thrown by the root layout itself, which app/error
 * cannot catch because error.tsx does not wrap the layout above it.
 *
 * When this renders it *replaces* the root layout, so it has to bring its own
 * <html> and <body> - and it cannot lean on anything the layout would normally
 * provide. That is why the markup here is deliberately plain and the styling
 * is mostly inline: if the root layout just failed, the safest assumption is
 * that none of the app's own providers or fonts are available. Importing the
 * stylesheet directly is what keeps the page from rendering completely unstyled.
 *
 * There is also no shared metadata here - metadata exports are not supported in
 * a global error boundary, so the title is set with React's own <title>.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "2rem 1rem",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ fontSize: "2rem" }} aria-hidden>
            ⚠️
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ maxWidth: "32rem", margin: 0, lineHeight: 1.6, opacity: 0.7, fontSize: "0.875rem" }}>
            The page couldn&apos;t be loaded. Please try again — and if it keeps happening, reload the page.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              cursor: "pointer",
              borderRadius: "9999px",
              border: "1px solid currentColor",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "transparent",
              color: "inherit",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", opacity: 0.5, margin: 0 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
