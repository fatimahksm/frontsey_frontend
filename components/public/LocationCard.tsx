"use client";

import { useSyncExternalStore } from "react";

import { useLocale } from "@/lib/i18n/LocaleContext";
import type { PublicOpeningHours, PublicProfile } from "@/lib/api/types";

/** Matches the `dayOfWeek` strings to `Date.getDay()`, which counts from Sunday. */
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function toMinutes(time: string): number {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * Whether the business is open at `now`, given a day's row.
 *
 * A closing time earlier than the opening time means the business closes after
 * midnight (the sample restaurant runs 10:00-01:00 on weekends), so the window
 * is treated as running into the next day rather than as an empty range.
 */
function isOpenAt(hour: PublicOpeningHours | undefined, now: Date): boolean {
  if (!hour?.open || !hour.opensAt || !hour.closesAt) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const opens = toMinutes(hour.opensAt);
  const closes = toMinutes(hour.closesAt);
  return closes <= opens ? minutes >= opens || minutes < closes : minutes >= opens && minutes < closes;
}

/**
 * An address that Google Maps can resolve without an API key.
 *
 * The owner gives us a free-text address and, optionally, a link to their own
 * map pin. The pin is the accurate one - it is what they chose - so prefer it
 * for the "open in maps" button, and fall back to searching the address text.
 */
function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function mapsEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/** Re-checks once a minute, which is the resolution opening hours are given in. */
function subscribeToMinute(onChange: () => void): () => void {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

function getMinute(): number {
  return Math.floor(Date.now() / 60_000);
}

function getServerMinute(): null {
  return null;
}

interface Props {
  profile: PublicProfile;
  openingHours: PublicOpeningHours[];
  /** Menu layouts render on a light surface; the dark hero layouts need inverted text. */
  variant?: "surface" | "dark";
}

/**
 * Address, opening hours, and a map, as one block.
 *
 * Every layout previously rendered these as a row of loose spans - the address
 * next to a phone number next to seven "Mon: 10:00-23:00" fragments - which is
 * the information a visitor most often wants and the hardest thing on the page
 * to read. This groups them, marks today's row, and answers "are they open
 * right now" directly instead of leaving the visitor to work it out.
 */
export function LocationCard({ profile, openingHours, variant = "surface" }: Props) {
  const { t } = useLocale();
  // The wall clock is an external store, so it is read rather than mirrored
  // into state. The server snapshot is null on purpose: the server has no idea
  // what time it is where the visitor is, so it renders no open/closed badge
  // and the client fills it in, instead of shipping a guess that hydrates to
  // something different. The snapshot is the minute number rather than a Date
  // so that repeated reads within the same minute are referentially equal.
  const minute = useSyncExternalStore(subscribeToMinute, getMinute, getServerMinute);
  const now = minute === null ? null : new Date();

  const todayName = now ? DAY_NAMES[now.getDay()] : null;
  const today = openingHours.find((h) => h.dayOfWeek === todayName);
  const openNow = now ? isOpenAt(today, now) : null;

  const dark = variant === "dark";
  const mutedText = dark ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400";
  const border = dark ? "border-white/10" : "border-black/[.08] dark:border-white/[.145]";
  const rowBorder = dark ? "border-white/[.06]" : "border-black/[.05] dark:border-white/[.08]";

  const mapQuery = profile.address?.trim();
  const openMapsHref = profile.googleMapsUrl || (mapQuery ? mapsSearchUrl(mapQuery) : null);

  return (
    <div className={`grid gap-6 rounded-2xl border ${border} p-6 sm:grid-cols-2 sm:gap-8`}>
      <div className="flex flex-col gap-5">
        {profile.address && (
          <div className="flex flex-col gap-1.5">
            <p className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>{t.contact.findUs}</p>
            <p className="text-sm font-medium leading-relaxed">{profile.address}</p>
          </div>
        )}

        {profile.phone && (
          <div className="flex flex-col gap-1.5">
            <p className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>{t.contact.callUs}</p>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="text-sm font-medium hover:underline" dir="ltr">
              {profile.phone}
            </a>
          </div>
        )}

        {openingHours.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>{t.hours.openingHours}</p>
              {openNow !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    openNow
                      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-500/12 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  {openNow ? t.hours.openNow : t.hours.closedNow}
                </span>
              )}
            </div>
            <ul className="flex flex-col">
              {openingHours.map((h) => {
                const isToday = h.dayOfWeek === todayName;
                return (
                  <li
                    key={h.dayOfWeek}
                    className={`flex items-center justify-between gap-4 border-b py-1.5 text-sm last:border-b-0 ${rowBorder} ${
                      isToday ? "font-semibold" : mutedText
                    }`}
                  >
                    <span>
                      {t.hours.dayFull[h.dayOfWeek] ?? h.dayOfWeek}
                      {isToday && <span className="ms-2 text-[11px] font-medium opacity-60">{t.hours.today}</span>}
                    </span>
                    <span dir="ltr" className="tabular-nums">
                      {h.open && h.opensAt && h.closesAt ? `${h.opensAt.slice(0, 5)} – ${h.closesAt.slice(0, 5)}` : t.hours.closed}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {mapQuery && (
        <div className="flex flex-col gap-3">
          <div className={`relative h-56 overflow-hidden rounded-xl border sm:h-full sm:min-h-[240px] ${border}`}>
            <iframe
              // Google's keyless embed. It only ever renders the address the
              // owner typed, so there is nothing user-specific to leak, and
              // lazy loading keeps it off the critical path on a menu page.
              src={mapsEmbedUrl(mapQuery)}
              title={profile.address ?? ""}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {openMapsHref && (
            <a
              href={openMapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${border} ${
                dark ? "hover:bg-white/[.06]" : "hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              }`}
            >
              {t.contact.openInMaps}
              <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
