"use client";

import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { WebsiteResponse } from "@/lib/api/types";
import { absoluteUrl, adminPath, publicPath } from "@/lib/website/share-links";

/** Rendered at 1024px so a downloaded code stays sharp when printed on a sign or table card. */
const QR_DOWNLOAD_SIZE = 1024;

/** The origin never changes for the life of the page, so there is nothing to subscribe to. */
const subscribeToOrigin = () => () => {};

/**
 * The browser's origin, or "" while server-rendering. Read through
 * useSyncExternalStore rather than an effect so render stays consistent
 * between server and client without a setState-driven second pass.
 */
function useOrigin(): string {
  return useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => "",
  );
}

function CopyableLink({ label, description, url }: { label: string; description: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (insecure origin, permissions) - the
      // full URL is selectable in the field below either way.
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 min-w-0 flex-1 rounded-lg border border-black/[.12] bg-surface px-3 font-mono text-xs outline-none dark:border-white/[.18]"
        />
        {/* Button is w-full by design, so the row's widths are set by these
            wrappers - a bare w-auto on the button loses to its own base class
            and would swallow the whole row. */}
        <span className="w-24 shrink-0">
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </span>
        <a href={url} target="_blank" rel="noreferrer" className="w-24 shrink-0">
          <Button variant="secondary">Open</Button>
        </a>
      </div>
    </div>
  );
}

/**
 * The three things an owner walks away with once their website is set up:
 * the admin link they manage it from, the public link customers open, and a
 * QR code for that public link to print on a table card, window, or receipt.
 *
 * Shown both at the end of the setup wizard and on its own dashboard page, so
 * it stays reachable long after the wizard is done.
 */
export function ShareLinksPanel({ website }: { website: WebsiteResponse }) {
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null);
  const [qrSvgUrl, setQrSvgUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  // The links are origin-dependent, so they only exist once mounted in a browser.
  const origin = useOrigin();
  const urls = origin
    ? { admin: absoluteUrl(origin, adminPath(website)), publicSite: absoluteUrl(origin, publicPath(website)) }
    : null;

  // Keyed off the URL string, not the `urls` object, which is rebuilt each render.
  const publicSiteUrl = urls?.publicSite ?? null;

  useEffect(() => {
    if (!publicSiteUrl) return;
    let cancelled = false;
    const options = { margin: 1, width: QR_DOWNLOAD_SIZE, color: { dark: "#000000", light: "#ffffff" } };

    Promise.all([
      QRCode.toDataURL(publicSiteUrl, options),
      QRCode.toString(publicSiteUrl, { type: "svg", margin: 1 }),
    ])
      .then(([png, svg]) => {
        if (cancelled) return;
        setQrPngUrl(png);
        setQrSvgUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      })
      .catch(() => {
        if (!cancelled) setQrError("The QR code could not be generated. The links above still work.");
      });

    return () => {
      cancelled = true;
    };
  }, [publicSiteUrl]);

  if (!urls) return null;

  const fileBase = `${website.slug}-menu-qr`;

  return (
    <div className="flex flex-col gap-6">
      {website.status !== "PUBLISHED" && (
        <Alert tone="info">
          Your website isn&apos;t published yet, so the public link and QR code won&apos;t work for customers until you
          publish it. The links themselves stay the same afterwards, so anything you print now stays valid.
        </Alert>
      )}

      <CopyableLink
        label="Admin link"
        description="Your private dashboard for this website. Keep it to yourself and your managers."
        url={urls.admin}
      />

      <CopyableLink
        label="Public link"
        description="What customers open. Share it anywhere - Instagram bio, WhatsApp, printed material."
        url={urls.publicSite}
      />

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium">Menu QR code</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Points at your public link. Print it on table cards, your window, or receipts.
          </p>
        </div>

        {qrError && <Alert tone="error">{qrError}</Alert>}

        {qrPngUrl && (
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- locally generated data: URL, nothing for the image optimizer to fetch */}
            <img
              src={qrPngUrl}
              alt={`QR code linking to ${urls.publicSite}`}
              className="h-40 w-40 rounded-xl border border-black/[.08] bg-white p-2 dark:border-white/[.145]"
            />
            <div className="flex w-44 flex-col gap-2">
              <a href={qrPngUrl} download={`${fileBase}.png`}>
                <Button variant="secondary">Download PNG</Button>
              </a>
              {qrSvgUrl && (
                <a href={qrSvgUrl} download={`${fileBase}.svg`}>
                  <Button variant="secondary">Download SVG</Button>
                </a>
              )}
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Use the SVG for large prints - it stays sharp at any size.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
