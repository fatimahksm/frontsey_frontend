"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import type { WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

export default function WebsitesPage() {
  const { session } = useAuth();
  const [websites, setWebsites] = useState<WebsiteResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    websitesApi
      .listMine(session.accessToken)
      .then(setWebsites)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your websites."));
  }, [session]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Websites</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Every business website tied to your account, in one place.
          </p>
        </div>
        {websites !== null && websites.length > 0 && (
          <Link href="/dashboard/websites/new">
            <Button className="w-auto px-5">Create website</Button>
          </Link>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {websites === null && !error && <p className="text-sm text-zinc-500">Loading…</p>}

      {websites !== null && websites.length === 0 && (
        <Reveal className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-black/[.12] bg-surface-muted px-6 py-24 text-center dark:border-white/[.18]">
          <div
            aria-hidden
            className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent text-3xl shadow-lift"
          >
            🚀
          </div>
          <div>
            <h2 className="text-lg font-semibold">Build your first website</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Choose a menu-ordering or portfolio template, add your content, and publish - all in a few minutes.
            </p>
          </div>
          <Link href="/dashboard/websites/new">
            <Button className="w-auto px-6">Create your first website</Button>
          </Link>
        </Reveal>
      )}

      {session && (
        <StaggerGroup as="ul" className="flex flex-col gap-4">
          {websites?.map((website) => (
            <StaggerItem as="li" key={website.id} className="list-none">
              <WebsiteCard website={website} accessToken={session.accessToken} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
