"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import type { Role } from "@/lib/api/types";

/**
 * Gates a subtree behind an authenticated session, redirecting to /login
 * while it loads or once it's known there is none. Optionally further
 * restricts to a single role (e.g. the Super Admin console).
 *
 * The redirect carries where you were going. Without it, an owner who
 * bookmarked their site's console and came back a week later signed in and
 * landed on the platform's list of websites instead of the page they asked
 * for - a detour through somebody else's product on the way into their own.
 */
export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      // Read the query from the location rather than useSearchParams: this
      // component wraps statically-prerenderable pages, and that hook forces
      // every one of them into a client-side bailout. The effect is
      // browser-only anyway, so there is nothing to read on the server.
      const intended = `${pathname ?? ""}${window.location.search}`;
      router.replace(intended && intended !== "/" ? `/login?next=${encodeURIComponent(intended)}` : "/login");
      return;
    }
    if (role && session.role !== role) {
      router.replace("/dashboard");
    }
  }, [isLoading, session, role, router, pathname]);

  if (isLoading || !session || (role && session.role !== role)) {
    return null;
  }

  return <>{children}</>;
}
