"use client";

import { useEffect, useState } from "react";

import { PublicMenuSite } from "@/components/public/PublicMenuSite";
import { PublicPortfolioSite } from "@/components/public/PublicPortfolioSite";
import { publicSiteApi } from "@/lib/api/publicSite";
import type { PublicWebsiteResponse } from "@/lib/api/types";

export function PublicSite({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable" | "not_found">("loading");
  const [site, setSite] = useState<PublicWebsiteResponse | null>(null);

  useEffect(() => {
    publicSiteApi
      .getBySlug(slug)
      .then((envelope) => {
        if (envelope.status === "AVAILABLE" && envelope.website) {
          setSite(envelope.website);
          setStatus("available");
        } else if (envelope.status === "UNAVAILABLE") {
          setStatus("unavailable");
        } else {
          setStatus("not_found");
        }
      })
      .catch(() => setStatus("not_found"));
  }, [slug]);

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

  if (status === "unavailable" || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">Temporarily unavailable</h1>
        <p className="text-sm text-zinc-500">This website isn&apos;t available right now. Please check back later.</p>
      </div>
    );
  }

  return site.templateType === "PORTFOLIO" ? (
    <PublicPortfolioSite site={site} />
  ) : (
    <PublicMenuSite site={site} onFirstView={handleFirstView} />
  );
}
