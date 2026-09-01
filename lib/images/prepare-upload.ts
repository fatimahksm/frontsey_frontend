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

/**
 * Returns the file to upload.
 *
 * Never throws for a picture it merely could not improve - it hands back the
 * original and lets the server have the final say, so an old browser still
 * uploads something rather than failing at the gate.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
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
