"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { LockIcon } from "@/components/ui/icons";

/**
 * The console's sidebar, drawn once for both of them.
 *
 * The owner's console and the platform admin each had their own copy: one
 * grouped and one flat, one with emoji and one with SVG drawn inline in a
 * layout file, and both filling the selected row with the accent gradient - a
 * saturated block that shouted louder than whatever the page's actual primary
 * action was. This is the one version, and the selected row is a tint and a
 * rail instead.
 */
export interface SidebarItem {
  /** Absolute, so this component never has to know which console it is in. */
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  /** Not on this plan. The row still opens; the page explains why. */
  locked?: boolean;
  /**
   * Lit only on its own address, never on what sits under it.
   *
   * The console's overview is the section root - /manage/<id> - so every other
   * page in the console is "under" it by prefix. Without this it stayed lit
   * alongside whichever section you were actually in, and two highlighted rows
   * tell you nothing about where you are.
   */
  exact?: boolean;
}

export interface SidebarGroup {
  label: string | null;
  items: SidebarItem[];
}

export function SidebarNav({
  groups,
  pathname,
  /** Distinct per sidebar, or the two would animate into each other when both mount. */
  layoutId,
  /** True when a section owns its sub-routes, so /menu stays lit on /menu/items/new. */
  matchSubRoutes = false,
  onNavigate,
}: {
  groups: SidebarGroup[];
  pathname: string;
  layoutId: string;
  matchSubRoutes?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-0.5">
          {group.label && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">{group.label}</p>
          )}
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || (matchSubRoutes && !item.exact && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring relative flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-quiet font-medium text-accent-ink"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-accent-solid"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.Icon className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.locked && (
                  <LockIcon className="ms-auto h-3.5 w-3.5 shrink-0 text-faint" aria-label="Not included in your plan" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
