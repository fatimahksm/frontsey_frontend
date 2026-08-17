"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { use } from "react";

import { SiteAdminShell, type SiteAdminContext } from "@/components/site-admin/SiteAdminShell";
import AnalyticsPage from "@/app/manage/[websiteId]/analytics/page";
import PageContentPage from "@/app/manage/[websiteId]/content/page";
import DeliveryPage from "@/app/manage/[websiteId]/delivery/page";
import GalleryPage from "@/app/manage/[websiteId]/gallery/page";
import ManagersPage from "@/app/manage/[websiteId]/managers/page";
import MenuPage from "@/app/manage/[websiteId]/menu/page";
import ProfilePage from "@/app/manage/[websiteId]/profile/page";
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
 * list kept here - so a portfolio has no menu, and the Elegant menu layout has
 * only a menu. Asking for one this template does not have opens the console
 * and says so, rather than an editor saving into a store the site never
 * renders, and rather than a dead end.
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
 * rebuilding it. There is no route to them here, not just no link. (SEO is
 * absent from both surfaces now - the whole editor is gone.)
 */
const ALWAYS_AVAILABLE = new Set<EditorKey>([
  "content",
  "profile",
  "share",
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
  // An unknown section goes back to the console rather than to a 404. The
  // sections a console shows depend on the template, so a link that was valid
  // on one website is not on another - and a bookmark from before a change
  // should land somewhere useful, not on "this page could not be found".
  if (!(section in EDITORS)) redirect(`/s/${slug}`);
  return (
    <SiteAdminShell slug={slug}>
      {(context) => <Section context={context} section={section as EditorKey} />}
    </SiteAdminShell>
  );
}
