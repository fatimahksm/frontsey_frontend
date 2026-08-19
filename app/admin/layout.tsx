"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { TopNav } from "@/components/layout/TopNav";

/**
 * The Super Admin console.
 *
 * It used to be a narrow column of text links floating beside the page. That
 * reads as a settings menu, not as the place the whole platform is run from -
 * and the thing an admin does most, working through websites and their owners,
 * was buried in the middle of an undifferentiated list.
 *
 * So: a full-height sidebar with the sections grouped by what they are for,
 * each with an icon and a line saying what it holds. Creating websites is
 * deliberately absent - that belongs to owners, in their own dashboard. An
 * admin oversees sites; they do not open businesses.
 */

interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: ReactNode;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      {
        href: "/admin",
        label: "Overview",
        hint: "Platform at a glance",
        icon: (
          <Icon>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </Icon>
        ),
      },
    ],
  },
  {
    label: "People & sites",
    items: [
      {
        href: "/admin/websites",
        label: "Sites",
        hint: "Every website, owner and plan",
        icon: (
          <Icon>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18" />
            <path d="M7 6.5h.01M10 6.5h.01" />
          </Icon>
        ),
      },
      {
        href: "/admin/users",
        label: "Accounts",
        hint: "Owners and managers",
        icon: (
          <Icon>
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3 20a6 6 0 0112 0" />
            <path d="M16 5.5a3.2 3.2 0 010 6" />
            <path d="M17.5 14.5A6 6 0 0121 20" />
          </Icon>
        ),
      },
      {
        href: "/admin/support",
        label: "Support",
        hint: "Tickets from owners",
        icon: (
          <Icon>
            <path d="M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z" />
          </Icon>
        ),
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        href: "/admin/template-pricing",
        label: "Template pricing",
        hint: "What each template costs",
        icon: (
          <Icon>
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <path d="M2.5 10h19" />
            <path d="M6 15h4" />
          </Icon>
        ),
      },
      {
        href: "/admin/plans",
        label: "Plans",
        // Owners no longer pick a plan - a template names one, and this is where
        // what that plan allows is set.
        hint: "The limits behind each price",
        icon: (
          <Icon>
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </Icon>
        ),
      },
      {
        href: "/admin/themes",
        label: "Themes",
        hint: "The presets owners can pick",
        icon: (
          <Icon>
            <path d="M12 3a9 9 0 100 18h1.5a2 2 0 001.6-3.2 2 2 0 011.6-3.2H19a3 3 0 003-3A9 9 0 0012 3z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="11" cy="7.5" r="1" />
            <circle cx="15.5" cy="9" r="1" />
          </Icon>
        ),
      },
      {
        href: "/admin/audit-log",
        label: "Audit log",
        hint: "Who did what, and when",
        icon: (
          <Icon>
            <path d="M4 4h12l4 4v12H4z" />
            <path d="M8 12h8M8 16h5" />
          </Icon>
        ),
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth role="SUPER_ADMIN">
      <div className="flex flex-1 flex-col">
        <TopNav />
        <div className="flex flex-1">
          <aside className="sticky top-0 hidden h-full w-64 shrink-0 flex-col border-e border-black/[.08] bg-surface lg:flex dark:border-white/[.1]">
            <div className="flex items-center gap-3 px-5 py-5">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent text-xs font-semibold text-white"
              >
                SA
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Super Admin</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">Platform control</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2">
              {NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
                  {group.label && (
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          isActive ? "" : "text-zinc-600 hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="admin-sidebar-active"
                            className="absolute inset-0 rounded-xl bg-gradient-accent"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className={`relative flex items-center gap-3 ${isActive ? "font-medium text-white" : ""}`}>
                          {item.icon}
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Sections as a scrolling row where the sidebar is hidden. */}
            <nav className="flex gap-1 overflow-x-auto border-b border-black/[.08] px-3 py-2 lg:hidden dark:border-white/[.1]">
              {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                      isActive ? "bg-gradient-accent text-white" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
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
