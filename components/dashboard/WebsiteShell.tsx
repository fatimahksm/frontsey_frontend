"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { Alert } from "@/components/ui/Alert";
import { friendlyMessage } from "@/lib/api/client";
import { plansApi } from "@/lib/api/plans";
import { profileApi } from "@/lib/api/profile";
import { subscriptionApi } from "@/lib/api/subscription";
import { websitesApi } from "@/lib/api/websites";
import type { Permission, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { isDisplayOnlyLayout, layoutRendersCustomSections, layoutRendersGallery } from "@/lib/website/layout-options";
import { hasPermission } from "@/lib/website/permissions";
import { publicPath } from "@/lib/website/share-links";
import { WebsiteProvider } from "@/lib/website/website-context";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Undefined = visible to any accepted manager (e.g. Overview, read-only pages). */
  permission?: Permission;
  /** Owner-only regardless of permissions (managing managers, the subscription). */
  ownerOnly?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

/**
 * Reduced, grouped navigation (Phase 2): Overview / Content / Design /
 * Website Settings / Analytics / Subscription, instead of one flat list of
 * 11+ top-level tabs. Only shows what's relevant to this website's type -
 * Delivery areas never appears for a Portfolio site, Analytics is hidden
 * when the active plan doesn't include it, and (Phase 4) a Manager only
 * sees the items they've actually been granted permission for - mirrors
 * exactly what WebsiteAccessGuard.requirePermission enforces server-side.
 */
function navGroupsFor(website: WebsiteResponse, analyticsEnabled: boolean): NavGroup[] {
  const { templateType } = website;
  // A cart-less layout has nothing to deliver, so delivery areas would be a
  // setting with no effect on the published site.
  const showsDelivery = templateType === "MENU_ORDERING" && !isDisplayOnlyLayout(website.layoutVariant);
  // Same reasoning as delivery: a layout that renders no gallery strip and no
  // custom sections would leave those editors saving content that never
  // appears anywhere on the published site.
  const showsGallery = layoutRendersGallery(website.layoutVariant);
  const showsCustomSections = layoutRendersCustomSections(website.layoutVariant);
  const contentItem: NavItem =
    templateType === "PORTFOLIO"
      ? { href: "/services", label: "Services", icon: "🛠️", permission: "MANAGE_MENU" }
      : { href: "/menu", label: "Menu", icon: "🍽️", permission: "MANAGE_MENU" };

  const groups: NavGroup[] = [
    {
      label: null,
      items: [
        { href: "", label: "Overview", icon: "🏠" },
        { href: "/share", label: "Share & QR", icon: "🔗" },
      ],
    },
    {
      label: "Content",
      items: [
        // Projects is where a portfolio's work actually gets its title, dates
        // and links. Without it the templates could only show untitled gallery
        // pictures, which is what made real sites look unfinished next to the
        // samples.
        ...(templateType === "PORTFOLIO"
          ? [{ href: "/projects", label: "Projects", icon: "🗂️", permission: "MANAGE_THEME_AND_CONTENT" } as NavItem]
          : []),
        contentItem,
        ...(showsGallery ? [{ href: "/gallery", label: "Gallery", icon: "🖼️", permission: "MANAGE_THEME_AND_CONTENT" } as NavItem] : []),
        ...(showsCustomSections
          ? [{ href: "/sections", label: "Custom sections", icon: "🧩", permission: "MANAGE_THEME_AND_CONTENT" } as NavItem]
          : []),
      ],
    },
    {
      label: "Design",
      items: [
        { href: "/layout", label: "Template", icon: "🎨", permission: "MANAGE_THEME_AND_CONTENT" },
        { href: "/theme", label: "Theme", icon: "🖌️", permission: "MANAGE_THEME_AND_CONTENT" },
      ],
    },
    {
      label: "Website Settings",
      items: [
        { href: "/profile", label: "Business profile", icon: "🏢", permission: "MANAGE_BUSINESS_PROFILE" },
        ...(showsDelivery
          ? [{ href: "/delivery", label: "Delivery areas", icon: "🚚", permission: "MANAGE_DELIVERY_SETTINGS" } as NavItem]
          : []),
        { href: "/seo", label: "SEO", icon: "🔍", permission: "MANAGE_THEME_AND_CONTENT" },
        { href: "/managers", label: "Managers", icon: "👥", ownerOnly: true },
      ],
    },
  ];

  if (analyticsEnabled) {
    groups.push({ label: null, items: [{ href: "/analytics", label: "Analytics", icon: "📈", permission: "VIEW_ANALYTICS" }] });
  }
  groups.push({ label: null, items: [{ href: "/subscription", label: "Subscription", icon: "💳", ownerOnly: true }] });

  return groups;
}

function visibleFor(groups: NavGroup[], website: WebsiteResponse): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.ownerOnly) return website.role === "OWNER" || website.role === null;
        if (!item.permission) return true;
        return hasPermission(website, item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

/** The current page's own name, so the top bar can say where you are. */
function currentLabel(groups: NavGroup[], base: string, pathname: string): string {
  for (const group of groups) {
    for (const item of group.items) {
      if (`${base}${item.href}` === pathname) return item.label;
    }
  }
  return "Overview";
}

/** Business initials, drawn when the owner has not uploaded a logo yet. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * The admin console for one website.
 *
 * It is the business's own control panel, not a page of the platform: the
 * sidebar is headed by their logo and their name, and nothing on screen says
 * Frontsey. The only route back to the platform is one small link at the foot
 * of the sidebar, for owners who run more than one site.
 */
export function WebsiteShell({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [website, setWebsite] = useState<WebsiteResponse | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

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
      .then(([subscription, plans]) => {
        if (cancelled) return;
        const plan = plans.find((p) => p.code === subscription.planCode && p.billingPeriod === subscription.billingPeriod);
        // No matching plan found just means we couldn't determine entitlement (e.g. plan list changed) - default to showing the tab rather than hiding a working feature.
        setAnalyticsEnabled(plan ? plan.analyticsEnabled : true);
      })
      .catch(() => {
        // No subscription yet, or the lookup failed - don't hide Analytics over a soft UX check.
        if (!cancelled) setAnalyticsEnabled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

  if (!session) return null;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  const base = `/manage/${websiteId}`;
  const isSetupWizard = pathname === `${base}/setup`;

  if (isSetupWizard) {
    return (
      <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
        {children}
      </WebsiteProvider>
    );
  }

  const groups = visibleFor(navGroupsFor(website, analyticsEnabled), website);
  const pageLabel = currentLabel(groups, base, pathname ?? base);

  return (
    <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
      <div className="flex flex-1">
        {/* Sidebar: the business's identity first, then its sections. */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-black/[.08] bg-surface lg:flex dark:border-white/[.1]">
          <div className="flex items-center gap-3 border-b border-black/[.08] px-4 py-4 dark:border-white/[.1]">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL; next/image would need a configured remote pattern per business
              <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
            ) : (
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-xs font-semibold text-white"
              >
                {initialsOf(website.businessName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{website.businessName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{website.role === "MANAGER" ? "Manager" : "Owner"}</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
            {groups.map((group, groupIndex) => (
              <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-0.5">
                {group.label && (
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => {
                  const href = `${base}${item.href}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      className={`relative block rounded-lg px-3 py-2 text-sm ${!isActive ? "hover:bg-black/[.04] dark:hover:bg-white/[.06]" : ""}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="website-sidebar-active"
                          className="absolute inset-0 rounded-lg bg-gradient-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={`relative flex items-center gap-2 transition-colors ${isActive ? "text-white" : "text-zinc-600 hover:text-foreground dark:text-zinc-400"}`}>
                        <span aria-hidden>{item.icon}</span>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* The one deliberate way back out to the platform. */}
          <div className="border-t border-black/[.08] px-3 py-3 dark:border-white/[.1]">
            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
            >
              ← All my websites
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar: where you are, whether the site is live, and the actions
              that belong to the console rather than to one page. */}
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-black/[.08] bg-surface/85 px-4 backdrop-blur-md dark:border-white/[.1]">
            <div className="flex min-w-0 items-center gap-3">
              <Link href={base} className="truncate text-sm font-semibold lg:hidden">
                {website.businessName}
              </Link>
              <span className="hidden text-sm font-semibold lg:inline">{pageLabel}</span>
              <WebsiteStatusBadge status={website.status} />
            </div>
            <div className="flex items-center gap-1">
              {website.status === "PUBLISHED" && (
                <a
                  href={publicPath(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
                >
                  View site ↗
                </a>
              )}
              <NotificationsBell accessToken={session.accessToken} />
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
              >
                Log out
              </button>
            </div>
          </header>

          {/* Sections as a scrolling row where the sidebar is hidden. */}
          <nav className="flex gap-1 overflow-x-auto border-b border-black/[.08] px-3 py-2 lg:hidden dark:border-white/[.1]">
            {groups
              .flatMap((group) => group.items)
              .map((item) => {
                const href = `${base}${item.href}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${
                      isActive ? "bg-gradient-accent text-white" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="flex flex-1">
            <div className="min-w-0 flex-1 px-4 py-8 sm:px-6">
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
            <div className="hidden py-8 pe-6 xl:block">
              <LivePreviewPanel websiteId={websiteId} />
            </div>
          </div>
        </div>
      </div>
    </WebsiteProvider>
  );
}
