/**
 * The small copy of an uploaded image, when there is one.
 *
 * Uploads made since the small copy existed carry a marker in their key
 * (`~v` before the extension) and have a 400px sibling at `~400`. The marker
 * is the whole point: without it this would have to guess, and a guess is a
 * 404 on every image uploaded before the change, on every page view, followed
 * by loading the full picture anyway - strictly worse than doing nothing.
 *
 * So anything without the marker is returned exactly as given, and an image
 * from any other host - a sample photo, a URL an owner pasted - is untouched
 * for the same reason.
 *
 * Kept in step with com.dbwb.platform.upload.ImageVariants on the server.
 */
const ORIGINAL_MARKER = "~v";
const THUMBNAIL_MARKER = "~400";

export function thumbnailUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Only the last path segment, so a directory that happens to contain the
  // marker cannot rewrite a filename that does not.
  const cut = url.lastIndexOf("/");
  const path = url.slice(0, cut + 1);
  const file = url.slice(cut + 1);
  const marker = file.lastIndexOf(`${ORIGINAL_MARKER}.`);
  if (marker < 0) return url;
  return path + file.slice(0, marker) + THUMBNAIL_MARKER + file.slice(marker + ORIGINAL_MARKER.length);
}
