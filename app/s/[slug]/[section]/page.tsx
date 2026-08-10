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
import ServicesPage from "@/app/manage/[websiteId]/services/page";
import { WebsiteProvider } from "@/lib/website/website-context";

/**
 * The console's working sections.
 *
 * They mount the same editors the setup area uses rather than a second copy:
 * one Projects screen, one Menu screen, reachable from wherever an owner
 * happens to be. Only the frame around them differs - here it is the business's
 * console, there it is the setup flow.
 *
 * Which sections exist depends on the website's type, and the map is checked
 * against it: a portfolio has no menu, and asking for one should be a 404
 * rather than an editor saving into a table its site never renders.
 */
const SECTIONS = {
  projects: { component: ProjectsPage, templateType: "PORTFOLIO" },
  services: { component: ServicesPage, templateType: "PORTFOLIO" },
  menu: { component: MenuPage, templateType: "MENU_ORDERING" },
  delivery: { component: DeliveryPage, templateType: "MENU_ORDERING" },
  gallery: { component: GalleryPage, templateType: null },
  analytics: { component: AnalyticsPage, templateType: null },
} as const;

function Section({ context, section }: { context: SiteAdminContext; section: keyof typeof SECTIONS }) {
  const entry = SECTIONS[section];
  if (entry.templateType && entry.templateType !== context.website.templateType) {
    return (
      <div className="rounded-2xl border border-black/[.07] bg-surface p-8 text-center dark:border-white/[.09]">
        <p className="text-sm font-medium">This section isn&apos;t part of this kind of website.</p>
        <Link href={`/s/${context.website.slug}`} className="mt-2 inline-block text-sm text-[var(--accent-solid)] hover:underline">
          Back to the dashboard
        </Link>
      </div>
    );
  }
  const Component = entry.component;
  return (
    <WebsiteProvider websiteId={context.website.id} accessToken={context.accessToken} initialWebsite={context.website}>
      <Component />
    </WebsiteProvider>
  );
}

export default function SiteAdminSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = use(params);
  if (!(section in SECTIONS)) notFound();
  return (
    <SiteAdminShell slug={slug}>
      {(context) => <Section context={context} section={section as keyof typeof SECTIONS} />}
    </SiteAdminShell>
  );
}
