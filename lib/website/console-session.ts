/**
 * Whether this browser has signed in to one site's console, as opposed to
 * merely being signed in to Frontsey.
 *
 * The console is the business's own admin, reached by its own link, and it has
 * its own door at /s/<slug>/login. But the door only ever checked "is there a
 * platform session", so anybody already signed in to Frontsey - on a shared
 * laptop, on a machine somebody stayed logged in on - walked straight into a
 * business's admin by opening its link. The one thing that is supposed to stand
 * between the link and the console never got asked.
 *
 * A grant is written only when someone actually types that website's owner or
 * manager credentials into its own sign-in form. It lives in sessionStorage, so
 * it is per tab-session and dies with the browser: opening the admin link again
 * tomorrow asks again, which is the point of a separate admin.
 *
 * This is a door, not the lock. Every request is still authorized server-side
 * against the account's real access to the website - a forged grant buys
 * nothing but a screen that immediately fails to load.
 */

const PREFIX = "frontsey.console.";

function key(slug: string): string {
  return `${PREFIX}${slug}`;
}

/** Records that this account signed in to this website's console just now. */
export function grantConsoleAccess(slug: string, accountId: string): void {
  try {
    sessionStorage.setItem(key(slug), accountId);
  } catch {
    // Private mode, or storage disabled. The console still works for this
    // navigation; the owner is simply asked again next time.
  }
}

/** Whether this account has signed in to this website's console in this session. */
export function hasConsoleAccess(slug: string, accountId: string): boolean {
  try {
    return sessionStorage.getItem(key(slug)) === accountId;
  } catch {
    return false;
  }
}

/** Drops the grant - used when logging out of a console. */
export function revokeConsoleAccess(slug: string): void {
  try {
    sessionStorage.removeItem(key(slug));
  } catch {
    // Nothing stored, nothing to drop.
  }
}
