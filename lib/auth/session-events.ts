/**
 * A one-signal event bus for "this session is over".
 *
 * The fetch wrapper is the first thing to *know* the session ended - it is
 * what sees a 401 survive a refresh attempt - but it is a plain module, not a
 * React component, so it cannot clear auth state itself. Importing the auth
 * context from it would also close a cycle: the context's own API calls go
 * through the wrapper.
 *
 * So the wrapper announces, and AuthProvider listens. Without this the app had
 * a real dead end: a failed refresh threw a 401 that surfaced as an error
 * message on the page while `session` stayed populated, leaving the user
 * apparently signed in, with every subsequent request failing, and no way back
 * to the login screen but to clear storage by hand.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

/** Returns an unsubscribe function, for use as an effect cleanup. */
export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Announces that the session is unrecoverable. Safe to call repeatedly - the
 * listener's job (clear state, send the user to sign in) is idempotent, and
 * several parallel requests failing at once is the normal case rather than the
 * exception.
 */
export function emitSessionExpired(): void {
  for (const listener of listeners) {
    // One bad listener must not stop the others from signing the user out.
    try {
      listener();
    } catch {
      // Ignored on purpose.
    }
  }
}
