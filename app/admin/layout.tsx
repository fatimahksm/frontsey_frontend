"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { TopNav } from "@/components/layout/TopNav";
import { SidebarNav, type SidebarGroup } from "@/components/ui/SidebarNav";
import {
  BarsIcon,
  BillingIcon,
  CloseIcon,
  DashboardIcon,
  PeopleIcon,
  SectionsIcon,
  SettingsIcon,
  TemplateIcon,
  TextIcon,
  ThemeIcon,
} from "@/components/ui/icons";

/**
 * The Super Admin console.
 *
 * It used to be a narrow column of text links floating beside the page. That
 * reads as a settings menu, not as the place the whole platform is run from -
 * and the thing an admin does most, working through websites and their owners,
 * was buried in the middle of an undifferentiated list.
 *
 * So: a full-height sidebar with the sections grouped by what they are for.
 * Creating websites is deliberately absent - that belongs to owners, in their
 * own dashboard. An admin oversees sites; they do not open businesses.
 *
 * The sidebar, the icons and the selected-row treatment are the shared ones.
 * This file used to draw eight SVGs of its own inline, which is how the
 * platform admin and the owner's console came to look like different products.
 */
const NAV_GROUPS: SidebarGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Overview", Icon: DashboardIcon }],
  },
  {
    label: "People & sites",
    items: [
      { href: "/admin/websites", label: "Sites", Icon: TemplateIcon },
      { href: "/admin/users", label: "Accounts", Icon: PeopleIcon },
      { href: "/admin/support", label: "Support", Icon: TextIcon },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/template-pricing", label: "Template pricing", Icon: BillingIcon },
      { href: "/admin/plans", label: "Plans", Icon: SettingsIcon },
      { href: "/admin/themes", label: "Themes", Icon: ThemeIcon },
      { href: "/admin/audit-log", label: "Audit log", Icon: SectionsIcon },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const isDrawerOpen = drawerPath === pathname;

  const identity = (
    <div className="flex items-center gap-3 border-b border-line px-4 py-4">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gradient-accent text-xs font-semibold text-white"
      >
        SA
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Super Admin</p>
        <p className="truncate text-xs text-muted">Platform control</p>
      </div>
    </div>
  );

  return (
    <RequireAuth role="SUPER_ADMIN">
      <div className="flex flex-1 flex-col">
        <TopNav />
        <div className="flex flex-1">
          <aside className="sticky top-0 hidden h-full w-60 shrink-0 flex-col border-e border-line bg-surface lg:flex">
            {identity}
            <SidebarNav groups={NAV_GROUPS} pathname={pathname} layoutId="admin-nav-active" />
          </aside>

          {/* Below lg the same list is a drawer, not a strip of pills that runs
              off the side of the screen. */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerPath(null)}
                className="absolute inset-0 bg-black/40"
              />
              <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-lift">
                {identity}
                <SidebarNav
                  groups={NAV_GROUPS}
                  pathname={pathname}
                  layoutId="admin-drawer-active"
                  onNavigate={() => setDrawerPath(null)}
                />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setDrawerPath(pathname)}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {isDrawerOpen ? <CloseIcon /> : <BarsIcon />}
              </button>
              <span className="truncate text-sm font-semibold">
                {NAV_GROUPS.flatMap((group) => group.items).find((item) => item.href === pathname)?.label ?? "Admin"}
              </span>
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
