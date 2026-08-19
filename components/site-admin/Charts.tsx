"use client";

/**
 * The dashboard's three chart shapes, drawn by hand.
 *
 * No chart library: these are three fixed shapes over at most a year of daily
 * points, and a charting dependency would be larger than the whole admin page
 * for no benefit. Every one of them is fed real, already-fetched numbers -
 * none of them invents a trend, a target or a comparison.
 */

/** A ranked bar, used for top items and referral sources. */
export function RankedBar({
  label,
  value,
  max,
  tone = "accent",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "accent" | "muted";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
        <div
          className={`h-full rounded-full ${tone === "accent" ? "bg-gradient-accent" : "bg-zinc-400/70 dark:bg-zinc-500/70"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

const DONUT_COLORS = ["#7c3aed", "#db2777", "#0ea5e9", "#f59e0b", "#10b981"];

/** Share of a whole, as a conic-gradient ring with its own legend. */
export function ShareDonut({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const stops = entries.map(([, value], i) => {
    const start = (cumulative / total) * 360;
    cumulative += value;
    return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}deg ${(cumulative / total) * 360}deg`;
  });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        aria-hidden
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        {/* No number in the middle: it would be the total of this breakdown,
            which is not always the visit count shown elsewhere on the page, and
            two nearly-equal totals side by side read as a contradiction. */}
        <div className="absolute inset-[9px] rounded-full bg-surface" />
      </div>
      <ul className="flex min-w-40 flex-1 flex-col gap-2 text-sm">
        {entries.map(([label, value], i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate capitalize">{label.toLowerCase()}</span>
            <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
              {Math.round((value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function niceCeiling(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

/**
 * The visits trend, as a filled area over a dated axis.
 *
 * Drawn in a fixed 1000x260 viewBox and scaled with `preserveAspectRatio`, so
 * it reflows to any column width without recomputing anything - which is what
 * makes it safe on a phone.
 */
export function VisitsArea({ points }: { points: { date: string; visits: number }[] }) {
  if (points.length === 0) return null;

  const W = 1000;
  const H = 260;
  const PAD_B = 28;
  const max = niceCeiling(Math.max(...points.map((p) => p.visits), 1));
  // A single day has no line to draw; give it two coordinates so the area still
  // renders as a flat band rather than disappearing.
  const step = points.length > 1 ? W / (points.length - 1) : W;

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * step : W / 2;
    const y = H - PAD_B - (p.visits / max) * (H - PAD_B - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M ${coords.join(" L ")}`;
  const area = `${line} L ${W},${H - PAD_B} L 0,${H - PAD_B} Z`;

  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const formatDay = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <figure className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-52 w-full" role="img" aria-label="Visits per day">
        <defs>
          <linearGradient id="visits-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-solid, #7c3aed)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-solid, #7c3aed)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((fraction) => {
          const y = H - PAD_B - fraction * (H - PAD_B - 10);
          return <line key={fraction} x1="0" y1={y} x2={W} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />;
        })}
        <path d={area} fill="url(#visits-fill)" />
        <path d={line} fill="none" stroke="var(--accent-solid, #7c3aed)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        {points
          .filter((_, i) => i % labelEvery === 0 || i === points.length - 1)
          .map((p) => (
            <span key={p.date}>{formatDay(p.date)}</span>
          ))}
      </div>
      <figcaption className="sr-only">
        Peak {max.toLocaleString()} visits in a day across {points.length} days.
      </figcaption>
    </figure>
  );
}
