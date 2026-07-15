"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { managersApi } from "@/lib/api/managers";
import type { ManagerAccessResponse, Permission } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

// MANAGE_PRICES is a defined enum value the backend never actually checks
// anywhere, so it's left out of the picker rather than offering a toggle
// that does nothing.
const PERMISSIONS: { value: Permission; label: string }[] = [
  { value: "MANAGE_MENU", label: "Manage menu" },
  { value: "MANAGE_THEME_AND_CONTENT", label: "Manage theme & content" },
  { value: "VIEW_ANALYTICS", label: "View analytics" },
  { value: "PUBLISH_WEBSITE", label: "Publish website" },
  { value: "MANAGE_BUSINESS_PROFILE", label: "Manage business profile" },
  { value: "MANAGE_DELIVERY_SETTINGS", label: "Manage delivery settings" },
];

const STATUS_TONE = { ACCEPTED: "success", PENDING: "warning", REVOKED: "danger" } as const;

export default function ManagersPage() {
  const { website, accessToken } = useWebsite();
  const [managers, setManagers] = useState<ManagerAccessResponse[]>([]);
  const [email, setEmail] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<Set<Permission>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setManagers(await managersApi.list(accessToken, website.id));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load managers."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || invitePermissions.size === 0) return;
    setError(null);
    setIsBusy(true);
    try {
      await managersApi.invite(accessToken, website.id, { email: email.trim(), permissions: [...invitePermissions] });
      setEmail("");
      setInvitePermissions(new Set());
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send invitation.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTogglePermission(manager: ManagerAccessResponse, permission: Permission) {
    const next = new Set(manager.permissions);
    if (next.has(permission)) next.delete(permission);
    else next.add(permission);
    setError(null);
    setIsBusy(true);
    try {
      await managersApi.updatePermissions(accessToken, website.id, manager.id, [...next]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update permissions.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await managersApi.revoke(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke access.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Managers</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Team">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-3">
            {managers.map((manager) => (
              <StaggerItem as="li" key={manager.id} className="rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{manager.invitedEmail}</span>
                    <Badge tone={STATUS_TONE[manager.status]}>{manager.status}</Badge>
                  </div>
                  {manager.status !== "REVOKED" && (
                    <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRevoke(manager.id)}>
                      Revoke
                    </button>
                  )}
                </div>
                {manager.status !== "REVOKED" && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {PERMISSIONS.map((p) => (
                      <Checkbox
                        key={p.value}
                        id={`${manager.id}-${p.value}`}
                        label={p.label}
                        checked={manager.permissions.includes(p.value)}
                        onChange={() => handleTogglePermission(manager, p.value)}
                      />
                    ))}
                  </div>
                )}
              </StaggerItem>
            ))}
            {managers.length === 0 && <p className="text-sm text-zinc-500">No managers invited yet.</p>}
          </StaggerGroup>
        )}
      </Card>

      <Card title="Invite a manager">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <TextField id="inviteEmail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex flex-wrap gap-3">
            {PERMISSIONS.map((p) => (
              <Checkbox
                key={p.value}
                id={`invite-${p.value}`}
                label={p.label}
                checked={invitePermissions.has(p.value)}
                onChange={(e) =>
                  setInvitePermissions((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(p.value);
                    else next.delete(p.value);
                    return next;
                  })
                }
              />
            ))}
          </div>
          <Button type="submit" isLoading={isBusy} className="w-auto px-5" disabled={invitePermissions.size === 0}>
            Send invitation
          </Button>
        </form>
      </Card>
    </div>
  );
}
