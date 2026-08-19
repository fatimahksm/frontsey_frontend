import type { Metadata } from "next";

import { SiteLoginForm } from "@/app/s/[slug]/login/SiteLoginForm";
import { config } from "@/lib/config";

interface Props {
  params: Promise<{ slug: string }>;
}

async function businessName(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.apiPrefix}/public/websites/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: { website?: { businessName?: string } | null } | null };
    return body.data?.website?.businessName ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = await businessName(slug);
  return { title: name ? `${name} - Sign in` : "Sign in" };
}

/**
 * The door to one business's admin console.
 *
 * Separate from the platform's own /login on purpose: this is the link an
 * owner bookmarks and hands to a manager, and nothing on it should belong to
 * anybody else. It authenticates against the same accounts - a manager is
 * already a real account with permissions on this website - but it checks
 * afterwards that the account actually has access to *this* site, and sends
 * them into this console rather than a list of everything they can reach.
 */
export default async function SiteLoginPage({ params }: Props) {
  const { slug } = await params;
  return <SiteLoginForm slug={slug} />;
}
