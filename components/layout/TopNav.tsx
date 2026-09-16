"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AccountMenu } from "@/components/layout/AccountMenu";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * What a business owner's account is for: their own websites.
 *
 * Support and Account used to sit here as peers of Websites, which put three
 * unrelated jobs in one row and still left a Super Admin with no route to
 * their own settings at all. Both moved into the account menu, where every
 * role can reach them.
 */
const OWNER_LINKS = [
  { href: "/dashboard", label: "Websites", match: (path: string) => path === "/dashboard" || path.startsWith("/dashboard/websites") },
];

/**
 * What a Super Admin's account is for: the platform.
 *
 * They used to get the owner's nav with an "Admin" link added at the end, so
 * the platform console read as a side trip from a personal website list -
 * exactly backwards. The console leads now, and "My own websites" is the side
 * trip, kept because a Super Admin may genuinely own a site and should be able
 * to reach and create one. Named so it is clear that is a different hat.
 */
const ADMIN_LINKS = [
  { href: "/admin", label: "Platform", match: (path: string) => path.startsWith("/admin") },
  { href: "/dashboard", label: "My own websites", match: (path: string) => path.startsWith("/dashboard") },
];

const ACCOUNT_ITEMS = [
  { href: "/dashboard/account", label: "Account settings" },
  { href: "/dashboard/support", label: "Support" },
];

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, logout } = useAuth();
  /*
    The open state is tied to the route it was opened on, so following a link
    inside the menu closes it without an effect to synchronise - and closes it
    on the first render of the new page rather than after one where it is still
    showing.
  */
  const [menu, setMenu] = useState({ path: pathname, open: false });
  const menuOpen = menu.path === pathname && menu.open;

  if (!session) return null;

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const links = isSuperAdmin ? ADMIN_LINKS : OWNER_LINKS;

  function signOut() {
    logout();
    router.push("/login");
  }

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link href={isSuperAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="text-gradient">Frontsey</span>
          {isSuperAdmin && (
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-medium text-muted">
              Admin
            </span>
          )}
        </Link>

        {/*
          The links, the bell and Log out in one row came to 422px, so every
          page of the console scrolled sideways on any phone - measured at both
          320 and 390. They collapse into a menu below sm and are unchanged
          above it. The bell stays out of the menu at every width: a
          notification you have to open a menu to discover is one you do not
          see.
        */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {links.map((link) => {
            const isActive = link.match(pathname ?? "");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 transition-colors ${
 isActive ? "text-foreground" : "text-muted hover:text-foreground dark:text-faint"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="topnav-active"
                    className="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-gradient-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
          <span className="mx-1">
            <NotificationsBell accessToken={session.accessToken} />
          </span>
          <AccountMenu />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <NotificationsBell accessToken={session.accessToken} />
          <AccountMenu />
          <button
            type="button"
            onClick={() => setMenu({ path: pathname, open: !menuOpen })}
            aria-expanded={menuOpen}
            aria-controls="topnav-menu"
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong"
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-4 rounded bg-current" />
              <span className="block h-[2px] w-4 rounded bg-current" />
              <span className="block h-[2px] w-4 rounded bg-current" />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="topnav-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line sm:hidden"
          >
            <div className="flex flex-col p-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2.5 text-sm ${
 link.match(pathname ?? "")
                      ? "bg-black/[.04] font-medium text-foreground dark:bg-white/[.06]"
                      : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {ACCOUNT_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-control px-3 py-2.5 text-sm text-muted">
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={signOut}
                className="mt-1 rounded-control px-3 py-2.5 text-start text-sm text-muted"
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
