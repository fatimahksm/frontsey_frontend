"use client";

import { useEffect, useMemo, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { AdminWebsiteSummaryResponse, SubscriptionStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Every website on the platform, with the person behind it.
 *
 * The old page listed a name, a slug and an owner's email, which meant an
 * admin deciding whether to block a site had to go elsewhere for everything
 * that decision actually turns on: who this is, how many sites they run,
 * whether they are paying, and how to reach them first. All of that is on the
 * row now, and blocking is one button with the reason attached.
 *
 * There is deliberately no "create website" here. That belongs to owners, in
 * their own dashboard - an admin oversees businesses rather than opening them.
 */

const PLAN_TONE: Record<SubscriptionStatus, "success" | "warning" | "danger" | "neutral"> = {
  TRIAL: "success",
  ACTIVE: "success",
  GRACE: "warning",
  PENDING: "warning",
  EXPIRED: "danger",
  CANCELED: "danger",
};

const PLAN_LABEL: Record<SubscriptionStatus, string> = {
  TRIAL: "Free trial",
  ACTIVE: "Active",
  GRACE: "Grace period",
  PENDING: "Awaiting payment",
  EXPIRED: "Expired",
  CANCELED: "Canceled",
};

function isBlocked(site: AdminWebsiteSummaryResponse): boolean {
  return site.status === "SUSPENDED_TEMPORARY" || site.status === "SUSPENDED_PERMANENT";
}

/** Digits only, so a number typed with spaces or dashes still dials and opens WhatsApp. */
function dialable(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export default function AdminWebsitesPage() {
  const { session } = useAuth();
  const [websites, setWebsites] = useState<AdminWebsiteSummaryResponse[]>([]);
  const [query, setQuery] = useState("");
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [blocking, setBlocking] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [reactivateAt, setReactivateAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
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
      .catch((err) => setError(friendlyMessage(err, "Failed to load websites.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // One box that searches the things an admin actually arrives with: a business
  // name, a link somebody sent them, or an owner's email or phone number.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return websites.filter((site) => {
      if (onlyBlocked && !isBlocked(site)) return false;
      if (!needle) return true;
      return [site.businessName, site.slug, site.ownerEmail, site.ownerName, site.ownerPhone]
        .some((field) => field?.toLowerCase().includes(needle));
    });
  }, [websites, query, onlyBlocked]);

  const blockedCount = websites.filter(isBlocked).length;

  async function handleBlock(id: string) {
    if (!session || !reason.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.suspendWebsite(session.accessToken, id, {
        reason: reason.trim(),
        permanent,
        reactivateAt: permanent || !reactivateAt ? null : new Date(reactivateAt).toISOString(),
      });
      setBlocking(null);
      setReason("");
      setReactivateAt("");
      setPermanent(false);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to block this website."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUnblock(id: string) {
    if (!session) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.reactivateWebsite(session.accessToken, id);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to unblock this website."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!session || !editName.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.updateWebsite(session.accessToken, id, { businessName: editName.trim() });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update website."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string, businessName: string) {
    if (!session) return;
    if (!window.confirm(`Permanently delete "${businessName}"? This cannot be undone.`)) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.deleteWebsite(session.accessToken, id);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to delete website."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {websites.length} website{websites.length === 1 ? "" : "s"} on the platform
            {blockedCount > 0 && <> · {blockedCount} blocked</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, link, email or phone…"
            className="h-10 w-72 rounded-xl border border-black/[.12] bg-surface px-3.5 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.18]"
          />
          <Checkbox id="onlyBlocked" label="Blocked only" checked={onlyBlocked} onChange={(e) => setOnlyBlocked(e.target.checked)} />
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/[.12] p-8 text-center text-sm text-zinc-500 dark:border-white/[.18]">
          {websites.length === 0 ? "No websites yet." : "Nothing matches that search."}
        </p>
      ) : (
        <StaggerGroup as="ul" className="flex flex-col gap-3">
          {visible.map((site) => (
            <StaggerItem
              as="li"
              key={site.id}
              className={`rounded-2xl border bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift ${
                isBlocked(site) ? "border-red-500/40" : "border-black/[.08] dark:border-white/[.12]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{site.businessName}</p>
                    <WebsiteStatusBadge status={site.status} />
                    {site.subscriptionStatus ? (
                      <Badge tone={PLAN_TONE[site.subscriptionStatus]}>
                        {site.subscriptionStatus === "TRIAL"
                          ? PLAN_LABEL.TRIAL
                          : `${site.planCode} · ${PLAN_LABEL[site.subscriptionStatus]}`}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">No plan yet</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    /site/{site.slug}
                    {site.subscriptionEndsAt && <> · renews {formatDate(site.subscriptionEndsAt)}</>}
                    {site.publishedAt && <> · published {formatDate(site.publishedAt)}</>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isBlocked(site) ? (
                    <Button className="!w-auto px-4" onClick={() => handleUnblock(site.id)} isLoading={isBusy}>
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="!w-auto px-4"
                      onClick={() => setBlocking(blocking === site.id ? null : site.id)}
                    >
                      Block
                    </Button>
                  )}
                  <button
                    type="button"
                    className="rounded-full px-3 py-2 text-xs font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
                    onClick={() => {
                      setEditingId(editingId === site.id ? null : site.id);
                      setEditName(site.businessName);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="rounded-full px-3 py-2 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => handleDelete(site.id, site.businessName)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* The owner, and the two ways to reach them. An admin about to
                  block somebody's business should be one tap from calling them. */}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/[.06] pt-3 text-sm dark:border-white/[.1]">
                <span className="font-medium">{site.ownerName || "Unnamed owner"}</span>
                <a href={`mailto:${site.ownerEmail}`} className="text-[var(--accent-solid)] hover:underline">
                  {site.ownerEmail}
                </a>
                {site.ownerPhone ? (
                  <>
                    <a href={`tel:${dialable(site.ownerPhone)}`} className="text-[var(--accent-solid)] hover:underline">
                      {site.ownerPhone}
                    </a>
                    <a
                      href={`https://wa.me/${dialable(site.ownerPhone).replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                    >
                      WhatsApp ↗
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">No phone on this site&apos;s profile</span>
                )}
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {site.ownerWebsiteCount} site{site.ownerWebsiteCount === 1 ? "" : "s"} on this account
                </span>
              </div>

              {isBlocked(site) && site.suspensionReason && (
                <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs">
                  <span className="font-medium">Blocked:</span> {site.suspensionReason}
                  {site.suspensionReactivateAt && <> · returns {formatDate(site.suspensionReactivateAt)}</>}
                </p>
              )}

              {editingId === site.id && (
                <div className="mt-3 flex items-end gap-2 rounded-xl bg-black/[.03] p-3 dark:bg-white/[.05]">
                  <TextField
                    id={`editName-${site.id}`}
                    label="Business name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="!w-auto px-4" onClick={() => handleSaveEdit(site.id)} isLoading={isBusy} disabled={!editName.trim()}>
                    Save
                  </Button>
                </div>
              )}

              {blocking === site.id && (
                <div className="mt-3 flex flex-col gap-3 rounded-xl bg-black/[.03] p-3 dark:bg-white/[.05]">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Blocking takes the public site offline immediately. The owner keeps their content and can see the
                    reason.
                  </p>
                  <TextField
                    id={`reason-${site.id}`}
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <Checkbox
                    id={`permanent-${site.id}`}
                    label="Permanent - no automatic return"
                    checked={permanent}
                    onChange={(e) => setPermanent(e.target.checked)}
                  />
                  {!permanent && (
                    <label htmlFor={`reactivateAt-${site.id}`} className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">Bring back automatically at (optional)</span>
                      <input
                        id={`reactivateAt-${site.id}`}
                        type="datetime-local"
                        value={reactivateAt}
                        onChange={(e) => setReactivateAt(e.target.value)}
                        className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
                      />
                    </label>
                  )}
                  <div className="flex gap-2">
                    <Button className="!w-auto px-4" onClick={() => handleBlock(site.id)} isLoading={isBusy} disabled={!reason.trim()}>
                      Block this site
                    </Button>
                    <Button variant="secondary" className="!w-auto px-4" onClick={() => setBlocking(null)} disabled={isBusy}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
