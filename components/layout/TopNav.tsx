"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { useAuth } from "@/lib/auth/auth-context";

const LINKS = [
  { href: "/dashboard", label: "Websites", match: (path: string) => path === "/dashboard" || path.startsWith("/dashboard/websites") },
  { href: "/dashboard/support", label: "Support", match: (path: string) => path.startsWith("/dashboard/support") },
  { href: "/dashboard/account", label: "Account", match: (path: string) => path.startsWith("/dashboard/account") },
];

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, logout } = useAuth();

  if (!session) return null;

  const links =
    session.role === "SUPER_ADMIN"
      ? [...LINKS, { href: "/admin", label: "Admin", match: (path: string) => path.startsWith("/admin") }]
      : LINKS;

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[.08] bg-surface/80 px-4 backdrop-blur-md dark:border-white/[.1]"
    >
      <Link href="/dashboard" className="text-gradient text-sm font-semibold tracking-tight">
        Frontsey
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
