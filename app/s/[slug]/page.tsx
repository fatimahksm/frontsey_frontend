"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { RankedBar, ShareDonut, VisitsArea } from "@/components/site-admin/Charts";
import { SiteAdminShell, type SiteAdminContext } from "@/components/site-admin/SiteAdminShell";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "@/components/site-admin/icons";
import { analyticsApi } from "@/lib/api/analytics";
import { galleryApi } from "@/lib/api/gallery";
import { menuApi } from "@/lib/api/menu";
import { projectsApi } from "@/lib/api/projects";
import { servicesApi } from "@/lib/api/services";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";
import { loadSetupStatus, type ChecklistItem } from "@/lib/website/setup-checklist";

/**
 * The business's dashboard.
 *
 * Written for someone who runs a salon, not an analyst. Every panel says in a
 * sentence what its numbers mean, the top of the page reads as plain English
 * before it reads as charts, and anything that needs doing is a labelled button
 * rather than something to infer from a gap.
 *
 * Every number is measured. There is no revenue and no order count because the
 * platform records neither - a figure someone's bank statement disagrees with
 * is worse than no figure. The period comparison is real: it fetches the
 * preceding window of the same length and subtracts.
 */

const RANGES = [
  { days: 7, label: "7 days", previous: "the 7 days before" },
  { days: 30, label: "30 days", previous: "the 30 days before" },
  { days: 90, label: "90 days", previous: "the 90 days before" },
] as const;

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/[.07] bg-surface p-5 shadow-soft dark:border-white/[.09]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A measured change against the preceding window. Absent when there is nothing to compare to. */
function Trend({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === 0) return null;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return <span className="text-xs opacity-80">Same as before</span>;
  const up = change > 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs opacity-90">
      {up ? <ArrowUpIcon className="h-3.5 w-3.5" /> : <ArrowDownIcon className="h-3.5 w-3.5" />}
      {Math.abs(change)}% vs before
    </span>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  tone?: "accent";
  href?: string;
}) {
  const body = (
    <div
      className={`h-full rounded-2xl border p-5 shadow-soft transition-shadow ${
        tone === "accent"
          ? "border-transparent bg-gradient-accent text-white"
          : "border-black/[.07] bg-surface hover:shadow-lift dark:border-white/[.09]"
      }`}
    >
      <p className={`text-xs ${tone === "accent" ? "text-white/85" : "text-zinc-500 dark:text-zinc-400"}`}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && (
        <div className={`mt-1.5 text-xs ${tone === "accent" ? "text-white/85" : "text-zinc-500 dark:text-zinc-400"}`}>
          {hint}
        </div>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

/** The backend stores the raw Referer (or "direct"); make it readable without changing the value. */
function formatSource(source: string): string {
  if (source.toLowerCase() === "direct") return "Direct link";
  try {
    const host = new URL(source).hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return source;
  }
}

/**
 * An unfinished checklist item, phrased as the thing still to do.
 *
 * The checklist's own labels are written as completed states - "Contact
 * information added" - which is right beside a green tick and actively
 * misleading under a heading that says these are the things left. Falling back
 * to the original label keeps a future checklist item visible rather than
 * silently dropping it.
 */
function todoFor(
  key: string,
  label: string,
  isPortfolio: boolean,
  base: string,
  manageBase: string,
): { text: string; href: string; action: string } | null {
  switch (key) {
    case "contact":
      return {
        text: "Visitors have no way to reach you",
        href: `${manageBase}/profile`,
        action: "Add a phone or email",
      };
    case "content":
      return isPortfolio
        ? { text: "You haven't listed what you offer", href: `${base}/services`, action: "Add a service" }
        : { text: "Your menu is empty", href: `${base}/menu`, action: "Add an item" };
    case "subscription":
      return { text: "No active plan, so the site can't go live", href: `${manageBase}/subscription`, action: "Choose a plan" };
    case "businessName":
      return { text: "Your business has no name yet", href: `${manageBase}/profile`, action: "Add a name" };
    default:
      return { text: label, href: manageBase, action: "Open setup" };
  }
}

function Dashboard({ website, accessToken }: SiteAdminContext) {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [previousVisits, setPreviousVisits] = useState<number | null>(null);
  const [analyticsUnavailable, setAnalyticsUnavailable] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
  const [counts, setCounts] = useState<{ primary: number | null; secondary: number | null }>({
    primary: null,
    secondary: null,
  });

  // Two windows, one after the other, so "vs before" is a measurement rather
  // than a decoration. The second failing only costs the comparison.
  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const span = rangeDays * 24 * 60 * 60 * 1000;
    const currentFrom = new Date(now - span).toISOString();
    const currentTo = new Date(now).toISOString();

    analyticsApi
      .summary(accessToken, website.id, currentFrom, currentTo)
      .then((result) => {
        if (cancelled) return;
        setSummary(result);
        setAnalyticsUnavailable(false);
        return analyticsApi
          .summary(accessToken, website.id, new Date(now - span * 2).toISOString(), currentFrom)
          .then((prior) => {
            if (!cancelled) setPreviousVisits(prior.totalVisits);
          })
          .catch(() => {
            if (!cancelled) setPreviousVisits(null);
          });
      })
      .catch(() => {
        // Either the plan does not include analytics or this manager lacks the
        // permission. Both mean "no numbers to show", not "something broke".
        if (cancelled) return;
        setSummary(null);
        setPreviousVisits(null);
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
      isPortfolio
        ? servicesApi.list(accessToken, website.id).then((l) => l.length)
        : galleryApi.list(accessToken, website.id).then((l) => l.length),
    ])
      .then(([primary, secondary]) => {
        if (!cancelled) setCounts({ primary, secondary });
      })
      .catch(() => undefined);
    loadSetupStatus(accessToken, website)
      .then((result) => {
        if (!cancelled) setChecklist(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [accessToken, website]);

  const isPortfolio = website.templateType === "PORTFOLIO";
  const base = `/s/${website.slug}`;
  const manageBase = `/manage/${website.id}`;
  const range = RANGES.find((r) => r.days === rangeDays) ?? RANGES[1];

  const topItems = summary?.mostViewedItems ?? [];
  const sources = Object.entries(summary?.visitsByReferralSource ?? {}).sort(([, a], [, b]) => b - a);
  const devices = Object.entries(summary?.visitsByDeviceType ?? {}).sort(([, a], [, b]) => b - a);
  const todo = (checklist ?? []).filter((item) => !item.complete);

  /**
   * The headline, in words.
   *
   * The charts underneath answer the same question, but somebody opening this
   * between two clients should not have to read a chart to find out whether
   * the week went well.
   */
  const sentence = (() => {
    if (analyticsUnavailable) return "Visitor numbers aren't included in your current plan.";
    if (!summary) return "Checking how your website is doing…";
    if (summary.totalVisits === 0) {
      return website.status === "PUBLISHED"
        ? `No one has opened your website in the last ${rangeDays} days yet. Share your link to get the first visitors.`
        : "Your website isn't published yet, so nobody can visit it.";
    }
    const parts = [`${summary.totalVisits.toLocaleString()} people opened your website in the last ${rangeDays} days`];
    if (sources.length > 0) parts.push(`most came from ${formatSource(sources[0][0])}`);
    if (devices.length > 0) parts.push(`mostly on ${devices[0][0].toLowerCase()}`);
    return `${parts.join(", ")}.`;
  })();

  return (
    <div className="flex flex-col gap-5">
      {/* What needs doing, before anything to look at. */}
      {todo.length > 0 && (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-5">
          <h2 className="text-sm font-semibold tracking-tight">
            {todo.length === 1 ? "One thing left to do" : `${todo.length} things left to do`}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {todo.map((item) => {
              const fix = todoFor(item.key, item.label, isPortfolio, base, manageBase);
              if (!fix) return null;
              return (
                <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>{fix.text}</span>
                  <Link
                    href={fix.href}
                    className="shrink-0 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background"
                  >
                    {fix.action}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {checklist !== null && todo.length === 0 && website.status === "PUBLISHED" && (
        <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckIcon className="h-4 w-4" />
          Your website is live and everything is set up.
        </p>
      )}

      <p className="text-base leading-relaxed">{sentence}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          tone="accent"
          label={`Visits · last ${rangeDays} days`}
          value={summary ? summary.totalVisits.toLocaleString() : analyticsUnavailable ? "—" : "…"}
          hint={summary ? <Trend current={summary.totalVisits} previous={previousVisits} /> : undefined}
        />
        <Kpi
          href={isPortfolio ? `${base}/projects` : `${base}/menu`}
          label={isPortfolio ? "Projects" : "Menu items"}
          value={counts.primary === null ? "…" : counts.primary.toLocaleString()}
          hint={counts.primary === 0 ? "Add your first one →" : "Manage →"}
        />
        <Kpi
          href={isPortfolio ? `${base}/services` : `${base}/gallery`}
          label={isPortfolio ? "Services" : "Photos"}
          value={counts.secondary === null ? "…" : counts.secondary.toLocaleString()}
          hint={counts.secondary === 0 ? "Add your first one →" : "Manage →"}
        />
        <Kpi
          label="Website"
          value={website.status === "PUBLISHED" ? "Live" : "Draft"}
          hint={
            website.status === "PUBLISHED" ? (
              <a href={`/site/${website.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                /site/{website.slug} ↗
              </a>
            ) : (
              <Link href={manageBase} className="hover:underline">
                Finish setup to publish →
              </Link>
            )
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Visits over time"
          description={`How many times your page was opened each day, compared with ${range.previous}.`}
          action={
            <div className="flex shrink-0 gap-1 rounded-full border border-black/[.08] p-0.5 dark:border-white/[.12]">
              {RANGES.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setRangeDays(option.days)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    rangeDays === option.days
                      ? "bg-gradient-accent text-white"
                      : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
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
              Visitor numbers aren&apos;t included in your plan.{" "}
              <Link href={`${manageBase}/subscription`} className="font-medium text-[var(--accent-solid)] hover:underline">
                See plans
              </Link>
            </Empty>
          ) : !summary ? (
            <Empty>Loading…</Empty>
          ) : summary.totalVisits === 0 ? (
            <Empty>
              Nothing to chart yet.{" "}
              <Link href={`${manageBase}/share`} className="font-medium text-[var(--accent-solid)] hover:underline">
                Share your link
              </Link>{" "}
              and check back.
            </Empty>
          ) : (
            <VisitsArea points={summary.visitsByDay} />
          )}
        </Panel>

        <Panel title="Phone or computer" description="What visitors were using.">
          {devices.length > 0 ? (
            <ShareDonut data={summary!.visitsByDeviceType} />
          ) : (
            <Empty>Nothing to break down yet.</Empty>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title={isPortfolio ? "Most looked at" : "Most looked at on the menu"}
          description="What visitors opened the most."
          action={
            <Link href={`${base}/analytics`} className="shrink-0 text-xs font-medium text-[var(--accent-solid)] hover:underline">
              Full report
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
            <Empty>No one has opened an individual item yet.</Empty>
          )}
        </Panel>

        <Panel title="How people found you" description="The link they arrived from.">
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
            <Empty>No visits recorded yet.</Empty>
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
