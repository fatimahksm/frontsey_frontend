"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
 *
 * onError alone is not enough. These pages are server-rendered, so the browser
 * starts fetching every image in the HTML before React has hydrated - and an
 * image that fails in that window fires its error at nothing, because the
 * handler is not attached yet. The result was the exact broken-image glyph this
 * component exists to prevent, and only ever on the images high in the page
 * (covers, logos) that the browser reaches first, which is why it survived: the
 * ones that fail after hydration, further down, always fell back correctly.
 * The check on mount is that missed error: a complete image with no intrinsic
 * width did not load.
 */
export function SafeImage({ src, fallbackSrc = IMAGE_PLACEHOLDER, alt = "", ref, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const element = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const image = element.current;
    if (image && image.complete && image.naturalWidth === 0) {
      setFailedSrc(src);
    }
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URLs; next/image would need a configured remote pattern per business
    <img
      /*
        Off-screen images are not fetched until they are scrolled towards.
        Before this a shop shipped every photograph it had at once - measured
        at 301 requests on a 300-product catalogue - which on a phone on mobile
        data is the whole page's cost paid for the two rows anyone sees. It is
        set before the spread so a caller can still ask for eager.
      */
      loading="lazy"
      {...rest}
      ref={(node) => {
        element.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      src={failedSrc === src ? fallbackSrc : src}
      alt={alt}
      onError={() => setFailedSrc(src)}
    />
  );
}

/**
 * The animated form, for the gallery strips and hero images that scale on
 * hover. Motion needs the ref to reach the underlying <img>, which is why
 * `SafeImage` forwards one.
 */
export const MotionSafeImage = motion.create(SafeImage);
