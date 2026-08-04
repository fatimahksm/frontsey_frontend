"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { websitesApi } from "@/lib/api/websites";
import type { WebsiteResponse } from "@/lib/api/types";

interface WebsiteContextValue {
  website: WebsiteResponse;
  accessToken: string;
  reload(): Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null);

/** Provides the currently-open website (and a way to refresh it) to every page under /dashboard/websites/[websiteId]. */
export function WebsiteProvider({
  websiteId,
  accessToken,
  initialWebsite,
  children,
}: {
  websiteId: string;
  accessToken: string;
  initialWebsite: WebsiteResponse;
  children: ReactNode;
}) {
  const [website, setWebsite] = useState(initialWebsite);

  const reload = useCallback(async () => {
    setWebsite(await websitesApi.get(accessToken, websiteId));
  }, [accessToken, websiteId]);

  const value = useMemo<WebsiteContextValue>(
    () => ({ website, accessToken, reload }),
    [website, accessToken, reload],
  );

  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
}

export function useWebsite(): WebsiteContextValue {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error("useWebsite must be used within a WebsiteProvider");
  }
  return context;
}
