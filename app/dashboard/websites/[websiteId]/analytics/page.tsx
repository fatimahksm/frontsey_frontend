"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { friendlyMessage } from "@/lib/api/client";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { website, accessToken } = useWebsite();
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsApi.summary(
        accessToken,
        website.id,
        new Date(from).toISOString(),
        new Date(to + "T23:59:59").toISOString(),
      );
      setSummary(result);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to load analytics."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const blob = await analyticsApi.exportCsv(
        accessToken,
        website.id,
        new Date(from).toISOString(),
        new Date(to + "T23:59:59").toISOString(),
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "analytics-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to export analytics."));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Date range">
        <div className="flex flex-wrap items-end gap-3">
          <label htmlFor="from" className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">From</span>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
            />
          </label>
          <label htmlFor="to" className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">To</span>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
            />
          </label>
          <Button className="w-auto px-4" onClick={load} isLoading={isLoading}>
            Apply
          </Button>
          <Button variant="secondary" className="w-auto px-4" onClick={handleExport} isLoading={isExporting}>
            Export CSV
          </Button>
        </div>
      </Card>

      {summary && (
        <>
          <Card title="Overview">
            <p className="text-3xl font-semibold">{summary.totalVisits}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total visits in range</p>
          </Card>

          <Card title="Most viewed items">
            {summary.mostViewedItems.length === 0 ? (
              <p className="text-sm text-zinc-500">No item views yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {summary.mostViewedItems.map((item) => (
                  <li key={item.itemId} className="flex items-center justify-between">
                    <span>{item.itemName}</span>
                    <span className="text-zinc-500">{item.views} views</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Referral source">
              <ul className="flex flex-col gap-1.5 text-sm">
                {Object.entries(summary.visitsByReferralSource).map(([source, count]) => (
                  <li key={source} className="flex items-center justify-between">
                    <span>{source}</span>
                    <span className="text-zinc-500">{count}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Device type">
              <ul className="flex flex-col gap-1.5 text-sm">
                {Object.entries(summary.visitsByDeviceType).map(([device, count]) => (
                  <li key={device} className="flex items-center justify-between">
                    <span>{device}</span>
                    <span className="text-zinc-500">{count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
