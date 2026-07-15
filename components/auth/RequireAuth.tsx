"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import type { Role } from "@/lib/api/types";

/**
 * Gates a subtree behind an authenticated session, redirecting to /login
 * while it loads or once it's known there is none. Optionally further
 * restricts to a single role (e.g. the Super Admin console).
 */
export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (role && session.role !== role) {
      router.replace("/dashboard");
    }
  }, [isLoading, session, role, router]);

  if (isLoading || !session || (role && session.role !== role)) {
    return null;
  }

  return <>{children}</>;
}
