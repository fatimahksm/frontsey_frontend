import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/LoginForm";
import { config } from "@/lib/config";

interface Props {
  searchParams: Promise<{ site?: string }>;
}

/**
 * The tab title, resolved on the server.
 *
 * `document.title` from an effect does not survive here: metadata streams in
 * after the page renders and overwrites it, so a business signing in to their
 * own console watched the tab flip back to the platform's name. Metadata is
 * server-only (see next/dist/docs .../generate-metadata.md), which is why the
 * form below lives in its own client module.
 *
 * The lookup is the public, unauthenticated endpoint - the person reading this
 * page has not signed in yet - and any failure simply falls back to the
 * platform title rather than blocking the page.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { site } = await searchParams;
  if (!site) return { title: "Log in - Frontsey" };
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.apiPrefix}/public/websites/${encodeURIComponent(site)}`, {
      cache: "no-store",
    });
    if (!response.ok) return { title: "Log in" };
    const body = (await response.json()) as { data?: { website?: { businessName?: string } | null } | null };
    const name = body.data?.website?.businessName;
    return { title: name ? `${name} - Log in` : "Log in" };
  } catch {
    return { title: "Log in" };
  }
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
