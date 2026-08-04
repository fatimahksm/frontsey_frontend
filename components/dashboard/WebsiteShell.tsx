"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ApiError } from "@/lib/api/client";
import { plansApi } from "@/lib/api/plans";
import { subscriptionApi } from "@/lib/api/subscription";
import { websitesApi } from "@/lib/api/websites";
import type { Permission, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { isDisplayOnlyLayout, layoutRendersCustomSections, layoutRendersGallery } from "@/lib/website/layout-options";
import { hasPermission } from "@/lib/website/permissions";
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

export function WebsiteShell({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const [website, setWebsite] = useState<WebsiteResponse | null>(null);
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
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load this website.");
      });
    return () => {
      cancelled = true;
    };
  }, [session, websiteId]);

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

  const base = `/dashboard/websites/${websiteId}`;
  const isSetupWizard = pathname === `${base}/setup`;

  if (isSetupWizard) {
    return (
      <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
        {children}
      </WebsiteProvider>
    );
  }

  return (
    <WebsiteProvider websiteId={websiteId} accessToken={session.accessToken} initialWebsite={website}>
      <div className="mx-auto flex w-full max-w-[104rem] flex-1 gap-8 px-4 py-8">
        <aside className="w-52 shrink-0">
          <div className="flex items-center gap-2 px-3">
            <p className="truncate text-sm font-semibold">{website.businessName}</p>
            <Badge tone={website.role === "MANAGER" ? "neutral" : "success"}>
              {website.role === "MANAGER" ? "Manager" : "Owner"}
            </Badge>
          </div>
          <nav className="mt-4 flex flex-col gap-4">
            {visibleFor(navGroupsFor(website, analyticsEnabled), website).map((group, groupIndex) => (
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
        </aside>
        <div className="min-w-0 flex-1">
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
        <LivePreviewPanel websiteId={websiteId} />
      </div>
    </WebsiteProvider>
  );
}
