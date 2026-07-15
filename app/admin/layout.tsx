"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { TopNav } from "@/components/layout/TopNav";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/websites", label: "Websites" },
  { href: "/admin/themes", label: "Themes" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/support", label: "Support tickets" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth role="SUPER_ADMIN">
      <div className="flex flex-1 flex-col">
        <TopNav />
        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
          <aside className="w-48 shrink-0">
            <p className="px-3 text-sm font-semibold">Admin</p>
            <nav className="mt-4 flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
