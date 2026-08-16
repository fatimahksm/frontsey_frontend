"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { SiteAdminShell, type SiteAdminContext } from "@/components/site-admin/SiteAdminShell";
import AnalyticsPage from "@/app/manage/[websiteId]/analytics/page";
import PageContentPage from "@/app/manage/[websiteId]/content/page";
import DeliveryPage from "@/app/manage/[websiteId]/delivery/page";
import GalleryPage from "@/app/manage/[websiteId]/gallery/page";
import ManagersPage from "@/app/manage/[websiteId]/managers/page";
import MenuPage from "@/app/manage/[websiteId]/menu/page";
import ProfilePage from "@/app/manage/[websiteId]/profile/page";
import SeoPage from "@/app/manage/[websiteId]/seo/page";
import SharePage from "@/app/manage/[websiteId]/share/page";
import SubscriptionPage from "@/app/manage/[websiteId]/subscription/page";
import ProjectsPage from "@/app/manage/[websiteId]/projects/page";
import SectionsPage from "@/app/manage/[websiteId]/sections/page";
import ServicesPage from "@/app/manage/[websiteId]/services/page";
import { contentPlanFor } from "@/lib/website/template-content";
import { WebsiteProvider } from "@/lib/website/website-context";

/**
 * The console's working sections.
 *
 * They mount the same editors the setup area uses rather than a second copy:
 * one Projects screen, one Menu screen, reachable from wherever an owner
 * happens to be. Only the frame around them differs.
 *
 * Which sections exist comes from the template's own content plan, not from a
 * list kept here - so a portfolio has no menu, the Elegant menu layout has only
 * a menu, and asking for anything else is a 404 rather than an editor saving
 * into a store the site never renders.
 */
const EDITORS = {
  projects: ProjectsPage,
  services: ServicesPage,
  menu: MenuPage,
  delivery: DeliveryPage,
  gallery: GalleryPage,
  sections: SectionsPage,
  content: PageContentPage,
  profile: ProfilePage,
  share: SharePage,
  seo: SeoPage,
  managers: ManagersPage,
  subscription: SubscriptionPage,
  analytics: AnalyticsPage,
} as const;

type EditorKey = keyof typeof EDITORS;

/**
 * Editors that exist for every website, whatever its template - the ones the
 * content plan does not speak for. Only the content stores vary by template.
 *
 * Template and theme are absent on purpose: they are first-build decisions,
 * made once in setup, and the console is for running the site rather than
 * rebuilding it. There is no route to them here, not just no link.
 */
const ALWAYS_AVAILABLE = new Set<EditorKey>([
  "content",
  "profile",
  "share",
  "seo",
  "managers",
  "subscription",
  "analytics",
]);

function Section({ context, section }: { context: SiteAdminContext; section: EditorKey }) {
  const allowed =
    ALWAYS_AVAILABLE.has(section) ||
    contentPlanFor(context.website.layoutVariant).sections.some((entry) => entry.key === section);
  if (!allowed) {
    return (
      <div className="rounded-2xl border border-black/[.07] bg-surface p-8 text-center dark:border-white/[.09]">
        <p className="text-sm font-medium">This section isn&apos;t part of this kind of website.</p>
        <Link href={`/s/${context.website.slug}`} className="mt-2 inline-block text-sm text-[var(--accent-solid)] hover:underline">
          Back to the dashboard
        </Link>
      </div>
    );
  }
  const Component = EDITORS[section];
  return (
    // The console's own header already names the section, and every editor
    // opens with the same name as its own h1. Kept for screen readers, hidden
    // for eyes - two identical titles stacked is the tell of a page embedded
    // somewhere it was not designed for.
    <WebsiteProvider websiteId={context.website.id} accessToken={context.accessToken} initialWebsite={context.website}>
      <div className="[&>div>div>h1]:sr-only [&>div>h1]:sr-only">
        <Component />
      </div>
    </WebsiteProvider>
  );
}

export default function SiteAdminSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = use(params);
  if (!(section in EDITORS)) notFound();
  return (
    <SiteAdminShell slug={slug}>
      {(context) => <Section context={context} section={section as EditorKey} />}
    </SiteAdminShell>
  );
}
