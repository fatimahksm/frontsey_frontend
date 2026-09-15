"use client";

import { PageFrame } from "@/components/ui/PageFrame";
import Link from "next/link";
import { useEffect, useState } from "react";

import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { NewSiteIcon } from "@/components/ui/icons";
import { friendlyMessage } from "@/lib/api/client";
import { managerInvitationsApi } from "@/lib/api/managerInvitations";
import { websitesApi } from "@/lib/api/websites";
import type { WebsiteResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

export default function WebsitesPage() {
  const { session } = useAuth();
  const [websites, setWebsites] = useState<WebsiteResponse[] | null>(null);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    websitesApi
      .listAccessible(session.accessToken)
      .then(setWebsites)
      .catch((err) => setError(friendlyMessage(err, "Failed to load your websites.")));
    managerInvitationsApi
      .list(session.accessToken)
      .then((invitations) => setPendingInvitationCount(invitations.length))
      .catch(() => setPendingInvitationCount(0));
  }, [session]);

  return (
    <PageFrame>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">My Websites</h1>
          <p className="mt-1 text-sm text-muted">
            Every business website you own or help manage, in one place.
          </p>
        </div>
        {websites !== null && websites.length > 0 && (
          <Link href="/dashboard/websites/new">
            <Button>Create website</Button>
          </Link>
        )}
      </div>

      {pendingInvitationCount > 0 && (
        <Alert tone="info">
          You have {pendingInvitationCount} pending manager invitation{pendingInvitationCount > 1 ? "s" : ""}.{" "}
          <Link href="/dashboard/invitations" className="font-medium underline">
            Review invitations →
          </Link>
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {websites === null && !error && <p className="text-sm text-muted">Loading…</p>}

      {websites !== null && websites.length === 0 && (
        <Reveal className="mt-6 flex flex-col items-center gap-4 rounded-card border border-dashed border-line-strong bg-surface-muted px-6 py-20 text-center">
          <div
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-card bg-accent-quiet text-accent-ink"
          >
            <NewSiteIcon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Build your first website</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Choose a menu-ordering or portfolio template, add your content, and publish - all in a few minutes.
            </p>
          </div>
          <Link href="/dashboard/websites/new">
            <Button>Create your first website</Button>
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
    </PageFrame>
  );
}
