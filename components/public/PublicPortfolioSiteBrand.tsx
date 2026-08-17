"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SafeImage } from "@/components/public/SafeImage";
import { PortfolioWordmark } from "@/components/public/PortfolioWordmark";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getBrandData, getCompleteness, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The Brand / Product template (PORTFOLIO_BOLD).
 *
 * For someone with something to sell and a story behind it - a small business,
 * a maker, a personal brand. The page runs like a shop front: a statement, the
 * things themselves, what they cost, who made them, and where to follow along.
 *
 * The loud parts - heavy uppercase display type, a running marquee, flat blocks
 * of colour - are what distinguishes this template, so they stay. What is gone
 * is the scale: the previous version set the hero at 7.5vw and ran case studies
 * as full-width rows, which on a wide screen produced a headline taller than a
 * person and images that filled the viewport one at a time. Type is now capped,
 * products are an even grid, and the widest column is 72rem instead of 80.
 *
 * The shell owns its palette - a brand page needs its own ground, not the
 * visitor's colour scheme - while the accent resolves from the owner's brand
 * colour, and `--accent-contrast` keeps text on that accent readable whatever
 * they picked.
 */

interface ProcessStep {
  step: string;
  detail?: string;
}

function asProcess(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ProcessStep => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).step === "string");
}

/**
 * The template's own tokens, now read from the site's theme.
 *
 * Every portfolio template painted a fixed shell, so the theme editor did
 * nothing at all on a portfolio - an owner saved a palette and the page stayed
 * exactly as it was. These derive from the two colours the owner actually
 * picks, so light and dark palettes both hold together with no per-theme
 * branch below, while the template keeps its own type, weight and proportions.
 */
const SHELL = "var(--background)";
const PANEL = "color-mix(in srgb, var(--foreground) 8%, var(--background))";
const BONE = "var(--foreground)";
const LINE = "rgba(242,240,235,0.14)";

export function PublicPortfolioSiteBrand({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();

  const data = getBrandData(normalizePortfolioData(site, { isSample }));
  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const process = asProcess(about.process);

  const hasServices = data.services.length > 0;
  const hasCases = data.caseStudies.length > 0;
  const hasTeam = data.team.length > 0;
  const hasReviews = data.reviews.length > 0;

  // As in the other three templates: too little content collapses to one
  // deliberate screen rather than a page with its middle missing.
  const { isSparse } = getCompleteness(data);

  /** Things arrive from the side with weight. This page is meant to move. */
  const push = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x: -24 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-70px" },
          transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const contactHref = primaryContactHref(data);
  const shopHref = data.contact.whatsappNumber ? whatsappUrl(data.contact.whatsappNumber, "") : contactHref;

  // The marquee repeats the owner's own product names rather than invented words.
  const marqueeItems = data.services.map((s) => s.name);
  // The hero picture: the cover if there is one, else the first piece of work.
  const heroImage = data.coverImageUrl ?? data.caseStudies.find((item) => item.imageUrl)?.imageUrl ?? null;

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), data.brandColor || undefined), background: SHELL, color: BONE }}
    >
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: LINE, background: "color-mix(in srgb, var(--background) 88%, transparent)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-3.5 sm:px-8">
          <PortfolioWordmark
            logoUrl={data.logoUrl}
            name={data.name}
            size="h-8 w-8"
            rounding="rounded-none"
            className="text-base font-extrabold uppercase tracking-tight"
          />
          <nav aria-label="Sections" className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.14em] sm:flex">
            {hasServices && (
              <a href="#shop" className="opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.services}
              </a>
            )}
            {hasCases && (
              <a href="#work" className="opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.work}
              </a>
            )}
            {data.bio && (
              <a href="#story" className="opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.about}
              </a>
            )}
          </nav>
          {shopHref && (
            <a
              href={shopHref}
              className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
            >
              {t.hero.letsTalk}
            </a>
          )}
        </div>
      </header>

      {/* Hero: a statement beside the thing itself, at a size that fits on a
          screen rather than filling three of them. */}
      <section id="top" className={`px-5 py-12 sm:px-8 sm:py-16 ${isSparse ? "flex flex-1 items-center" : ""}`}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            {data.badge && (
              <motion.p
                {...push(0)}
                className="mb-6 inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"
                style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
              >
                {data.badge}
              </motion.p>
            )}
            <motion.h1
              {...push(0.05)}
              className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]"
            >
              {data.headline || data.name}
            </motion.h1>
            {data.subheadline && (
              <motion.p {...push(0.12)} className="mt-6 max-w-xl text-base leading-relaxed opacity-70 sm:text-lg">
                {data.subheadline}
              </motion.p>
            )}
            <motion.div {...push(0.18)} className="mt-8 flex flex-wrap items-center gap-3">
              {hasServices && (
                <a
                  href="#shop"
                  className="px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ background: BONE, color: SHELL }}
                >
                  {t.hero.viewServices}
                </a>
              )}
              {hasCases && (
                <a
                  href="#work"
                  className="border-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-current/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                  style={{ borderColor: BONE }}
                >
                  {t.hero.viewWork}
                </a>
              )}
            </motion.div>
          </div>

          {heroImage && (
            <motion.figure {...push(0.1)} className="overflow-hidden" style={{ background: PANEL }}>
              {/* A fixed, modest height rather than an aspect ratio - a ratio in
                  a half-width column grows past the text beside it on a wide
                  screen and leaves the hero mostly empty. */}
              <SafeImage src={heroImage} alt="" className="h-56 w-full object-cover sm:h-72 lg:h-[24rem]" />
            </motion.figure>
          )}
        </div>
      </section>

      {/* A running strip of the owner's own product names. */}
      {marqueeItems.length > 0 && (
        <div className="overflow-hidden border-y py-2.5" style={{ borderColor: LINE, background: "var(--accent-solid)" }} aria-hidden>
          <motion.div
            className="flex w-max gap-8 whitespace-nowrap text-sm font-extrabold uppercase tracking-tight"
            style={{ color: "var(--accent-contrast)" }}
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={reduceMotion ? undefined : { duration: 26, ease: "linear", repeat: Infinity }}
          >
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-8">
                {item} <span className="opacity-50">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}

      {/* The things themselves. A product grid, not an accordion: an accordion
          hides everything a shop front exists to show. */}
      {hasServices && (
        <section id="shop" className="scroll-mt-16 px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.nav.services}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((item, i) => (
                <motion.li key={item.id} {...push(Math.min(i, 4) * 0.05)} className="flex flex-col">
                  <span className="block overflow-hidden" style={{ background: PANEL }}>
                    {item.imageUrl ? (
                      <SafeImage src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      // No picture is a normal state for a young shop; a numbered
                      // panel keeps the grid even instead of leaving a hole.
                      <span className="flex aspect-[4/3] w-full items-center justify-center text-3xl font-extrabold opacity-20">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </span>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-extrabold uppercase tracking-tight">{item.name}</h3>
                    {item.price !== null && item.price !== undefined && (
                      <span className="shrink-0 text-base font-bold" style={{ color: "var(--accent-solid)" }}>
                        {formatMoney(item.price, site.currency)}
                      </span>
                    )}
                  </div>
                  {item.description && <p className="mt-2 flex-1 text-sm leading-relaxed opacity-65">{item.description}</p>}
                  {shopHref && (
                    <a
                      href={shopHref}
                      className="mt-4 inline-block self-start border-b-2 pb-0.5 text-xs font-bold uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                      style={{ borderColor: "var(--accent-solid)" }}
                    >
                      {t.hero.getInTouch}
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Work: what has been made. Even tiles, after the shop. */}
      {hasCases && (
        <section id="work" className="scroll-mt-16 px-5 py-14 sm:px-8 sm:py-20" style={{ background: PANEL }}>
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.section.selectedWork}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.caseStudies.map((item, i) => (
                <motion.li key={item.id} {...push(Math.min(i, 4) * 0.05)}>
                  {item.imageUrl && (
                    <span className="block overflow-hidden" style={{ background: SHELL }}>
                      <SafeImage src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                    </span>
                  )}
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-extrabold uppercase tracking-tight">
                      {item.title || `${t.section.work} ${String(i + 1).padStart(2, "0")}`}
                    </h3>
                    {item.year && <span className="shrink-0 text-xs opacity-45">{item.year}</span>}
                  </div>
                  {item.subtitle && (
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent-solid)" }}>
                      {item.subtitle}
                    </p>
                  )}
                  {item.summary && <p className="mt-2.5 text-sm leading-relaxed opacity-65">{item.summary}</p>}
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.14em] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                      style={{ color: "var(--accent-solid)" }}
                    >
                      {t.work.viewProject} ↗
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* The story, and how it gets made, in one band. */}
      {(data.bio || process.length > 0) && (
        <section id="story" className="scroll-mt-16 px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.work.story}</h2>
            {data.bio && (
              <motion.p {...push(0)} className="mt-6 max-w-3xl text-xl leading-relaxed sm:text-2xl">
                {data.bio}
              </motion.p>
            )}
            {process.length > 0 && (
              <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {process.map((step, i) => (
                  <motion.li key={step.step} {...push(Math.min(i, 4) * 0.05)} className="border-t pt-4" style={{ borderColor: LINE }}>
                    <span className="text-xs font-bold" style={{ color: "var(--accent-solid)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1.5 text-base font-extrabold uppercase tracking-tight">{step.step}</h3>
                    {step.detail && <p className="mt-1.5 text-sm leading-relaxed opacity-60">{step.detail}</p>}
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {hasTeam && (
        <section className="px-5 py-14 sm:px-8 sm:py-20" style={{ background: PANEL }}>
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.section.team}</h2>
            <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
              {data.team.map((member, i) => (
                <motion.li key={i} {...push(Math.min(i, 4) * 0.05)} className="flex items-center gap-3">
                  {member.imageUrl && <SafeImage src={member.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />}
                  <span>
                    <span className="block text-sm font-bold uppercase tracking-tight">{member.name}</span>
                    {member.role && <span className="block text-xs opacity-55">{member.role}</span>}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {hasReviews && (
        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">{t.section.testimonials}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {data.reviews.map((item, i) => (
                <motion.figure key={i} {...push(Math.min(i, 3) * 0.05)} className="border-t pt-5" style={{ borderColor: LINE }}>
                  <blockquote className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] opacity-55">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conversion finale: the whole block is the call to action, and a brand
          lives on its socials, so those get real buttons rather than the grey
          run of text in the footer. */}
      <section
        id="contact"
        className="scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20"
        style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="max-w-3xl text-[clamp(1.875rem,4.2vw,3.5rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em]">
            {t.contact.letsWorkTogether}
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {contactHref && (
              <a
                href={contactHref}
                className="px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                style={{ background: SHELL, color: BONE }}
              >
                {data.contact.email ?? t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-current/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                style={{ borderColor: "currentColor" }}
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>

          {data.socials.length > 0 && (
            <div className="mt-12 border-t-2 pt-6" style={{ borderColor: "currentColor" }}>
              <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-60">{t.work.followAlong}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {data.socials.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:bg-current/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    style={{ borderColor: "currentColor" }}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.14em] opacity-55">
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-5">
            {data.contact.address && <span>{data.contact.address}</span>}
            {data.contact.phone && <span>{data.contact.phone}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
