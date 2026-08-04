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
  return `/dashboard/websites/${website.id}`;
}

export function publicPath(website: Pick<WebsiteResponse, "slug">): string {
  return `/site/${website.slug}`;
}

/** Joins an app path onto an origin. Origin is passed in rather than read here, so this stays pure and server-safe. */
export function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).toString();
}
