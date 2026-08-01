"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import type { TemplateType, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { WebsiteProvider } from "@/lib/website/website-context";

/** The content-model nav item differs by TemplateType; everything else is shared. */
function navItemsFor(templateType: TemplateType) {
  const contentItem =
    templateType === "PORTFOLIO"
      ? { href: "/services", label: "Services" }
      : { href: "/menu", label: "Menu" };

  return [
    { href: "", label: "Overview" },
    { href: "/profile", label: "Business profile" },
    contentItem,
    ...(templateType === "MENU_ORDERING" ? [{ href: "/delivery", label: "Delivery areas" }] : []),
    { href: "/gallery", label: "Gallery" },
    { href: "/sections", label: "Sections" },
    { href: "/layout", label: "Template" },
    { href: "/theme", label: "Theme" },
    { href: "/seo", label: "SEO" },
    { href: "/managers", label: "Managers" },
    { href: "/subscription", label: "Subscription" },
    { href: "/analytics", label: "Analytics" },
  ];
}

export function WebsiteShell({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const [website, setWebsite] = useState<WebsiteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          <p className="truncate px-3 text-sm font-semibold">{website.businessName}</p>
          <nav className="mt-4 flex flex-col gap-0.5">
            {navItemsFor(website.templateType).map((item) => {
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
                  <span className={`relative transition-colors ${isActive ? "text-white" : "text-zinc-600 hover:text-foreground dark:text-zinc-400"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
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
