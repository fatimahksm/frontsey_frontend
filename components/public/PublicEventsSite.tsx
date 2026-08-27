"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SafeImage } from "@/components/public/SafeImage";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The Events / Memories template (EVENTS_CELEBRATION).
 *
 * One occasion, read in the order a guest needs it: whose it is and what it
 * is, then when and where - which is the only thing most people open the page
 * for - then the shape of the day, then the photographs.
 *
 * Everything is optional. An invitation that says only a name and a date is a
 * real invitation, so every block below renders nothing at all when it has
 * nothing, rather than an empty heading over a gap.
 *
 * Light, and its own shell rather than the theme palette painted inline - see
 * the note in theme-config about why an inline background outranks the
 * layout's own classes. The accent still resolves from the host's colour.
 */
export function PublicEventsSite({ site }: { site: PublicWebsiteResponse }) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();
  const content = parseDraftContent(site.publishedContent);

  const event = site.event;
  const schedule = site.schedule ?? [];
  const gallery = site.galleryImageUrls ?? [];
  const profile = site.profile;

  const heading = content.heroHeading || site.businessName;
  const subtitle = content.heroSubtitle || profile?.description || "";
  const cover = profile?.coverImageUrl ?? null;

  const messageHref = profile?.whatsappNumber
    ? whatsappUrl(profile.whatsappNumber, "")
    : profile?.email
      ? `mailto:${profile.email}`
      : profile?.phone
        ? `tel:${profile.phone.replace(/\s+/g, "")}`
        : null;

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4 } };

  /** The facts, as label/value pairs - only the ones that were filled in. */
  const facts = [
    { label: t.event.when, value: [event?.eventDate, [event?.startTime, event?.endTime].filter(Boolean).join(" – ")].filter(Boolean).join(", ") },
    { label: t.event.where, value: [event?.venueName, profile?.address].filter(Boolean).join(", ") },
    { label: t.event.dressCode, value: event?.dressCode ?? "" },
    { label: t.event.rsvpBy, value: event?.rsvpBy ?? "" },
  ].filter((fact) => fact.value);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[var(--events-paper)] text-[var(--events-ink)]"
      style={{
        ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined),
        // Warm paper rather than white: an invitation is a printed thing, and
        // this is the one place the template insists on its own shell.
        ["--events-paper" as string]: "#faf7f2",
        ["--events-ink" as string]: "#211d1a",
        ["--events-muted" as string]: "#6b625b",
        ["--events-rule" as string]: "rgba(33,29,26,0.12)",
      }}
    >
      <header className="relative isolate overflow-hidden">
        {cover && (
          <>
            <SafeImage src={cover} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            {/* A scrim, so the names stay readable over any photograph a host picks. */}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />
          </>
        )}
        <div className={`mx-auto max-w-3xl px-6 py-24 text-center sm:py-32 ${cover ? "text-white" : ""}`}>
          <motion.h1 {...fade} className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {heading}
          </motion.h1>
          {subtitle && (
            <motion.p
              {...fade}
              className={`mx-auto mt-5 max-w-xl text-lg ${cover ? "text-white/85" : "text-[var(--events-muted)]"}`}
            >
              {subtitle}
            </motion.p>
          )}
          {event?.eventDate && (
            <motion.p {...fade} className="mt-8 text-sm uppercase tracking-[0.3em]">
              {event.eventDate}
            </motion.p>
          )}
        </div>
      </header>

      {facts.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <dl className="grid gap-8 sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs uppercase tracking-[0.24em] text-[var(--events-muted)]">{fact.label}</dt>
                <dd className="mt-2 text-lg">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {(profile?.googleMapsUrl || messageHref) && (
            <div className="mt-10 flex flex-wrap gap-3">
              {profile?.googleMapsUrl && (
                <a
                  href={profile.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[var(--events-rule)] px-5 py-2.5 text-sm"
                >
                  {t.event.getDirections}
                </a>
              )}
              {messageHref && (
                <a
                  href={messageHref}
                  className="rounded-full bg-[var(--events-ink)] px-5 py-2.5 text-sm text-[var(--events-paper)]"
                >
                  {t.event.messageTheHosts}
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {schedule.length > 0 && (
        <section className="border-t border-[var(--events-rule)]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="text-xs uppercase tracking-[0.24em] text-[var(--events-muted)]">{t.event.runningOrder}</h2>
            <ol className="mt-8 flex flex-col">
              {schedule.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 border-b border-[var(--events-rule)] py-5 last:border-b-0 sm:flex-row sm:gap-8"
                >
                  <span className="w-32 shrink-0 text-sm tabular-nums text-[var(--events-muted)]">{entry.time}</span>
                  <span className="min-w-0">
                    <span className="block text-lg">{entry.title}</span>
                    {entry.detail && (
                      <span className="mt-1 block text-sm text-[var(--events-muted)]">{entry.detail}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {event?.note && (
        <section className="border-t border-[var(--events-rule)]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="text-xs uppercase tracking-[0.24em] text-[var(--events-muted)]">{t.event.goodToKnow}</h2>
            <p className="mt-5 text-lg leading-relaxed">{event.note}</p>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="border-t border-[var(--events-rule)]">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-xs uppercase tracking-[0.24em] text-[var(--events-muted)]">{t.event.memories}</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((url, index) => (
                <SafeImage
                  key={`${url}-${index}`}
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-sm object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <DynamicSections sections={site.sections ?? []} tone="minimal" />

      <footer className="border-t border-[var(--events-rule)]">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-[var(--events-muted)]">
          {site.businessName}
        </div>
      </footer>
    </div>
  );
}
