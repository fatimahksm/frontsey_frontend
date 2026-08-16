"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { SiteAdminShell, type SiteAdminContext } from "@/components/site-admin/SiteAdminShell";
import AnalyticsPage from "@/app/manage/[websiteId]/analytics/page";
import DeliveryPage from "@/app/manage/[websiteId]/delivery/page";
import GalleryPage from "@/app/manage/[websiteId]/gallery/page";
import MenuPage from "@/app/manage/[websiteId]/menu/page";
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
  analytics: AnalyticsPage,
} as const;

type EditorKey = keyof typeof EDITORS;

function Section({ context, section }: { context: SiteAdminContext; section: EditorKey }) {
  const allowed =
    section === "analytics" ||
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
    <WebsiteProvider websiteId={context.website.id} accessToken={context.accessToken} initialWebsite={context.website}>
      <Component />
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
