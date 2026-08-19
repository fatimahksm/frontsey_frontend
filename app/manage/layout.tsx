import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * The admin area for a single website.
 *
 * Deliberately not under /dashboard and deliberately without the Frontsey
 * TopNav: once an owner is inside their own site's admin, the platform should
 * be out of the way. The shell below this carries their business name and logo,
 * and refines the tab title to it once the site has loaded.
 *
 * The title here is the fallback for the moment before that - a server
 * component is the only place a title can be set before the page renders, and
 * the business name is not knowable here, since reading it needs the visitor's
 * own token. Anything is better than the platform's name on every page of
 * somebody else's back office.
 */
export const metadata: Metadata = {
  title: "Website admin",
};

export default function ManageLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-1 flex-col">{children}</div>
    </RequireAuth>
  );
}
