"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { websitesApi } from "@/lib/api/websites";
import type { WebsiteResponse } from "@/lib/api/types";

interface WebsiteContextValue {
  website: WebsiteResponse;
  accessToken: string;
  reload(): Promise<void>;
  /**
   * Bumped whenever the draft changes. The live preview watches this so it can
   * refresh at the moment of a save rather than on a timer.
   */
  draftVersion: number;
  /**
   * For saves that change the published draft without re-fetching the website
   * record itself - menu items, sections, gallery, profile. `reload()` bumps
   * the version on its own, so a page that calls it does not need this too.
   */
  notifyDraftChanged(): void;
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null);

/** Provides the currently-open website (and a way to refresh it) to every page under /manage/[websiteId]. */
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
  const [draftVersion, setDraftVersion] = useState(0);

  const notifyDraftChanged = useCallback(() => setDraftVersion((v) => v + 1), []);

  const reload = useCallback(async () => {
    setWebsite(await websitesApi.get(accessToken, websiteId));
    setDraftVersion((v) => v + 1);
  }, [accessToken, websiteId]);

  const value = useMemo<WebsiteContextValue>(
    () => ({ website, accessToken, reload, draftVersion, notifyDraftChanged }),
    [website, accessToken, reload, draftVersion, notifyDraftChanged],
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
