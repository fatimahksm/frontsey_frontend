"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { AuditLogResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";

export default function AdminAuditLogPage() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<AuditLogResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    adminApi
      .listAuditLogs(session.accessToken)
      .then(setLogs)
      .catch((err) => setError(friendlyMessage(err, "Failed to load the audit log.")));
  }, [session]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Every significant platform action - suspensions, plan changes, publishes, account changes.
        </p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Card>
        {logs === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-zinc-500">No audit entries yet.</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-2">
            {logs.map((log) => (
              <StaggerItem
                as="li"
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]"
              >
                <div className="min-w-0">
                  <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {log.actorEmail ?? log.actorAccountId}
                    {log.targetId && ` · target ${log.targetId}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">{formatDate(log.createdAt)}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Card>
    </div>
  );
}
