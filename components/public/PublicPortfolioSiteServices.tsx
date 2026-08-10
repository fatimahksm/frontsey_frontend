"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getCompleteness, getServicesData, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { themeCssVars } from "@/lib/website/theme-config";

/**
 * The Freelancer / Services template (PORTFOLIO_PROFILE).
 *
 * For anyone who sells their time - a coach, a trainer, a marketer, a makeup
 * artist. The page has one job: get the visitor to book. So it is ordered as a
 * decision, not as a story - who you are in two lines, what you charge, how it
 * works, proof, the usual questions, then a way to reach you - and the booking
 * action is never more than a scroll away, pinned to the bottom of the screen
 * on a phone where the header has scrolled off.
 *
 * Deliberately light. The other three portfolio templates are dark, warm paper
 * and near-black; a page asking for money reads better bright and plain. The
 * accent still resolves from the owner's brand colour through `themeCssVars`.
 *
 * Past work is present but secondary: a small even grid rather than the
 * full-width stacked panels this template used to run, which turned three
 * projects into three screens of scrolling and buried the prices under them.
 */

interface ExperienceEntry {
  year: string;
  role: string;
  company: string;
  detail?: string;
}

interface ProcessStep {
  step: string;
  detail?: string;
}

function asExperience(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ExperienceEntry => {
    if (!v || typeof v !== "object") return false;
    const e = v as Record<string, unknown>;
    return typeof e.year === "string" && typeof e.role === "string" && typeof e.company === "string";
  });
}

function asProcess(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ProcessStep => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).step === "string");
}

/** The template's own tokens. Light, plain, high contrast. */
const SHELL = "#ffffff";
const TINT = "#f6f6f7";
const INK = "#16181d";
const MUTED = "#5c6270";
const LINE = "rgba(22,24,29,0.10)";

export function PublicPortfolioSiteServices({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const data = getServicesData(normalizePortfolioData(site, { isSample }));

  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const experience = asExperience(about.experience);
  const process = asProcess(about.process);

  const hasExpertise = data.expertise.length > 0;
  const hasProjects = data.projects.length > 0;
  const hasRecommendations = data.recommendations.length > 0;
  const hasFaq = data.faq.length > 0;
  const hasPricing = data.expertise.some((item) => item.price !== null && item.price !== undefined);

  // As in the other three templates: too little content collapses to one
  // deliberate screen rather than a page with its middle missing.
  const { isSparse } = getCompleteness(data);

  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-70px" },
          transition: { duration: 0.45, delay, ease: [0.25, 0.8, 0.35, 1] as const },
        };

  const contactHref = primaryContactHref(data);
  const bookHref = data.contact.whatsappNumber ? whatsappUrl(data.contact.whatsappNumber, "") : contactHref;
  // Logo, then cover, then the About image. A person selling a service leads
  // with their own face or mark; the About illustration is the last resort
  // because it is usually a picture of the work, not of them.
  const portrait = data.logoUrl ?? data.coverImageUrl ?? data.bioImageUrl;

  const nav = [
    ...(hasExpertise ? [{ href: "#packages", label: hasPricing ? t.work.packages : t.nav.services }] : []),
    ...(hasProjects ? [{ href: "#work", label: t.nav.work }] : []),
    ...(hasFaq ? [{ href: "#faq", label: t.section.faq }] : []),
  ];

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(site.theme, data.brandColor || undefined), background: SHELL, color: INK }}
    >
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: LINE, background: "rgba(255,255,255,0.88)" }}>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-5 px-5 py-3.5 sm:px-8">
          <a href="#top" className="truncate text-sm font-semibold tracking-tight">
            {data.name}
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-6 text-sm sm:flex" style={{ color: MUTED }}>
            {nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[color:var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {bookHref && (
            <a
              href={bookHref}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
            >
              {t.work.bookNow}
            </a>
          )}
        </div>
      </header>

      {/* Hero: two lines and a button. Anything longer delays the decision. */}
      <section id="top" className={`px-5 py-12 sm:px-8 sm:py-16 ${isSparse ? "flex flex-1 items-center" : ""}`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
          {portrait && (
            <motion.figure
              {...rise(0)}
              className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-36"
              style={{ background: TINT }}
            >
              <SafeImage src={portrait} alt="" className="h-full w-full object-cover" />
            </motion.figure>
          )}
          <div className="min-w-0">
            {data.badge && (
              <motion.p
                {...rise(0.04)}
                className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: TINT, color: "var(--accent-solid)" }}
              >
                {data.badge}
              </motion.p>
            )}
            <motion.h1 {...rise(0.08)} className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight">
              {data.headline || data.name}
            </motion.h1>
            {data.subheadline && (
              <motion.p {...rise(0.14)} className="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: MUTED }}>
                {data.subheadline}
              </motion.p>
            )}
            <motion.div {...rise(0.2)} className="mt-6 flex flex-wrap items-center gap-3">
              {bookHref && (
                <a
                  href={bookHref}
                  className="rounded-full px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                  style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
                >
                  {t.work.bookNow}
                </a>
              )}
              {hasExpertise && (
                <a
                  href="#packages"
                  className="rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                  style={{ borderColor: LINE }}
                >
                  {hasPricing ? t.work.packages : t.hero.viewServices}
                </a>
              )}
            </motion.div>
            {data.contact.address && (
              <p className="mt-5 text-sm" style={{ color: MUTED }}>
                {data.contact.address}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Packages: the centrepiece. Price first, because that is the question. */}
      {hasExpertise && (
        <section id="packages" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16" style={{ background: TINT }}>
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{hasPricing ? t.work.packages : t.nav.services}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.expertise.map((item, i) => (
                <motion.li
                  key={item.id}
                  {...rise(Math.min(i, 4) * 0.05)}
                  className="flex flex-col rounded-2xl border p-6"
                  style={{ background: SHELL, borderColor: LINE }}
                >
                  <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
                  {item.price !== null && item.price !== undefined && (
                    <p className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(item.price, site.currency)}</p>
                  )}
                  {item.description && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                      {item.description}
                    </p>
                  )}
                  {bookHref && (
                    <a
                      href={bookHref}
                      className="mt-6 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                      style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
                    >
                      {t.work.bookNow}
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* How it works: a short numbered strip, so "what happens after I book"
          is answered before it becomes a reason not to. */}
      {process.length > 0 && (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.section.process}</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {process.map((step, i) => (
                <motion.li key={step.step} {...rise(Math.min(i, 4) * 0.05)}>
                  <span className="text-sm font-semibold" style={{ color: "var(--accent-solid)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 font-semibold tracking-tight">{step.step}</h3>
                  {step.detail && (
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                      {step.detail}
                    </p>
                  )}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* About: one short block, not a chapter. */}
      {(data.story || experience.length > 0) && (
        <section id="about" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16" style={{ background: TINT }}>
          <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.nav.about}</h2>
              {data.story && (
                <motion.p {...rise(0)} className="mt-5 text-base leading-relaxed" style={{ color: MUTED }}>
                  {data.story}
                </motion.p>
              )}
            </div>
            {experience.length > 0 && (
              <ol className="flex flex-col">
                {experience.map((entry) => (
                  <motion.li
                    key={`${entry.year}-${entry.company}`}
                    {...rise(0)}
                    className="grid gap-1 border-b py-4 sm:grid-cols-[130px_1fr] sm:gap-6"
                    style={{ borderColor: LINE }}
                  >
                    <p className="text-sm" style={{ color: MUTED }}>
                      {entry.year}
                    </p>
                    <div>
                      <p className="font-medium">
                        {entry.role} <span style={{ color: MUTED }}>· {entry.company}</span>
                      </p>
                      {entry.detail && (
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                          {entry.detail}
                        </p>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {/* Recent work: supporting evidence, at supporting-evidence size. */}
      {hasProjects && (
        <section id="work" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.nav.work}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.projects.map((item, i) => (
                <motion.li
                  key={item.id}
                  {...rise(Math.min(i, 4) * 0.05)}
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: LINE }}
                >
                  {item.imageUrl && (
                    <SafeImage src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-semibold tracking-tight">
                        {item.title || `${t.nav.projects} ${String(i + 1).padStart(2, "0")}`}
                      </h3>
                      {item.year && (
                        <span className="text-xs" style={{ color: MUTED }}>
                          {item.year}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="mt-1 text-xs font-medium" style={{ color: "var(--accent-solid)" }}>
                        {item.subtitle}
                      </p>
                    )}
                    {item.summary && (
                      <p className="mt-2.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                        {item.summary}
                      </p>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                        style={{ color: "var(--accent-solid)" }}
                      >
                        {t.work.viewProject} ↗
                      </a>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {hasRecommendations && (
        <section className="px-5 py-12 sm:px-8 sm:py-16" style={{ background: TINT }}>
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.section.testimonials}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {data.recommendations.map((item, i) => (
                <motion.figure
                  key={i}
                  {...rise(Math.min(i, 3) * 0.05)}
                  className="rounded-2xl border p-6"
                  style={{ background: SHELL, borderColor: LINE }}
                >
                  <blockquote className="text-base leading-relaxed">&ldquo;{item.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 text-sm" style={{ color: MUTED }}>
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions: the last objections, answered before the ask. */}
      {hasFaq && (
        <section id="faq" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.section.faq}</h2>
            <ul className="mt-8 flex flex-col">
              {data.faq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <li key={i} className="border-b" style={{ borderColor: LINE }}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-5 py-4 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                    >
                      <span className="font-medium">{item.question}</span>
                      <span aria-hidden className={`shrink-0 text-lg transition-transform ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="pb-5 pe-8 text-sm leading-relaxed" style={{ color: MUTED }}>
                        {item.answer}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* The ask. */}
      <section id="contact" className="scroll-mt-16 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
        <div
          className="mx-auto w-full max-w-5xl rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16"
          style={{ background: INK, color: SHELL }}
        >
          <motion.h2 {...rise(0)} className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight">
            {t.contact.letsWorkTogether}
          </motion.h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {data.contact.email ?? t.contact.getInTouch}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 sm:px-8">
        <div
          className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm"
          style={{ borderColor: LINE, color: MUTED }}
        >
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--accent-solid)]">
                {social.label}
              </a>
            ))}
            {data.contact.phone && <span>{data.contact.phone}</span>}
          </div>
        </div>
      </footer>

      {/* On a phone the header scrolls away, and this template's whole purpose
          is the booking action - so it stays pinned instead. */}
      {bookHref && (
        <div
          // ps-32 clears the fixed language switcher pinned bottom-left, which
          // would otherwise sit on top of the one button this page exists for.
          className="sticky bottom-0 z-30 border-t py-3 pe-5 ps-32 sm:hidden"
          style={{ borderColor: LINE, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)" }}
        >
          <a
            href={bookHref}
            className="block rounded-full px-5 py-3 text-center text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
            style={{ background: "var(--accent-solid)", color: "var(--accent-contrast)" }}
          >
            {t.work.bookNow}
          </a>
        </div>
      )}
    </div>
  );
}
