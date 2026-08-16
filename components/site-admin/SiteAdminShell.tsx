"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  BillingIcon,
  BusinessIcon,
  DashboardIcon,
  DeliveryIcon,
  GalleryIcon,
  MenuIcon,
  PeopleIcon,
  ProjectsIcon,
  ReportsIcon,
  SearchIcon,
  SectionsIcon,
  ServicesIcon,
  SettingsIcon,
  ShareIcon,
  TemplateIcon,
  TextIcon,
  ThemeIcon,
} from "@/components/site-admin/icons";
import { Alert } from "@/components/ui/Alert";
import { friendlyMessage } from "@/lib/api/client";
import { profileApi } from "@/lib/api/profile";
import { websitesApi } from "@/lib/api/websites";
import type { BusinessProfileResponse, WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { contentPlanFor, type ContentSection } from "@/lib/website/template-content";

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
  /** Owner-only, mirroring what the server enforces. */
  ownerOnly?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

/**
 * Everything an owner can change, grouped, in this template's own vocabulary.
 *
 * The console used to hold only the day-to-day content and send anyone wanting
 * a new logo or a different colour back to the setup area - which meant the
 * place they visit weekly could not change their own logo. Setup is the wizard
 * you run once; this is the whole back office, so every editor lives here.
 *
 * Content section names and order come from the template's plan, so the Services
 * template leads with Packages and Brand calls the same store Products.
 */
const ICONS: Record<ContentSection["key"], (props: { className?: string }) => React.ReactElement> = {
  projects: ProjectsIcon,
  services: ServicesIcon,
  menu: MenuIcon,
  gallery: GalleryIcon,
  delivery: DeliveryIcon,
  sections: SectionsIcon,
};

function navGroupsFor(website: WebsiteResponse): NavGroup[] {
  return [
    {
      label: null,
      items: [{ href: "", label: "Dashboard", Icon: DashboardIcon, hint: "How your site is doing" }],
    },
    {
      label: "Content",
      items: [
        ...contentPlanFor(website.layoutVariant).sections.map((section) => ({
          href: `/${section.key}`,
          label: section.label,
          Icon: ICONS[section.key],
          hint: section.hint,
        })),
        { href: "/content", label: "Page content", Icon: TextIcon, hint: "Your tagline, and publishing" },
      ],
    },
    {
      label: "Design",
      items: [
        { href: "/layout", label: "Template", Icon: TemplateIcon, hint: "The overall look and arrangement" },
        { href: "/theme", label: "Theme", Icon: ThemeIcon, hint: "Colours and fonts" },
      ],
    },
    {
      label: "Business",
      items: [
        { href: "/profile", label: "Business profile", Icon: BusinessIcon, hint: "Logo, photos, contact details" },
        { href: "/share", label: "Share & QR", Icon: ShareIcon, hint: "Your links and printable code" },
        { href: "/seo", label: "Search & sharing", Icon: SearchIcon, hint: "How your site looks on Google" },
      ],
    },
    {
      label: null,
      items: [
        { href: "/analytics", label: "Reports", Icon: ReportsIcon, hint: "Full visitor numbers" },
        { href: "/managers", label: "People", Icon: PeopleIcon, hint: "Who else can sign in here", ownerOnly: true },
        { href: "/subscription", label: "Plan & billing", Icon: BillingIcon, hint: "Your plan and renewal", ownerOnly: true },
      ],
    },
  ];
}

function visibleFor(groups: NavGroup[], website: WebsiteResponse): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.ownerOnly || website.role === "OWNER" || website.role === null),
    }))
    .filter((group) => group.items.length > 0);
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
  const groups = visibleFor(navGroupsFor(website), website);
  const sections = groups.flatMap((group) => group.items);
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

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2">
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
              {group.label && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
            </div>
          ))}
        </nav>

        {/* The guided wizard, only while there is still a reason to run it. A
            finished site has no use for it, and every editor it walks through
            is already in the groups above. */}
        {website.status === "DRAFT" && (
          <div className="border-t border-black/[.08] px-3 py-3 dark:border-white/[.1]">
            <Link
              href={`/manage/${website.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]"
            >
              <SettingsIcon />
              Guided setup
            </Link>
          </div>
        )}
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
