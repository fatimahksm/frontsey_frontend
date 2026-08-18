"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { useAuth } from "@/lib/auth/auth-context";

/** What a business owner's account is for: their own websites. */
const OWNER_LINKS = [
  { href: "/dashboard", label: "Websites", match: (path: string) => path === "/dashboard" || path.startsWith("/dashboard/websites") },
  { href: "/dashboard/support", label: "Support", match: (path: string) => path.startsWith("/dashboard/support") },
  { href: "/dashboard/account", label: "Account", match: (path: string) => path.startsWith("/dashboard/account") },
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

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, logout } = useAuth();

  if (!session) return null;

  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const links = isSuperAdmin ? ADMIN_LINKS : OWNER_LINKS;

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[.08] bg-surface/80 px-4 backdrop-blur-md dark:border-white/[.1]"
    >
      <Link href={isSuperAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="text-gradient">Frontsey</span>
        {isSuperAdmin && (
          <span className="rounded-full border border-black/[.12] px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:border-white/[.18] dark:text-zinc-400">
            Admin
          </span>
        )}
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {links.map((link) => {
          const isActive = link.match(pathname ?? "");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 transition-colors ${
                isActive ? "text-foreground" : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
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
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="ml-2 rounded-full border border-black/[.12] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-white/[.06]"
        >
          Log out
        </motion.button>
      </nav>
    </motion.header>
  );
}
