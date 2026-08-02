/**
 * Client-side JWT payload peek - reads the `exp` claim only, purely to
 * schedule a proactive refresh before it lapses. This is NOT verification
 * (no signature check); the backend remains the sole authority on validity.
 */
export function decodeJwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
