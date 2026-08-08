"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getAgencyData, getCompleteness, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { themeCssVars } from "@/lib/website/theme-config";

/**
 * The Agency template (PORTFOLIO_BOLD).
 *
 * A business selling outcomes, so the page argues rather than exhibits: what
 * we do, proof it worked, how we run it, who does it, then one way to start.
 * Developer leads with artefacts and Designer with artwork - this one leads
 * with services, and every case study ends on a result rather than a caption.
 *
 * Loud on purpose: heavy uppercase display type, a running marquee, and blocks
 * of flat colour. The shell is near-black with its own palette; the accent
 * still resolves from the owner's brand colour.
 */

interface ProcessStep {
  step: string;
  detail?: string;
}

function asProcess(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ProcessStep => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).step === "string");
}

const SHELL = "#0f0f12";
const BONE = "#f2f0eb";

export function PublicPortfolioSiteAgency({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();
  const [openService, setOpenService] = useState<number | null>(0);

  const data = getAgencyData(normalizePortfolioData(site, { isSample }));
  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const process = asProcess(about.process);

  const hasServices = data.services.length > 0;
  const hasCases = data.caseStudies.length > 0;

  // As in the other three templates: a barely-filled site fills the screen from
  // the hero rather than trailing off into a short stub of a page.
  const { isSparse } = getCompleteness(data);
  const hasTeam = data.team.length > 0;
  const hasReviews = data.reviews.length > 0;

  /**
   * The Agency motion language: things arrive from the side with weight, and
   * the marquee runs continuously. Deliberately not Developer's small rise or
   * Designer's slow uncover - this template is meant to feel like it is moving.
   */
  const push = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x: -28 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-70px" },
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const contactHref = primaryContactHref(data);

  // The marquee repeats the owner's own services rather than invented words.
  const marqueeItems = data.services.map((s) => s.name);

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(site.theme, data.brandColor || undefined), background: SHELL, color: BONE }}
    >
      <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur" style={{ background: `${SHELL}d9` }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <a href="#top" className="text-lg font-extrabold uppercase tracking-tight">
            {data.name}
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.16em] sm:flex">
            {hasServices && <a href="#services" className="hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">{t.nav.services}</a>}
            {hasCases && <a href="#work" className="hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">{t.nav.work}</a>}
            <a href="#contact" className="hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">{t.nav.contact}</a>
          </nav>
          {contactHref && (
            <a
              href={contactHref}
              className="shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0f0f12] transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ background: "var(--accent-solid)" }}
            >
              {t.hero.letsTalk}
            </a>
          )}
        </div>
      </header>

      {/* Hero: oversized uppercase claim, artwork as a flat block beside it. */}
      <section id="top" className={`px-6 pb-14 pt-16 sm:pb-20 sm:pt-24 ${isSparse ? "flex flex-1 items-center" : ""}`}>
        <div className="mx-auto w-full max-w-7xl">
          {data.badge && (
            <motion.p {...push(0)} className="mb-8 inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0f0f12]" style={{ background: "var(--accent-solid)" }}>
              {data.badge}
            </motion.p>
          )}
          <motion.h1 {...push(0.05)} className="max-w-5xl text-[clamp(2.5rem,7.5vw,6.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em]">
            {data.headline || data.name}
          </motion.h1>
          {data.subheadline && (
            <motion.p {...push(0.14)} className="mt-8 max-w-2xl text-lg leading-relaxed opacity-70">
              {data.subheadline}
            </motion.p>
          )}
          <motion.div {...push(0.22)} className="mt-10 flex flex-wrap items-center gap-3">
            {hasCases && (
              <a href="#work" className="px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#0f0f12] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" style={{ background: BONE }}>
                {t.hero.viewWork}
              </a>
            )}
            {hasServices && (
              <a href="#services" className="border-2 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]" style={{ borderColor: BONE }}>
                {t.hero.viewServices}
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* A running strip of the studio's own services. */}
      {marqueeItems.length > 0 && (
        <div className="overflow-hidden border-y-2 py-4" style={{ borderColor: BONE, background: "var(--accent-solid)" }} aria-hidden>
          <motion.div
            className="flex w-max gap-10 whitespace-nowrap text-lg font-extrabold uppercase tracking-tight text-[#0f0f12]"
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={reduceMotion ? undefined : { duration: 26, ease: "linear", repeat: Infinity }}
          >
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                {item} <span className="opacity-50">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}

      {/* Services as large expandable rows - the centrepiece of this template. */}
      {hasServices && (
        <section id="services" className="px-6 py-20">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.nav.services}</h2>
            <ul>
              {data.services.map((item, i) => {
                const isOpen = openService === i;
                return (
                  <li key={item.id} className="border-t border-white/15 last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpenService(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-center justify-between gap-6 py-7 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                    >
                      <span className="flex items-baseline gap-5">
                        <span className="text-xs font-bold opacity-40">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-2xl font-extrabold uppercase tracking-tight transition-colors group-hover:text-[var(--accent-solid)] sm:text-4xl">
                          {item.name}
                        </span>
                      </span>
                      <span aria-hidden className={`text-2xl transition-transform ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {isOpen && item.description && (
                      <p className="max-w-2xl pb-7 ps-12 text-base leading-relaxed opacity-70">{item.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Case studies: artwork, then client / service / result. */}
      {hasCases && (
        <section id="work" className="px-6 py-20">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.section.selectedWork}</h2>
            <div className="flex flex-col gap-16">
              {data.caseStudies.map((item, i) => (
                <motion.article
                  key={item.id}
                  {...push(0)}
                  className={`grid gap-8 lg:items-end ${item.imageUrl ? "lg:grid-cols-[1.3fr_0.7fr]" : ""}`}
                >
                  {item.imageUrl && (
                    <figure className="overflow-hidden">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title ? `${item.title}${item.subtitle ? ` - ${item.subtitle}` : ""}` : `${t.section.work} ${i + 1}`}
                        className={`aspect-[16/10] w-full object-cover transition-transform duration-700 ${reduceMotion ? "" : "hover:scale-[1.02]"}`}
                      />
                    </figure>
                  )}
                  <div>
                    <h3 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
                      {item.title || `${t.section.work} ${String(i + 1).padStart(2, "0")}`}
                    </h3>
                    {item.year && <p className="mt-2 text-sm opacity-45">{item.year}</p>}
                    {item.subtitle && (
                      <dl className="mt-5 flex gap-3 text-sm">
                        <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.16em] opacity-40">{t.nav.services}</dt>
                        <dd className="opacity-80">{item.subtitle}</dd>
                      </dl>
                    )}
                    {item.tags.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] opacity-55">
                        {item.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    {/* The outcome is the point of an agency case study, so the
                        owner's own summary gets the accent and the largest type
                        in the block. Nothing is invented when it is blank. */}
                    {item.summary && (
                      <p
                        className="mt-6 border-t-2 pt-4 text-xl font-extrabold uppercase leading-tight"
                        style={{ borderColor: "var(--accent-solid)" }}
                      >
                        {item.summary}
                      </p>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block text-sm font-bold uppercase tracking-[0.16em] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                        style={{ color: "var(--accent-solid)" }}
                      >
                        {t.work.viewProject} ↗
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process: numbered steps across, not a vertical list. */}
      {process.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.nav.about}</h2>
            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {process.map((step, i) => (
                <motion.li key={step.step} {...push(i * 0.06)} className="border-t-2 pt-5" style={{ borderColor: "var(--accent-solid)" }}>
                  <span className="text-4xl font-extrabold opacity-25">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-xl font-extrabold uppercase tracking-tight">{step.step}</h3>
                  {step.detail && <p className="mt-2 text-sm leading-relaxed opacity-65">{step.detail}</p>}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {hasTeam && (
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.section.about}</h2>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {data.team.map((member, i) => (
                <motion.li key={i} {...push(i * 0.06)}>
                  {member.imageUrl && (
                    <SafeImage src={member.imageUrl} alt="" className="mb-4 aspect-square w-full max-w-[220px] object-cover" />
                  )}
                  <p className="text-xl font-extrabold uppercase tracking-tight">{member.name}</p>
                  {member.role && <p className="mt-1 text-sm opacity-60">{member.role}</p>}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {hasReviews && (
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.nav.contact}</h2>
            <div className="grid gap-12 lg:grid-cols-2">
              {data.reviews.map((item, i) => (
                <motion.figure key={i} {...push(i * 0.06)}>
                  <blockquote className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] opacity-60">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conversion finale: the whole block is the call to action. */}
      <section id="contact" className="px-6 py-24" style={{ background: "var(--accent-solid)", color: SHELL }}>
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="max-w-4xl text-[clamp(2.25rem,6vw,5rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.02em]">
            {t.contact.letsWorkTogether}
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {contactHref && (
              <a href={contactHref} className="px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" style={{ background: SHELL }}>
                {data.contact.email ?? t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                style={{ borderColor: SHELL }}
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em] opacity-55">
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-6">
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">
                {social.label}
              </a>
            ))}
            {data.contact.address && <span>{data.contact.address}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
