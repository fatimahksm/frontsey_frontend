"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";
import { PlanLockBanner } from "@/components/dashboard/PlanLockBanner";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { activeItem, navGroupsFor, visibleFor, type NavGroup } from "@/components/console/nav";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SidebarNav, SidebarToggle } from "@/components/ui/SidebarNav";
import { BackIcon, BarsIcon, CloseIcon, ExternalIcon, SettingsIcon } from "@/components/ui/icons";
import { friendlyMessage } from "@/lib/api/client";
import { plansApi } from "@/lib/api/plans";
import { profileApi } from "@/lib/api/profile";
import { subscriptionApi } from "@/lib/api/subscription";
import { websitesApi } from "@/lib/api/websites";
import type { SubscriptionResponse, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { useSidebarCollapsed } from "@/lib/console/sidebar-collapse";
import { hasPermission } from "@/lib/website/permissions";
import { publicPath } from "@/lib/website/share-links";
import { WebsiteProvider } from "@/lib/website/website-context";

/**
 * The console for one website - the only one.
 *
 * It replaces two shells that showed the same sections under different icons:
 * a "setup area" whose sidebar was emoji, and a "console" reached through a
 * second sign-in page. An owner moving between them was asked to log in again
 * to a product they were already logged in to.
 *
 * The frame is the business's own, not the platform's: their logo, their name,
 * and one small way back out for owners who run more than one site.
 */

/** Business initials, drawn when the owner has not uploaded a logo yet. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function NavList({
  groups,
  base,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  groups: NavGroup[];
  base: string;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <SidebarNav
      layoutId={collapsed ? "console-nav-active-collapsed" : "console-nav-active"}
      pathname={pathname}
      collapsed={collapsed}
      onNavigate={onNavigate}
      // A section owns its sub-routes: adding an item keeps the row that got
      // you there lit, rather than lighting nothing.
      matchSubRoutes
      groups={groups.map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          href: `${base}${item.href}`,
          label: item.label,
          Icon: item.Icon,
          locked: item.locked,
          // The overview is every other page's prefix, so it only ever matches
          // its own address.
          exact: item.href === "",
        })),
      }))}
    />
  );
}

export function ConsoleShell({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [website, setWebsite] = useState<WebsiteResponse | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const { collapsed, hasToggled, toggle: toggleCollapsed } = useSidebarCollapsed();

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    websitesApi
      .get(session.accessToken, websiteId)
      .then((w) => {
        if (!cancelled) setWebsite(w);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Failed to load this website."));
      });
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

  // The logo is what makes this the owner's console rather than a generic one,
  // so it is fetched here rather than only on the profile page. A failure is
  // silent: the initials mark is a complete fallback.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    profileApi
      .get(session.accessToken, websiteId)
      .then((profile) => {
        if (!cancelled) setLogoUrl(profile.logoUrl || null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

  // The browser tab is part of the console. The /manage layout sets a neutral
  // server-rendered fallback; this refines it to the business's own name once
  // the site has loaded. Deferred by a frame because Next streams its metadata
  // in after the page commits and would otherwise overwrite the assignment.
  useEffect(() => {
    if (!website) return;
    const id = setTimeout(() => {
      document.title = website.businessName;
    }, 0);
    return () => clearTimeout(id);
  }, [website]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.all([subscriptionApi.get(session.accessToken, websiteId), plansApi.list()])
      .then(([found, plans]) => {
        if (cancelled) return;
        setSubscription(found);
        const plan = plans.find((p) => p.code === found.planCode && p.billingPeriod === found.billingPeriod);
        // No matching plan just means entitlement could not be determined -
        // default to showing the section rather than hiding a working feature.
        setAnalyticsEnabled(plan ? plan.analyticsEnabled : true);
      })
      .catch(() => {
        if (!cancelled) {
          setAnalyticsEnabled(true);
          setSubscription(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

  if (!session) return null;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const base = `/manage/${websiteId}`;

  // The guided wizard runs without the frame: it is a linear flow, and a
  // sidebar offering fifteen ways out of step two is not one.
  if (pathname === `${base}/setup`) {
    return (
      <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
        {children}
      </WebsiteProvider>
    );
  }

  const groups = visibleFor(navGroupsFor(website, analyticsEnabled), website, hasPermission);
  const active = activeItem(groups, base, pathname);
  const isDrawerOpen = drawerPath === pathname;

  // The shell names the page only when the route *is* a section. A sub-route -
  // adding an item, importing a CSV, editing one product - is about one thing
  // rather than the section, so it keeps its own heading and the shell stays
  // out of its way. Printing both is how "Collections & products" ended up
  // sitting above "Add menu item".
  const isSectionRoot = active !== null && pathname === `${base}${active.href}`;

  const identity = (collapsedForm: boolean) => (
    <div
      className={`flex items-center gap-3 border-b border-line py-4 ${
        collapsedForm ? "justify-center px-2" : "px-4"
      }`}
      title={collapsedForm ? website.businessName : undefined}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL; next/image would need a configured remote pattern per business
        <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-control object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gradient-accent text-xs font-semibold text-white"
        >
          {initialsOf(website.businessName)}
        </span>
      )}
      {!collapsedForm && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{website.businessName}</p>
          <p className="text-xs text-muted">{website.role === "MANAGER" ? "Manager" : "Owner"}</p>
        </div>
      )}
    </div>
  );

  const footer = (collapsedForm: boolean, withToggle: boolean) => (
    <div className={`border-t border-line ${collapsedForm ? "p-2" : "p-3"}`}>
      {website.status === "DRAFT" && (
        <Link
          href={`${base}/setup`}
          title={collapsedForm ? "Guided setup" : undefined}
          aria-label={collapsedForm ? "Guided setup" : undefined}
          className={`focus-ring mb-1 flex items-center gap-2.5 rounded-control py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground ${
            collapsedForm ? "justify-center px-2" : "px-3"
          }`}
        >
          <SettingsIcon className="h-[17px] w-[17px] shrink-0" />
          {!collapsedForm && "Guided setup"}
        </Link>
      )}
      <Link
        href="/dashboard"
        title={collapsedForm ? "All my websites" : undefined}
        aria-label={collapsedForm ? "All my websites" : undefined}
        className={`focus-ring mb-1 flex items-center gap-2.5 rounded-control py-2 text-xs text-muted transition-colors hover:bg-surface-muted hover:text-foreground ${
          collapsedForm ? "justify-center px-2" : "px-3"
        }`}
      >
        <BackIcon className="h-[17px] w-[17px] shrink-0" />
        {!collapsedForm && "All my websites"}
      </Link>
      {withToggle && <SidebarToggle collapsed={collapsedForm} onToggle={toggleCollapsed} />}
    </div>
  );

  return (
    <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
      <div className="flex flex-1">
        {/* Full height, always: it is sticky at the top of a screen-tall box,
            so the rail runs the whole side rather than stopping under its last
            row. The width animates, but only once the stored preference has
            landed - otherwise a collapsed sidebar unfolds and refolds on every
            page load. */}
        <aside
          aria-label="Sections"
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-e border-line bg-surface lg:flex ${
            hasToggled ? "transition-[width] duration-200 ease-out" : ""
          } ${collapsed ? "w-[3.75rem]" : "w-60"}`}
        >
          {identity(collapsed)}
          <NavList groups={groups} base={base} pathname={pathname} collapsed={collapsed} />
          {footer(collapsed, true)}
        </aside>

        {/* Below lg the same list is a drawer rather than a scrolling strip of
            pills. Fifteen sections in a horizontal strip means the last of them
            is never seen, and "swipe the menu sideways" is not a pattern a shop
            owner should have to discover. */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerPath(null)}
              className="absolute inset-0 bg-black/40"
            />
            <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-lift">
              {identity(false)}
              <NavList groups={groups} base={base} pathname={pathname} onNavigate={() => setDrawerPath(null)} />
              {footer(false, false)}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/85 px-3 backdrop-blur-md sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setDrawerPath(pathname)}
                className="focus-ring -ms-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
              >
                {isDrawerOpen ? <CloseIcon /> : <BarsIcon />}
              </button>
              <span className="truncate text-sm font-semibold">{active?.label ?? website.businessName}</span>
              <WebsiteStatusBadge status={website.status} />
            </div>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              {website.status === "PUBLISHED" && (
                <a href={publicPath(website)} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <ExternalIcon className="h-4 w-4" />
                    View site
                  </Button>
                </a>
              )}
              <NotificationsBell accessToken={session.accessToken} />
              <Button
 variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Log out
              </Button>
            </div>
          </header>

          <PlanLockBanner subscription={subscription} subscriptionHref={`${base}/subscription`} />

          <div className="flex flex-1">
            <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
              {/* The page's own name and purpose, said once, here - rather than
                  each page repeating a heading that disagreed with the sidebar
                  row that opened it. */}
              {isSectionRoot && active && (
                <div className="mb-6">
                  <h1 className="text-xl font-semibold tracking-tight">{active.label}</h1>
                  <p className="mt-1 text-sm text-muted">{active.hint}</p>
                </div>
              )}
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
            <div className="hidden py-8 pe-6 xl:block">
              <LivePreviewPanel websiteId={websiteId} />
            </div>
          </div>
        </div>
      </div>
    </WebsiteProvider>
  );
}
