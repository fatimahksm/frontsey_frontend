"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { IMAGE_PLACEHOLDER } from "@/lib/image-placeholder";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  /** Shown when `src` fails to load. Defaults to a neutral drawn frame. */
  fallbackSrc?: string;
  ref?: React.Ref<HTMLImageElement>;
};

/**
 * An image that falls back to a drawn placeholder when its source fails.
 *
 * Every picture on a public website comes from a URL we do not control - an
 * owner's upload, or the sample photos behind the design previews - so any of
 * them can 404 long after the page was built. Without this, a dead link leaves
 * a broken-image glyph on a published site.
 *
 * `failedSrc` stores the URL that failed rather than a boolean, which gives two
 * things for free: swapping `src` to a different picture clears the failed
 * state on its own, and if the fallback itself somehow fails, the error handler
 * only re-stores the same value instead of looping.
 */
export function SafeImage({ src, fallbackSrc = IMAGE_PLACEHOLDER, alt = "", ref, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URLs; next/image would need a configured remote pattern per business
    <img {...rest} ref={ref} src={failedSrc === src ? fallbackSrc : src} alt={alt} onError={() => setFailedSrc(src)} />
  );
}

/**
 * The animated form, for the gallery strips and hero images that scale on
 * hover. Motion needs the ref to reach the underlying <img>, which is why
 * `SafeImage` forwards one.
 */
export const MotionSafeImage = motion.create(SafeImage);
