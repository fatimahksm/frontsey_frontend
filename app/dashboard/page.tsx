"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
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
          <h1 className="text-xl font-semibold tracking-tight">Your websites</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage every business website tied to your account.
          </p>
        </div>
        <Link href="/dashboard/websites/new">
          <Button className="w-auto px-5">Create website</Button>
        </Link>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {websites === null && !error && <p className="text-sm text-zinc-500">Loading…</p>}

      {websites !== null && websites.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/[.12] p-10 text-center dark:border-white/[.18]">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven&apos;t created a website yet.
          </p>
          <Link href="/dashboard/websites/new" className="mt-4 inline-block">
            <Button className="w-auto px-5">Create your first website</Button>
          </Link>
        </div>
      )}

      <StaggerGroup as="ul" className="flex flex-col gap-3">
        {websites?.map((website) => (
          <StaggerItem as="li" key={website.id}>
            <Link
              href={`/dashboard/websites/${website.id}`}
              className="flex items-center justify-between rounded-2xl border border-black/[.08] bg-surface p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift dark:border-white/[.1]"
            >
              <div>
                <p className="font-medium">{website.businessName}</p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">/{website.slug}</p>
              </div>
              <WebsiteStatusBadge status={website.status} />
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
