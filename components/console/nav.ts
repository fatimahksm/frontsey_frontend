import type { Permission } from "@/lib/api/types";
import type { WebsiteResponse } from "@/lib/api/types";
import {
  BillingIcon,
  BusinessIcon,
  DashboardIcon,
  DeliveryIcon,
  EventIcon,
  ExperienceIcon,
  GalleryIcon,
  MenuIcon,
  PeopleIcon,
  ProjectsIcon,
  ReportsIcon,
  SectionsIcon,
  ServicesIcon,
  ShareIcon,
  TemplateIcon,
  TextIcon,
  ThemeIcon,
} from "@/components/ui/icons";
import { parseDraftContent } from "@/lib/website/draft-content";
import { contentPlanFor, type ContentSection } from "@/lib/website/template-content";

/**
 * One sidebar for one website, shared by every route that shows it.
 *
 * There used to be two: a "setup area" at /manage/<id> and a "console" at
 * /s/<slug>, each with its own shell, its own icon vocabulary and its own
 * sidebar - listing mostly the same sections. Whatever the intended split, on
 * screen it read as two copies of the same console, and the one that offered
 * "Open dashboard" sent an already-signed-in owner to a second login page.
 *
 * So there is one list now, grouped by what the owner is actually doing:
 * what the site sells and says, how it looks, and the business behind it.
 */
export interface NavItem {
  /** Appended to /manage/<id>. "" is the overview. */
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  /** One line under the label, so nobody has to guess what a section holds. */
  hint: string;
  /** Hidden from a manager who was not granted it, mirroring what the server enforces. */
  permission?: Permission;
  /** Owner-only whatever the permissions say - billing and who else can sign in. */
  ownerOnly?: boolean;
  /** Included in the plan? A locked row still opens; the page explains why. */
  locked?: boolean;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const CONTENT_ICONS: Record<ContentSection["key"], (props: { className?: string }) => React.ReactElement> = {
  projects: ProjectsIcon,
  experience: ExperienceIcon,
  services: ServicesIcon,
  menu: MenuIcon,
  gallery: GalleryIcon,
  delivery: DeliveryIcon,
  sections: SectionsIcon,
  event: EventIcon,
};

/** Editing a content store needs the permission that governs it, not one blanket grant. */
const CONTENT_PERMISSIONS: Record<ContentSection["key"], Permission> = {
  projects: "MANAGE_THEME_AND_CONTENT",
  experience: "MANAGE_THEME_AND_CONTENT",
  services: "MANAGE_MENU",
  menu: "MANAGE_MENU",
  gallery: "MANAGE_THEME_AND_CONTENT",
  delivery: "MANAGE_DELIVERY_SETTINGS",
  sections: "MANAGE_THEME_AND_CONTENT",
  event: "MANAGE_THEME_AND_CONTENT",
};

export function navGroupsFor(website: WebsiteResponse, analyticsEnabled: boolean): NavGroup[] {
  // Section names and order come from the template's own plan, so the Services
  // template leads with Packages and the Brand one calls the same store
  // Products - and the sidebar, the page heading and the page's own title all
  // say the same word, which they did not.
  const plan = contentPlanFor(website.layoutVariant, parseDraftContent(website.draftContent).menuBusinessKind);

  return [
    {
      label: null,
      items: [{ href: "", label: "Overview", Icon: DashboardIcon, hint: "How your site is doing" }],
    },
    {
      label: "Content",
      items: [
        ...plan.sections.map((section) => ({
          href: `/${section.key}`,
          label: section.label,
          Icon: CONTENT_ICONS[section.key],
          hint: section.hint,
          permission: CONTENT_PERMISSIONS[section.key],
        })),
        {
          href: "/content",
          label: "Page content",
          Icon: TextIcon,
          hint: "Your tagline, and publishing",
          permission: "MANAGE_THEME_AND_CONTENT" as Permission,
        },
      ],
    },
    {
      label: "Design",
      items: [
        {
          href: "/layout",
          label: "Template",
          Icon: TemplateIcon,
          hint: "Which layout your site uses",
          permission: "MANAGE_THEME_AND_CONTENT" as Permission,
        },
        {
          href: "/theme",
          label: "Theme",
          Icon: ThemeIcon,
          hint: "Colours and fonts",
          permission: "MANAGE_THEME_AND_CONTENT" as Permission,
        },
      ],
    },
    {
      label: "Business",
      items: [
        {
          href: "/profile",
          label: "Business profile",
          Icon: BusinessIcon,
          hint: "Logo, photos, contact details",
          permission: "MANAGE_BUSINESS_PROFILE" as Permission,
        },
        { href: "/share", label: "Share & QR", Icon: ShareIcon, hint: "Your links and printable code" },
        {
          href: "/analytics",
          label: "Reports",
          Icon: ReportsIcon,
          hint: "Visitor numbers",
          permission: "VIEW_ANALYTICS" as Permission,
          locked: !analyticsEnabled,
        },
        { href: "/managers", label: "People", Icon: PeopleIcon, hint: "Who else can sign in here", ownerOnly: true },
        {
          href: "/subscription",
          label: "Plan & billing",
          Icon: BillingIcon,
          hint: "Your plan and renewal",
          ownerOnly: true,
        },
      ],
    },
  ];
}

/** A manager sees only what they were granted; role null means the request came back without one, which only happens for an owner. */
export function visibleFor(
  groups: NavGroup[],
  website: WebsiteResponse,
  hasPermission: (website: WebsiteResponse, permission: Permission) => boolean,
): NavGroup[] {
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

/** The open page's own entry, so the header can name it and say what it is for. */
export function activeItem(groups: NavGroup[], base: string, pathname: string): NavItem | null {
  const all = groups.flatMap((group) => group.items);
  // Longest match wins, so /manage/<id>/menu/items/new stays on Menu rather
  // than falling back to the overview, whose href is "".
  return (
    all
      .filter((item) => pathname === `${base}${item.href}` || pathname.startsWith(`${base}${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null
  );
}
