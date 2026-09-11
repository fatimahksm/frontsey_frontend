"use client";

import { useCallback, useEffect, useState } from "react";

import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { ApiError } from "@/lib/api/errors";
import { publicSiteApi } from "@/lib/api/publicSite";
import type { PublicWebsiteResponse } from "@/lib/api/types";

type Status = "loading" | "available" | "unavailable" | "not_found" | "unreachable";

/**
 * A visitor's view of one published site, and of the four ways there can be no
 * site to show.
 *
 * "Not found" is only ever said when the server said it. Every failure used to
 * land there - a dropped connection, a timeout, a 500 - so an owner whose site
 * was perfectly fine had it telling their customers, in their own words, that
 * it does not exist. That is the worst thing this page can say and the least
 * likely to be true: the request that failed is the only evidence either way,
 * and a request that never arrived is evidence of nothing.
 */
export function PublicSite({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [site, setSite] = useState<PublicWebsiteResponse | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    publicSiteApi
      .getBySlug(slug)
      .then((envelope) => {
        // The visit, counted separately from the page so the page can be
        // cached. Deliberately not awaited and deliberately swallowed on
        // failure: a number nobody reads until tomorrow must never be the
        // reason a shop's page does not appear.
        publicSiteApi.recordPageView(slug).catch(() => {});

        if (envelope.status === "AVAILABLE" && envelope.website) {
          setSite(envelope.website);
          setStatus("available");
        } else if (envelope.status === "UNAVAILABLE") {
          setStatus("unavailable");
        } else {
          setStatus("not_found");
        }
      })
      .catch((error: unknown) => {
        // Only the server's own 404 means the address is wrong. Anything else
        // - offline, timed out, the API restarting - is us, not them.
        const saidNotFound = error instanceof ApiError && error.kind === "not_found";
        setStatus(saidNotFound ? "not_found" : "unreachable");
      });
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching on mount is a one-time sync with the backend, not derivable state
    load();
  }, [load]);

  function handleFirstView(itemId: string) {
    publicSiteApi.recordItemView(slug, itemId).catch(() => {});
  }

  if (status === "loading") {
    return <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">Loading…</div>;
  }

  if (status === "not_found") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-zinc-500">This website doesn&apos;t exist.</p>
      </div>
    );
  }

  if (status === "unreachable") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">Can&apos;t load this page</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          The connection didn&apos;t go through. Check your internet and try again in a moment.
        </p>
        {/* Most of the time this is a phone on bad mobile data, and the whole
            fix is one more attempt - which should not require knowing how to
            reload a page. */}
        <button
          type="button"
          onClick={load}
          className="mt-1 rounded-full border border-black/[.12] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-white/[.06]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "unavailable" || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">Temporarily unavailable</h1>
        <p className="text-sm text-zinc-500">This website isn&apos;t available right now. Please check back later.</p>
      </div>
    );
  }

  return <PublicSiteRenderer site={site} onFirstView={handleFirstView} />;
}
