"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { ChevronLeftIcon, LockIcon } from "@/components/ui/icons";

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
  /** Folded down to its icons. The drawer is never collapsed - it is already a sheet you opened. */
  collapsed = false,
  onNavigate,
}: {
  groups: SidebarGroup[];
  pathname: string;
  layoutId: string;
  matchSubRoutes?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className={`flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden py-4 ${collapsed ? "px-2" : "px-3"}`}>
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-0.5">
          {group.label &&
            (collapsed ? (
              // The group still reads as a group - a rule instead of a word,
              // because a truncated "PEOPLE &" is worse than no label at all.
              <span aria-hidden className="mx-2 mb-1.5 h-px bg-line" />
            ) : (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">{group.label}</p>
            ))}
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || (matchSubRoutes && !item.exact && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                // Collapsed, the icon is the only thing naming the row, so the
                // label has to survive somewhere a pointer and a screen reader
                // can both reach.
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={`focus-ring relative flex items-center gap-2.5 rounded-control py-2 text-sm transition-colors ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${
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
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.locked && !collapsed && (
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

/**
 * The control that folds the sidebar away.
 *
 * At the foot of it rather than in the header: it belongs to the sidebar, and
 * putting it in the top bar would make it look like something that acts on the
 * page. Hidden below lg, where the sidebar is a drawer and folding it to icons
 * would mean two ways to dismiss the same sheet.
 */
export function SidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
      title={collapsed ? "Expand the menu" : "Collapse the menu"}
      className={`focus-ring flex w-full items-center gap-2.5 rounded-control py-2 text-xs text-muted transition-colors hover:bg-surface-muted hover:text-foreground ${
        collapsed ? "justify-center px-2" : "px-3"
      }`}
    >
      <ChevronLeftIcon className={`h-[17px] w-[17px] shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} />
      {!collapsed && "Collapse menu"}
    </button>
  );
}
