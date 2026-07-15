"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminWebsiteSummaryResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminWebsitesPage() {
  const { session } = useAuth();
  const [websites, setWebsites] = useState<AdminWebsiteSummaryResponse[]>([]);
  const [suspending, setSuspending] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [reactivateAt, setReactivateAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    if (!session) return;
    setWebsites(await adminApi.listWebsites(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load websites."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleSuspend(id: string) {
    if (!session || !reason.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.suspendWebsite(session.accessToken, id, {
        reason: reason.trim(),
        permanent,
        reactivateAt: permanent || !reactivateAt ? null : new Date(reactivateAt).toISOString(),
      });
      setSuspending(null);
      setReason("");
      setReactivateAt("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to suspend website.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleReactivate(id: string) {
    if (!session) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.reactivateWebsite(session.accessToken, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reactivate website.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Websites</h1>
      {error && <Alert tone="error">{error}</Alert>}
      <Card>
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {websites.map((website) => (
              <li key={website.id} className="rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{website.businessName}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      /{website.slug} · owner {website.ownerEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <WebsiteStatusBadge status={website.status} />
                    {website.status === "SUSPENDED_TEMPORARY" || website.status === "SUSPENDED_PERMANENT" ? (
                      <button type="button" className="text-xs font-medium hover:underline" onClick={() => handleReactivate(website.id)}>
                        Reactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => setSuspending(suspending === website.id ? null : website.id)}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>

                {website.suspensionReason && (
                  <p className="mt-1 text-xs text-zinc-500">Suspended: {website.suspensionReason}</p>
                )}

                {suspending === website.id && (
                  <div className="mt-3 flex flex-col gap-2 rounded-lg bg-black/[.03] p-3 dark:bg-white/[.05]">
                    <TextField id={`reason-${website.id}`} label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <Checkbox id={`permanent-${website.id}`} label="Permanent" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />
                    {!permanent && (
                      <label htmlFor={`reactivateAt-${website.id}`} className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">Reactivate at (optional)</span>
                        <input
                          id={`reactivateAt-${website.id}`}
                          type="datetime-local"
                          value={reactivateAt}
                          onChange={(e) => setReactivateAt(e.target.value)}
                          className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
                        />
                      </label>
                    )}
                    <Button className="w-auto px-3" onClick={() => handleSuspend(website.id)} isLoading={isBusy} disabled={!reason.trim()}>
                      Confirm suspend
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
