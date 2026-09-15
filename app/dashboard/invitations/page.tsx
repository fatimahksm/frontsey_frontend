"use client";

import { PageFrame } from "@/components/ui/PageFrame";
import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { friendlyMessage } from "@/lib/api/client";
import { managerInvitationsApi } from "@/lib/api/managerInvitations";
import type { ManagerInvitationResponse, Permission } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_MENU: "Manage menu",
  MANAGE_PRICES: "Manage prices",
  MANAGE_THEME_AND_CONTENT: "Manage theme & content",
  VIEW_ANALYTICS: "View analytics",
  PUBLISH_WEBSITE: "Publish website",
  MANAGE_BUSINESS_PROFILE: "Manage business profile",
  MANAGE_DELIVERY_SETTINGS: "Manage delivery settings",
};

/** Phase 4 (BR-MGR-008): the invited person explicitly accepts or declines - never automatic. */
export default function InvitationsPage() {
  const { session } = useAuth();
  const [invitations, setInvitations] = useState<ManagerInvitationResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    setInvitations(await managerInvitationsApi.list(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load().catch((err) => setError(friendlyMessage(err, "Failed to load invitations.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleAccept(id: string) {
    if (!session) return;
    setError(null);
    setBusyId(id);
    try {
      await managerInvitationsApi.accept(session.accessToken, id);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to accept invitation."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    if (!session) return;
    setError(null);
    setBusyId(id);
    try {
      await managerInvitationsApi.reject(session.accessToken, id);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to decline invitation."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageFrame width="form">
      <h1 className="text-xl font-semibold tracking-tight">Invitations</h1>
      <p className="mt-1 text-sm text-muted">
        Websites you&apos;ve been invited to help manage. Accept to get access, or decline if it&apos;s not for you.
      </p>

      {error && (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="mt-6">
        <Card>
          {invitations === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted">You have no pending invitations right now.</p>
          ) : (
            <StaggerGroup as="ul" className="flex flex-col gap-3">
              {invitations.map((invitation) => (
                <StaggerItem
                  as="li"
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{invitation.businessName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {invitation.permissions.map((p) => PERMISSION_LABELS[p]).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
 
                      isLoading={busyId === invitation.id}
                      onClick={() => handleAccept(invitation.id)}
                    >
                      Accept
                    </Button>
                    <Button
 variant="secondary"
                      
                      isLoading={busyId === invitation.id}
                      onClick={() => handleReject(invitation.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </Card>
      </div>
    </PageFrame>
  );
}
