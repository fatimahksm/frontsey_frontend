"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { SupportTicketResponse, SupportTicketStatus } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDateTime } from "@/lib/format";

const STATUS_TONE = { OPEN: "warning", IN_PROGRESS: "neutral", RESOLVED: "success" } as const;
const STATUSES: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export default function AdminSupportPage() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!session) return;
    setTickets(await adminApi.listSupportTickets(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load support tickets."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleStatusChange(ticketId: string, status: SupportTicketStatus) {
    if (!session) return;
    setError(null);
    try {
      await adminApi.updateSupportTicketStatus(session.accessToken, ticketId, status);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update ticket status.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Support tickets</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-zinc-500">No tickets.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-zinc-500">
                      {ticket.category.replace(/_/g, " ")} · {formatDateTime(ticket.createdAt)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{ticket.message}</p>
                <div className="mt-2 w-48">
                  <Select
                    id={`status-${ticket.id}`}
                    label="Status"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value as SupportTicketStatus)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
