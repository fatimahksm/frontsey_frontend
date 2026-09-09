/**
 * Gets a picked file into something the platform can actually store and show.
 *
 * Two problems, one place.
 *
 * iPhones shoot HEIC by default. The server has never accepted it, so an owner
 * uploading a photo straight off their phone got "Only JPEG, PNG, WEBP, or GIF
 * images are allowed" - and confusingly only sometimes, because iOS silently
 * transcodes to JPEG when you pick from the photo library but sends the
 * original when you pick through Files or a share sheet.
 *
 * And nothing resized anything. A 5MB phone photo was stored and served at
 * 5MB, so a forty-item menu was a very heavy page on exactly the device most
 * likely to be looking at it.
 *
 * Both are solved here, in the browser, on purpose:
 *
 * - No native decoder on the server. Decoding HEIC in Java needs libheif
 *   present on every deployment host and preview flags on the JVM; doing it
 *   here needs nothing of the host at all.
 * - Browsers other than Safari cannot display HEIC, so storing it would leave
 *   the public site broken even if the upload succeeded. Converting is not a
 *   convenience, it is the only way the picture is ever seen.
 * - The big file never crosses the network. Resizing on the server would still
 *   have made the owner upload 5MB over hotel wifi first.
 */

/** Longest edge, in pixels. Generous enough for a full-width cover on a high-density screen. */
const MAX_EDGE = 2000;

/** JPEG quality for re-encoded photographs. Visually indistinguishable at this size, a fraction of the bytes. */
const JPEG_QUALITY = 0.85;

/**
 * Longest edge of the small copy uploaded alongside the picture.
 *
 * Measured: a phone photograph stored at MAX_EDGE is about 600KB, and a shop's
 * catalogue draws it as a 48px thumbnail - thirty rows was roughly 17MB to
 * paint thirty postage stamps. At this size the same page is about 1.3MB, and
 * it is still twice the pixels a 2x tile needs.
 */
const THUMBNAIL_EDGE = 400;

/** Below this, re-encoding usually costs more bytes than it saves. */
const SKIP_BELOW_BYTES = 300 * 1024;

function isHeic(file: File): boolean {
  // The type is often empty for HEIC because the browser does not recognise
  // it, so the extension is the more reliable signal of the two.
  return /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/** Swaps the extension so the uploaded name matches what the bytes now are. */
function renamed(name: string, extension: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.${extension}`;
}

/** Draws the bitmap down to MAX_EDGE and re-encodes it as JPEG. Null when it could not, or would not have helped. */
async function downscale(file: File, bitmap: ImageBitmap): Promise<File | null> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;

  // Already small in both senses - leave it exactly as the owner made it.
  if (scale === 1 && file.size < SKIP_BELOW_BYTES) return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) return null;

  // Only take the re-encode if it actually helped. A small flat PNG logo can
  // come out of a JPEG encoder larger than it went in.
  if (blob.size >= file.size && scale === 1) return null;
  return new File([blob], renamed(file.name, "jpg"), { type: "image/jpeg" });
}

/** Draws the bitmap down to a fixed longest edge as JPEG. Null when it could not. */
async function resizeTo(bitmap: ImageBitmap, edge: number, name: string): Promise<File | null> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, edge / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  return blob ? new File([blob], renamed(name, "jpg"), { type: "image/jpeg" }) : null;
}

/**
 * What to upload: the picture, and a small copy of it when one is worth making.
 *
 * The small copy exists because nothing downstream can make one. With R2 the
 * public URL points straight at Cloudflare and no server of ours is in the
 * path, so there is nowhere to resize on the way out - and putting one there
 * would drag every image request back through the application, which is the
 * opposite of what a shop under load needs. The browser has the decoded
 * bitmap in its hands already; making a second, smaller JPEG from it costs
 * nothing here and saves the visitor an order of magnitude.
 *
 * Never throws for a picture it merely could not improve - it hands back the
 * original and lets the server have the final say, so an old browser still
 * uploads something rather than failing at the gate.
 */
export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const full = await prepareFullImage(file);
  return { file: full, thumbnail: await makeThumbnail(full) };
}

export interface PreparedImage {
  file: File;
  /** Absent when the picture is already small, is a GIF, or could not be decoded. */
  thumbnail: File | null;
}

async function makeThumbnail(file: File): Promise<File | null> {
  // An animated GIF would be flattened to its first frame, and a picture
  // already smaller than the thumbnail would only get bigger through a second
  // JPEG encode.
  if (file.type === "image/gif") return null;
  try {
    const bitmap = await createImageBitmap(file);
    if (Math.max(bitmap.width, bitmap.height) <= THUMBNAIL_EDGE) return null;
    const thumbnail = await resizeTo(bitmap, THUMBNAIL_EDGE, file.name);
    return thumbnail && thumbnail.size < file.size ? thumbnail : null;
  } catch {
    return null;
  }
}

async function prepareFullImage(file: File): Promise<File> {
  if (isHeic(file)) {
    // Loaded on demand: it carries a WebAssembly build of libheif, and most
    // uploads are not HEIC. No reason to put that in the main bundle.
    const { heicTo } = await import("heic-to");
    const converted = await heicTo({ blob: file, type: "image/jpeg", quality: JPEG_QUALITY });
    const asJpeg = new File([converted], renamed(file.name, "jpg"), { type: "image/jpeg" });
    // An ordinary JPEG now, so it takes the same downscale as everything else.
    try {
      return (await downscale(asJpeg, await createImageBitmap(asJpeg))) ?? asJpeg;
    } catch {
      return asJpeg;
    }
  }

  // GIFs are left alone: they may be animated, and a canvas would silently
  // flatten one to its first frame.
  if (file.type === "image/gif") return file;

  try {
    return (await downscale(file, await createImageBitmap(file))) ?? file;
  } catch {
    return file;
  }
}
