"use client";

import { useId, useState } from "react";

/**
 * The charts behind the platform report.
 *
 * Palette: the four categorical slots (blue, orange, aqua, yellow), stepped
 * separately for the light and dark surfaces rather than flipped - both columns
 * were run through the palette validator and pass the lightness band, chroma
 * floor, CVD separation and normal-vision floor in their own mode. Three of the
 * light steps sit under 3:1 against a light surface, which obliges relief: every
 * categorical mark here carries a visible label, so identity is never colour
 * alone.
 *
 * Forms follow the data's job rather than habit: magnitude-by-identity is a
 * labelled horizontal bar, never a pie; change-over-time is a line; and counts
 * and money are two charts rather than one chart with two axes.
 */

const SERIES = ["--viz-1", "--viz-2", "--viz-3", "--viz-4"] as const;

/** Scopes the validated palette. Both modes are chosen, not derived. */
export function VizRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .viz-root {
          --viz-1: #2a78d6; --viz-2: #eb6834; --viz-3: #1baf7a; --viz-4: #eda100;
          --viz-grid: color-mix(in srgb, currentColor 12%, transparent);
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .viz-root {
            --viz-1: #3987e5; --viz-2: #d95926; --viz-3: #199e70; --viz-4: #c98500;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --viz-1: #3987e5; --viz-2: #d95926; --viz-3: #199e70; --viz-4: #c98500;
        }
      `}</style>
      <div className="viz-root">{children}</div>
    </>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Counts over time, one line per series.
 *
 * A legend is always present for two or more series, and each line is also
 * labelled at its own end - so which line is which never rests on colour.
 */
export function TrendLines({
  series,
  height = 200,
}: {
  series: { label: string; points: { date: string; value: number }[] }[];
  height?: number;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);

  const length = Math.max(...series.map((s) => s.points.length), 0);
  if (length === 0) return null;
  const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)));

  const W = 100;
  const H = 100;
  const x = (i: number) => (length === 1 ? W / 2 : (i / (length - 1)) * W);
  const y = (v: number) => H - (v / max) * H;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {series.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: `var(${SERIES[i % SERIES.length]})` }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img">
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1="0" x2={W} y1={t * H} y2={t * H} stroke="var(--viz-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, si) => (
            <path
              key={s.label}
              d={s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ")}
              fill="none"
              stroke={`var(${SERIES[si % SERIES.length]})`}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hover != null && (
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--viz-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}
          {/* Hit targets wider than the marks, so hovering does not require precision. */}
          {Array.from({ length }, (_, i) => (
            <rect
              key={`${id}-hit-${i}`}
              x={x(i) - W / length / 2}
              width={W / length}
              y="0"
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        {hover != null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-lg border border-black/[.1] bg-surface px-2.5 py-1.5 text-xs shadow-lift dark:border-white/[.15]"
            style={{ left: `min(max(0px, ${(hover / Math.max(1, length - 1)) * 100}% - 60px), calc(100% - 130px))` }}
          >
            <p className="font-medium">{shortDate(series[0].points[hover].date)}</p>
            {series.map((s, i) => (
              <p key={s.label} className="flex items-center gap-1.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: `var(${SERIES[i % SERIES.length]})` }} />
                {s.label}: <span className="font-medium text-foreground">{s.points[hover]?.value ?? 0}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{shortDate(series[0].points[0].date)}</span>
        <span>{shortDate(series[0].points[length - 1].date)}</span>
      </div>
    </div>
  );
}

/** Money over time. Its own chart, because a second scale on the count chart would be a lie. */
export function RevenueArea({ points, currency = "$" }: { points: { date: string; amount: number }[]; currency?: string }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;

  const max = Math.max(1, ...points.map((p) => p.amount));
  const W = 100;
  const H = 100;
  const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * W);
  const y = (v: number) => H - (v / max) * H;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.amount)}`).join(" ");

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[200px]" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img">
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-1)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--viz-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <line key={t} x1="0" x2={W} y1={t * H} y2={t * H} stroke="var(--viz-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${id}-fill)`} />
          <path d={line} fill="none" stroke="var(--viz-1)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {points.map((_, i) => (
            <rect
              key={i}
              x={x(i) - W / points.length / 2}
              width={W / points.length}
              y="0"
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {hover != null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-lg border border-black/[.1] bg-surface px-2.5 py-1.5 text-xs shadow-lift dark:border-white/[.15]"
            style={{ left: `min(max(0px, ${(hover / Math.max(1, points.length - 1)) * 100}% - 50px), calc(100% - 110px))` }}
          >
            <p className="font-medium">{shortDate(points[hover].date)}</p>
            <p className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">
              Taken: <span className="font-medium text-foreground">{currency}{points[hover].amount.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{shortDate(points[0].date)}</span>
        <span>{shortDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}

/**
 * Magnitude by identity: a labelled horizontal bar, not a pie.
 *
 * Every row carries its name and its number as text, which is both easier to
 * read than a wedge and the relief the light palette's contrast warning
 * requires.
 */
export function LabelledBars({
  rows,
  emptyText = "Nothing yet.",
  colorIndex = 0,
}: {
  rows: { label: string; value: number; display?: string; note?: string }[];
  emptyText?: string;
  colorIndex?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const withValues = rows.filter((r) => r.value > 0);
  if (withValues.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{row.label}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {row.display ?? row.value}
              {row.note && <span className="ms-2 font-normal text-zinc-500 dark:text-zinc-400">{row.note}</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--viz-grid)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: `var(${SERIES[colorIndex % SERIES.length]})`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
