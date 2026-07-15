"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AccountStatus, AccountSummaryResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";

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

  useEffect(() => {
    if (!session) return;
    adminApi
      .listUsers(session.accessToken)
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load users."));
  }, [session]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Users</h1>
      {error && <Alert tone="error">{error}</Alert>}
      <Card>
        {users === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.fullName ?? "-"} · {user.role} · joined {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!user.emailVerified && <Badge tone="warning">Unverified</Badge>}
                  <Badge tone={STATUS_TONE[user.status]}>{user.status.replace(/_/g, " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
