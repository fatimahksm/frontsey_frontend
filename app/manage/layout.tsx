"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * The admin area for a single website.
 *
 * Deliberately not under /dashboard and deliberately without the Frontsey
 * TopNav: once an owner is inside their own site's admin, the platform should
 * be out of the way. The shell below this carries their business name and logo
 * instead, so the screen reads as their control panel rather than as a page on
 * somebody else's product.
 */
export default function ManageLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-1 flex-col">{children}</div>
    </RequireAuth>
  );
}
