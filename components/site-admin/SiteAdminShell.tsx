"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  DashboardIcon,
  DeliveryIcon,
  GalleryIcon,
  MenuIcon,
  ProjectsIcon,
  ReportsIcon,
  ServicesIcon,
  SettingsIcon,
} from "@/components/site-admin/icons";
import { Alert } from "@/components/ui/Alert";
import { friendlyMessage } from "@/lib/api/client";
import { profileApi } from "@/lib/api/profile";
import { websitesApi } from "@/lib/api/websites";
import type { BusinessProfileResponse, TemplateType, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * The business's own admin console, at /s/<slug>.
 *
 * Distinct from /manage/<id>, which is the setup area - the place you pick a
 * template, fill in a profile and publish. This is the place you come back to
 * afterwards: how the site is doing, and the day-to-day content behind it. They
 * are different jobs done at different frequencies, and folding them into one
 * screen is what made the old dashboard read as a settings page.
 *
 * Keyed by slug rather than id so the link is something an owner can recognise
 * and type, and gated on that account genuinely having access to *this* site -
 * a valid platform session is not by itself permission to be here.
 */

interface NavItem {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  /** One line under the label, so nobody has to guess what a section is for. */
  hint: string;
}

/**
 * What a site's console is made of, which is not the same for a shop and a
 * portfolio: one has a menu and delivery areas, the other has projects and
 * services. Listing the same sections for both is how a portfolio owner ends
 * up staring at "Delivery areas".
 */
function sectionsFor(templateType: TemplateType): NavItem[] {
  if (templateType === "PORTFOLIO") {
    return [
      { href: "", label: "Dashboard", Icon: DashboardIcon, hint: "How your site is doing" },
      { href: "/projects", label: "Projects", Icon: ProjectsIcon, hint: "The work your site shows" },
      { href: "/services", label: "Services", Icon: ServicesIcon, hint: "What you offer, and prices" },
      { href: "/gallery", label: "Gallery", Icon: GalleryIcon, hint: "Extra photos" },
      { href: "/analytics", label: "Reports", Icon: ReportsIcon, hint: "Full visitor numbers" },
    ];
  }
  return [
    { href: "", label: "Dashboard", Icon: DashboardIcon, hint: "How your site is doing" },
    { href: "/menu", label: "Menu", Icon: MenuIcon, hint: "Categories, items and prices" },
    { href: "/gallery", label: "Gallery", Icon: GalleryIcon, hint: "Photos of the place" },
    { href: "/delivery", label: "Delivery", Icon: DeliveryIcon, hint: "Zones and fees" },
    { href: "/analytics", label: "Reports", Icon: ReportsIcon, hint: "Full visitor numbers" },
  ];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export interface SiteAdminContext {
  website: WebsiteResponse;
  profile: BusinessProfileResponse | null;
  accessToken: string;
}

export function SiteAdminShell({
  slug,
  children,
}: {
  slug: string;
  children(context: SiteAdminContext): ReactNode;
}) {
  const { session, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [website, setWebsite] = useState<WebsiteResponse | null>(null);
  const [profile, setProfile] = useState<BusinessProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);

  // This console has its own door. A signed-out visitor goes to that site's
  // sign-in page, not the platform's, so the whole way in stays theirs.
  useEffect(() => {
    if (isLoading || session) return;
    router.replace(`/s/${slug}/login`);
  }, [isLoading, session, router, slug]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    websitesApi
      .listAccessible(session.accessToken)
      .then((all) => {
        if (cancelled) return;
        const match = all.find((w) => w.slug === slug);
        if (!match) {
          // A real session, but not for this business. Saying so plainly beats
          // a redirect loop or a bare 403 from the next request.
          setIsDenied(true);
          return;
        }
        setWebsite(match);
        return profileApi
          .get(session.accessToken, match.id)
          .then((fetched) => {
            if (!cancelled) setProfile(fetched);
          })
          .catch(() => undefined);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Could not open this website."));
      });
    return () => {
      cancelled = true;
    };
  }, [session, slug]);

  if (isLoading || !session) return null;

  if (isDenied) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-lg font-semibold tracking-tight">You don&apos;t have access to this website</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You are signed in as {session.email}. Ask the owner to invite you as a manager, or sign in with the account
          that owns it.
        </p>
        <div className="flex justify-center gap-3">
          <Link href={`/s/${slug}/login`} className="text-sm font-medium text-[var(--accent-solid)] hover:underline">
            Sign in with another account
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  const base = `/s/${slug}`;
  const sections = sectionsFor(website.templateType);
  const active = sections.find((item) => `${base}${item.href}` === pathname);

  return (
    <div className="flex flex-1 bg-surface-muted">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-black/[.08] bg-surface lg:flex dark:border-white/[.1]">
        <div className="flex items-center gap-3 px-5 py-5">
          {profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL; next/image would need a configured remote pattern per business
            <img src={profile.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
          ) : (
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-xs font-semibold text-white"
            >
              {initialsOf(website.businessName)}
            </span>
          )}
          <p className="min-w-0 truncate text-sm font-semibold">{website.businessName}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {sections.map((item) => {
            const href = `${base}${item.href}`;
            const isActive = pathname === href;
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-accent font-medium text-white"
                    : "text-zinc-600 hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
                }`}
              >
                <item.Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Setup lives elsewhere on purpose: it is the thing you do once. */}
        <div className="border-t border-black/[.08] px-3 py-3 dark:border-white/[.1]">
          <Link
            href={`/manage/${website.id}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
          >
            <SettingsIcon />
            Setup &amp; settings
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{active?.label ?? "Dashboard"}</h1>
            <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
              {active?.hint ?? website.businessName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {website.status === "PUBLISHED" && (
              <a
                href={`/site/${website.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-black/[.1] bg-surface px-4 py-2 text-sm transition-colors hover:bg-black/[.03] dark:border-white/[.14]"
              >
                View site ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push(`/s/${slug}/login`);
              }}
              className="rounded-full border border-black/[.1] bg-surface px-4 py-2 text-sm transition-colors hover:bg-black/[.03] dark:border-white/[.14]"
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
          {sections.map((item) => {
            const href = `${base}${item.href}`;
            const isActive = pathname === href;
            return (
              <Link
                key={item.href}
                href={href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                  isActive ? "bg-gradient-accent text-white" : "bg-surface text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 px-4 pb-10 sm:px-8">
          {children({ website, profile, accessToken: session.accessToken })}
        </main>
      </div>
    </div>
  );
}
