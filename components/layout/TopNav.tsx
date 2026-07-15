"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { useAuth } from "@/lib/auth/auth-context";

export function TopNav() {
  const router = useRouter();
  const { session, logout } = useAuth();

  if (!session) return null;

  return (
    <header className="flex h-14 items-center justify-between border-b border-black/[.08] px-4 dark:border-white/[.145]">
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
        Frontsey
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
          Websites
        </Link>
        <Link href="/dashboard/support" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
          Support
        </Link>
        <Link href="/dashboard/account" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
          Account
        </Link>
        {session.role === "SUPER_ADMIN" && (
          <Link href="/admin" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
            Admin
          </Link>
        )}
        <NotificationsBell accessToken={session.accessToken} />
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-full border border-black/[.12] px-3 py-1.5 text-xs font-medium hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-white/[.06]"
        >
          Log out
        </button>
      </nav>
    </header>
  );
}
