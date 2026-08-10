"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { RankedBar, ShareDonut, VisitsArea } from "@/components/site-admin/Charts";
import { SiteAdminShell, type SiteAdminContext } from "@/components/site-admin/SiteAdminShell";
import { analyticsApi } from "@/lib/api/analytics";
import { galleryApi } from "@/lib/api/gallery";
import { menuApi } from "@/lib/api/menu";
import { projectsApi } from "@/lib/api/projects";
import { servicesApi } from "@/lib/api/services";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";

/**
 * The business's dashboard.
 *
 * Every number here is measured. There is no revenue, no order count and no
 * "+8% vs last week" because the platform does not record sales or run a
 * comparison window - inventing either would put a figure on someone's screen
 * that their bank statement disagrees with. What is genuinely known is
 * traffic, where it came from, what it looked at, and how much content the
 * site has, so that is what it shows.
 */

const RANGE_DAYS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/[.07] bg-surface p-5 shadow-soft dark:border-white/[.09]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "accent" }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-soft ${
        tone === "accent"
          ? "border-transparent bg-gradient-accent text-white"
          : "border-black/[.07] bg-surface dark:border-white/[.09]"
      }`}
    >
      <p className={`text-xs ${tone === "accent" ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}`}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className={`mt-1 text-xs ${tone === "accent" ? "text-white/75" : "text-zinc-500 dark:text-zinc-400"}`}>{hint}</p>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

/** The backend stores the raw Referer (or "direct"); make it readable without changing the value. */
function formatSource(source: string): string {
  if (source.toLowerCase() === "direct") return "Direct";
  try {
    const host = new URL(source).hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return source;
  }
}

function Dashboard({ website, accessToken }: SiteAdminContext) {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [analyticsUnavailable, setAnalyticsUnavailable] = useState(false);
  const [counts, setCounts] = useState<{ primary: number | null; secondary: number | null; gallery: number | null }>({
    primary: null,
    secondary: null,
    gallery: null,
  });

  useEffect(() => {
    let cancelled = false;
    const to = new Date();
    const from = new Date(to.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    analyticsApi
      .summary(accessToken, website.id, from.toISOString(), to.toISOString())
      .then((result) => {
        if (cancelled) return;
        setSummary(result);
        setAnalyticsUnavailable(false);
      })
      .catch(() => {
        // Either the plan does not include analytics or this manager lacks the
        // permission. Both mean "no numbers to show", not "something broke".
        if (cancelled) return;
        setSummary(null);
        setAnalyticsUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website.id, rangeDays]);

  useEffect(() => {
    let cancelled = false;
    const isPortfolio = website.templateType === "PORTFOLIO";
    Promise.all([
      isPortfolio
        ? projectsApi.list(accessToken, website.id).then((l) => l.length)
        : menuApi.listItems(accessToken, website.id).then((l) => l.length),
      isPortfolio ? servicesApi.list(accessToken, website.id).then((l) => l.length) : Promise.resolve<number | null>(null),
      galleryApi.list(accessToken, website.id).then((l) => l.length),
    ])
      .then(([primary, secondary, gallery]) => {
        if (!cancelled) setCounts({ primary, secondary, gallery });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [accessToken, website.id, website.templateType]);

  const isPortfolio = website.templateType === "PORTFOLIO";
  const base = `/s/${website.slug}`;
  const busiest = summary?.visitsByDay.reduce((best, day) => (day.visits > best.visits ? day : best), {
    date: "",
    visits: 0,
  });
  const topItems = summary?.mostViewedItems ?? [];
  const sources = Object.entries(summary?.visitsByReferralSource ?? {}).sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          tone="accent"
          label={`Visits (${rangeDays} days)`}
          value={summary ? summary.totalVisits.toLocaleString() : analyticsUnavailable ? "—" : "…"}
          hint={busiest && busiest.visits > 0 ? `Busiest day: ${busiest.visits.toLocaleString()}` : undefined}
        />
        <Kpi
          label={isPortfolio ? "Projects" : "Menu items"}
          value={counts.primary === null ? "…" : counts.primary.toLocaleString()}
        />
        <Kpi
          label={isPortfolio ? "Services" : "Photos"}
          value={
            isPortfolio
              ? counts.secondary === null
                ? "…"
                : counts.secondary.toLocaleString()
              : counts.gallery === null
                ? "…"
                : counts.gallery.toLocaleString()
          }
        />
        <Kpi
          label="Status"
          value={website.status === "PUBLISHED" ? "Live" : "Draft"}
          hint={website.status === "PUBLISHED" ? `/site/${website.slug}` : "Not visible to visitors yet"}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Visits"
          action={
            <div className="flex gap-1 rounded-full border border-black/[.08] p-0.5 dark:border-white/[.12]">
              {RANGE_DAYS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setRangeDays(option.days)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    rangeDays === option.days ? "bg-gradient-accent text-white" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        >
          {analyticsUnavailable ? (
            <Empty>
              Visitor numbers aren&apos;t available on this plan.{" "}
              <Link href={`/manage/${website.id}/subscription`} className="font-medium text-[var(--accent-solid)] hover:underline">
                See plans
              </Link>
            </Empty>
          ) : !summary ? (
            <Empty>Loading…</Empty>
          ) : summary.totalVisits === 0 ? (
            <Empty>No visits recorded in this period yet.</Empty>
          ) : (
            <VisitsArea points={summary.visitsByDay} />
          )}
        </Panel>

        <Panel title="Devices">
          {summary && Object.keys(summary.visitsByDeviceType).length > 0 ? (
            <ShareDonut data={summary.visitsByDeviceType} />
          ) : (
            <Empty>Nothing to break down yet.</Empty>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title={isPortfolio ? "Most viewed" : "Top menu items"}
          action={
            <Link href={`${base}/analytics`} className="text-xs font-medium text-[var(--accent-solid)] hover:underline">
              See all
            </Link>
          }
        >
          {topItems.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {topItems.slice(0, 5).map((item, i) => (
                <RankedBar
                  key={item.itemId}
                  label={item.itemName}
                  value={item.views}
                  max={topItems[0].views}
                  tone={i === 0 ? "accent" : "muted"}
                />
              ))}
            </ul>
          ) : (
            <Empty>No item views recorded yet.</Empty>
          )}
        </Panel>

        <Panel title="Where visitors come from">
          {sources.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {sources.slice(0, 5).map(([source, count], i) => (
                <RankedBar
                  key={source}
                  label={formatSource(source)}
                  value={count}
                  max={sources[0][1]}
                  tone={i === 0 ? "accent" : "muted"}
                />
              ))}
            </ul>
          ) : (
            <Empty>No referrals recorded yet.</Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function SiteAdminDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <SiteAdminShell slug={slug}>{(context) => <Dashboard {...context} />}</SiteAdminShell>;
}
