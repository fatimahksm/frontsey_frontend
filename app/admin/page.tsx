"use client";

import { useEffect, useState } from "react";

import { LabelledBars, RevenueArea, TrendLines, VizRoot } from "@/components/admin/ReportCharts";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { AdminDashboardResponse, AdminPlatformReportResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatMoney } from "@/lib/format";
import { TEMPLATE_OPTIONS } from "@/lib/website/layout-options";

/**
 * The platform report.
 *
 * This page was six totals in a grid, which says how big the platform is and
 * nothing about how it is doing: none of them moved in a way you could read,
 * none said which templates people choose, and a first payment and a renewal
 * counted the same.
 *
 * Every number here comes from rows the platform already keeps - accounts,
 * websites, subscriptions, payments. Nothing is modelled or projected. One
 * thing an admin might look for is missing on purpose: how people sign in.
 * Logins are not recorded anywhere, so there is no honest figure to show and a
 * made-up one would be worse than the gap.
 */

const RANGES = [7, 30, 90] as const;

/** The friendly template names the picker uses, so the report and the product agree. */
const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(TEMPLATE_OPTIONS).flat().map((option) => [option.value, option.label]),
);

const STATUS_LABELS: Record<string, string> = {
  TRIAL: "Free trial",
  ACTIVE: "Active",
  GRACE: "Grace period",
  PENDING: "Awaiting payment",
  EXPIRED: "Expired",
  CANCELED: "Canceled",
};

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
        </div>
        {children}
      </div>
    </Card>
  );
}

function Stat({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <Card>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [report, setReport] = useState<AdminPlatformReportResponse | null>(null);
  const [days, setDays] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    adminApi
      .dashboard(session.accessToken)
      .then(setDashboard)
      .catch((err) => setError(friendlyMessage(err, "Failed to load the dashboard.")));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    adminApi
      .report(session.accessToken, days)
      .then((result) => {
        if (!cancelled) setReport(result);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Failed to load the report."));
      });
    return () => {
      cancelled = true;
    };
  }, [session, days]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!dashboard || !report) return <p className="text-sm text-zinc-500">Loading…</p>;

  const takings = report.revenue.reduce((sum, point) => sum + point.amount, 0);
  const newSignups = report.signups.reduce((sum, point) => sum + point.count, 0);
  const newSites = report.websitesCreated.reduce((sum, point) => sum + point.count, 0);
  const wentLive = report.websitesPublished.reduce((sum, point) => sum + point.count, 0);
  const paying = report.subscriptions
    .filter((row) => row.status === "ACTIVE" || row.status === "GRACE")
    .reduce((sum, row) => sum + row.count, 0);

  return (
    <VizRoot>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Platform</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {dashboard.totalUsers} account{dashboard.totalUsers === 1 ? "" : "s"} · {dashboard.totalWebsites} website
              {dashboard.totalWebsites === 1 ? "" : "s"} · {formatMoney(dashboard.totalRevenue)} taken all time
            </p>
          </div>
          {/* One filter row above the charts, driving every series on the page. */}
          <div className="flex items-center gap-1 rounded-full bg-black/[.04] p-1 dark:bg-white/[.06]">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === range ? "bg-gradient-accent text-white" : "text-zinc-600 hover:text-foreground dark:text-zinc-400"
                }`}
              >
                {range} days
              </button>
            ))}
          </div>
        </div>

        {/* Headline numbers for the chosen window - the ones a chart would only
            get in the way of. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={String(newSignups)} label="New accounts" hint={`in the last ${days} days`} />
          <Stat value={String(wentLive)} label="Sites published" hint={`${newSites} created`} />
          <Stat value={formatMoney(takings)} label="Taken" hint={`in the last ${days} days`} />
          <Stat value={String(paying)} label="Paying now" hint={`${report.onFreeTrial} on a free trial`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Sign-ups and sites" hint="New accounts, websites created, and websites published each day.">
            <TrendLines
              series={[
                { label: "Accounts", points: report.signups.map((p) => ({ date: p.date, value: p.count })) },
                { label: "Sites created", points: report.websitesCreated.map((p) => ({ date: p.date, value: p.count })) },
                { label: "Sites published", points: report.websitesPublished.map((p) => ({ date: p.date, value: p.count })) },
              ]}
            />
          </Panel>

          <Panel title="Money taken" hint="Successful payments only. Kept apart from the counts above - a second scale on one chart would mislead.">
            <RevenueArea points={report.revenue} />
          </Panel>

          <Panel title="Templates people choose" hint="Every website by the template it uses, and how many of those reached publish.">
            <LabelledBars
              colorIndex={0}
              rows={report.templates
                .slice()
                .sort((a, b) => b.websites - a.websites)
                .map((row) => ({
                  label: TEMPLATE_LABELS[row.layoutVariant] ?? row.layoutVariant,
                  value: row.websites,
                  note: row.websites > 0 ? `${row.published} live` : undefined,
                }))}
              emptyText="No websites yet."
            />
          </Panel>

          <Panel title="Subscriptions" hint="Where every subscription stands right now.">
            <LabelledBars
              colorIndex={2}
              rows={report.subscriptions.map((row) => ({
                label: STATUS_LABELS[row.status] ?? row.status,
                value: row.count,
              }))}
              emptyText="Nobody has subscribed yet."
            />
          </Panel>

          <Panel title="Starting and staying" hint="A first payment is somebody starting. A renewal is somebody choosing to stay.">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{report.firstPayments}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">First payments</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{report.renewals}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Renewals</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {report.trialsLapsed} free trial{report.trialsLapsed === 1 ? "" : "s"} ended without a payment.
            </p>
          </Panel>

          <Panel
            title="Where the money comes from"
            hint="Successful payments, grouped by the plan each subscription is on today. A payment made before a plan change counts under the newer plan - payments do not record which plan they were for."
          >
            <LabelledBars
              colorIndex={1}
              rows={report.revenueByPlan.map((row) => ({
                label: `${row.planCode} · ${row.billingPeriod}`,
                // The bar is sized by the amount; the figure beside it is the
                // amount itself. Rounding money to size a bar is fine, printing
                // the rounded number as the takings is not.
                value: row.revenue,
                display: formatMoney(row.revenue),
                note: `${row.payments} payment${row.payments === 1 ? "" : "s"}`,
              }))}
              emptyText="No payments yet."
            />
          </Panel>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sign-in activity is not shown because the platform does not record logins - only actions taken on content,
          which are in the audit log.
        </p>
      </div>
    </VizRoot>
  );
}
