import type { Metadata } from "next";
import type { ReactNode } from "react";

import { config } from "@/lib/config";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * A business's own admin console.
 *
 * The tab carries their name, resolved on the server from the public endpoint -
 * the same reason the branded sign-in does it there: metadata streams in after
 * the page commits, so assigning document.title from an effect is overwritten.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.apiPrefix}/public/websites/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!response.ok) return { title: "Admin" };
    const body = (await response.json()) as { data?: { website?: { businessName?: string } | null } | null };
    const name = body.data?.website?.businessName;
    return { title: name ? `${name} - Admin` : "Admin" };
  } catch {
    return { title: "Admin" };
  }
}

export default function SiteAdminLayout({ children }: Props) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
