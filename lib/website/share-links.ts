import type { WebsiteResponse } from "@/lib/api/types";

/**
 * The three links an owner needs once their website is set up: the private
 * dashboard they manage it from, the public page customers open, and the QR
 * code that points at that public page.
 *
 * Paths are relative here and only joined to an origin in the browser, since
 * the app is served from whatever host the owner is actually using (localhost
 * in development, a real domain in production) and hardcoding either would
 * hand out a link that works on one and not the other.
 */

export function adminPath(website: Pick<WebsiteResponse, "id">): string {
  return `/manage/${website.id}`;
}

/**
 * The sign-in link for one website's admin.
 *
 * Bookmarking `adminPath` works, but a signed-out owner opening it lands on the
 * platform's own login page, which greets them with somebody else's brand
 * before letting them into their site. This carries the slug, so the login
 * screen can wear their name and logo and send them straight to their console
 * afterwards - the whole way in belongs to their business.
 */
export function adminSignInPath(website: Pick<WebsiteResponse, "slug">): string {
  return `/login?site=${encodeURIComponent(website.slug)}`;
}

export function publicPath(website: Pick<WebsiteResponse, "slug">): string {
  return `/site/${website.slug}`;
}

/** Joins an app path onto an origin. Origin is passed in rather than read here, so this stays pure and server-safe. */
export function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).toString();
}
