"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AccountStatus, AccountSummaryResponse, Role } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";

const ROLES: Role[] = ["BUSINESS_OWNER", "MANAGER", "SUPER_ADMIN"];

const STATUS_TONE: Record<AccountStatus, "neutral" | "success" | "warning" | "danger"> = {
  PENDING_VERIFICATION: "warning",
  ACTIVE: "success",
  DISABLED_PENDING_DELETION: "warning",
  DELETED: "danger",
};

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AccountSummaryResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    setUsers(await adminApi.listUsers(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load().catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load users."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleRoleChange(accountId: string, role: Role) {
    if (!session) return;
    setError(null);
    setBusyId(accountId);
    try {
      await adminApi.updateUserRole(session.accessToken, accountId, { role });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update role.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDisable(accountId: string) {
    if (!session) return;
    setError(null);
    setBusyId(accountId);
    try {
      await adminApi.disableUser(session.accessToken, accountId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to disable account.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReactivate(accountId: string) {
    if (!session) return;
    setError(null);
    setBusyId(accountId);
    try {
      await adminApi.reactivateUser(session.accessToken, accountId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reactivate account.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Users</h1>
      {error && <Alert tone="error">{error}</Alert>}
      <Card>
        {users === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-2">
            {users.map((user) => (
              <StaggerItem
                as="li"
                key={user.id}
                className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.fullName ?? "-"} · {user.role} · joined {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!user.emailVerified && <Badge tone="warning">Unverified</Badge>}
                  <Badge tone={STATUS_TONE[user.status]}>{user.status.replace(/_/g, " ")}</Badge>
                  <select
                    aria-label="Role"
                    value={user.role}
                    disabled={busyId === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    className="h-8 rounded-lg border border-black/[.12] bg-surface px-2 text-xs outline-none disabled:opacity-50 dark:border-white/[.16]"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {user.status === "DISABLED_PENDING_DELETION" ? (
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      className="text-xs font-medium hover:underline disabled:opacity-50"
                      onClick={() => handleReactivate(user.id)}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      onClick={() => handleDisable(user.id)}
                    >
                      Disable
                    </button>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Card>
    </div>
  );
}
