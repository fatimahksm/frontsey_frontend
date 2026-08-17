"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import { PortfolioWordmark } from "@/components/public/PortfolioWordmark";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getCompleteness, getProfessionalData, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The Developer template (PORTFOLIO_HERO).
 *
 * Built for one reader: someone deciding whether to hire this person to write
 * software. That is why the page leads with work rather than a mission
 * statement, and why almost nothing here is a card - a developer is judged on
 * what shipped, so projects get full-width alternating rows with their stack
 * and links attached, and everything else stays a dense, scannable index.
 *
 * The shell owns its own colours. `themeCssVars` publishes the palette as
 * variables rather than painting background and text inline, precisely so a
 * template with a deliberate dark shell can decline it - the accent still comes
 * from the theme, so an owner's brand colour applies where it belongs.
 */

/** Optional extras the owner's ABOUT section may carry. All absent by default. */
interface ExperienceEntry {
  year: string;
  role: string;
  company: string;
  detail?: string;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asExperience(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ExperienceEntry => {
    if (!v || typeof v !== "object") return false;
    const e = v as Record<string, unknown>;
    return typeof e.year === "string" && typeof e.role === "string" && typeof e.company === "string";
  });
}

/** The section marker used throughout: a monospace index and a rule. */
function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-baseline gap-3 border-b border-[var(--theme-border)] pb-3">
      <span className="font-mono text-xs text-[var(--accent-solid)]">{index}</span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{children}</h2>
    </div>
  );
}

export function PublicPortfolioSiteProfessional({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();
  const [openCapability, setOpenCapability] = useState<number | null>(null);

  // Sample mode arrives as a prop from the caller that chose to render mock
  // content. It is never derived from the response, because every field there
  // is user-editable - an owner who slugs their site "preview" must not start
  // seeing demo content on it.
  const data = getProfessionalData(normalizePortfolioData(site, { isSample }));

  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const stack = asStringArray(about.stack);
  const experience = asExperience(about.experience);

  const hasProjects = data.projects.length > 0;
  const hasCapabilities = data.expertise.length > 0;
  const hasRecommendations = data.recommendations.length > 0;

  // A site with almost nothing in it should read as a deliberate one-screen
  // card, not as a full page with the middle cut out. Letting the hero grow
  // does that with no separate layout to maintain: the shell is a column, so
  // the hero takes the slack and the footer settles at the bottom of the
  // viewport instead of halfway up it.
  const { isSparse } = getCompleteness(data);

  // One motion vocabulary for the page: a short rise on entry, no bounce, and
  // nothing at all when the visitor has asked for reduced motion.
  const rise = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.5 },
      };

  const contactHref = primaryContactHref(data);

  const navLinks = [
    ...(hasProjects ? [{ href: "#work", label: t.nav.work }] : []),
    ...(hasCapabilities ? [{ href: "#capabilities", label: t.nav.services }] : []),
    ...(data.bio || experience.length > 0 ? [{ href: "#about", label: t.nav.about }] : []),
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <div
      dir={dir}
      // The palette is the owner's, not the file's. This template used to be
      // #08090c with white type baked in, which made the theme editor a no-op
      // on a portfolio: an owner picked colours, saved, and nothing moved.
      // Everything below is now a mix of --background and --foreground, so the
      // dense, monospaced, file-listing character survives any palette.
      className="flex flex-1 flex-col bg-background text-foreground selection:bg-[var(--accent-solid)] selection:text-[var(--accent-contrast)]"
      style={themeCssVars(effectiveTheme(site.theme, site.layoutVariant), data.brandColor || undefined)}
    >
      {/* Reads like a file listing rather than a marketing header. */}
      <header className="sticky top-0 z-30 border-b border-[var(--theme-border)] bg-[color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <PortfolioWordmark
            logoUrl={data.logoUrl}
            name={data.name}
            size="h-7 w-7"
            rounding="rounded-md"
            className="font-mono text-sm font-semibold tracking-tight text-foreground"
          />
          <nav aria-label="Sections" className="hidden items-center gap-6 font-mono text-xs text-[var(--theme-text-muted)] sm:flex">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
              >
                <span className="text-[var(--accent-solid)]">{String(i + 1).padStart(2, "0")}</span> {link.label}
              </a>
            ))}
          </nav>
          {contactHref && (
            <a
              href={contactHref}
              className="shrink-0 rounded-md border border-[color-mix(in_srgb,var(--foreground)_22%,transparent)] px-3.5 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-[var(--accent-solid)] hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
            >
              {t.nav.contact}
            </a>
          )}
        </div>
      </header>

      {/* Type-led, left-aligned, over a faint technical grid. */}
      <section
        id="top"
        className={`relative overflow-hidden border-b border-[var(--theme-border)] px-6 py-20 sm:py-28 ${
          isSparse ? "flex flex-1 items-center" : ""
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 60% at 30% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 30% 0%, black, transparent)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl">
          {data.badge && (
            <motion.p {...rise} className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-[var(--theme-text-muted)]">
              <span className="relative flex h-2 w-2">
                {!reduceMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {data.badge}
            </motion.p>
          )}
          <motion.h1 {...rise} className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {data.name}
          </motion.h1>
          {data.headline && (
            <motion.p
              {...rise}
              transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.08 }}
              className="mt-3 font-mono text-lg text-[var(--accent-solid)] sm:text-2xl"
            >
              {data.headline}
            </motion.p>
          )}
          {data.subheadline && (
            <motion.p
              {...rise}
              transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--theme-text-muted)]"
            >
              {data.subheadline}
            </motion.p>
          )}
          <motion.div
            {...rise}
            transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.24 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            {hasProjects && (
              <a
                href="#work"
                className="rounded-md bg-[var(--accent-solid)] px-5 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.hero.viewWork}
              </a>
            )}
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-md border border-[color-mix(in_srgb,var(--foreground)_22%,transparent)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_50%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.hero.getInTouch}
              </a>
            )}
            {/* The one thing this template exists for that the others do not
                need: whoever is reading a CV site usually wants the file. */}
            {data.cvUrl && (
              <a
                href={data.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[color-mix(in_srgb,var(--foreground)_22%,transparent)] px-5 py-3 font-mono text-sm text-[color-mix(in_srgb,var(--foreground)_82%,transparent)] transition-colors hover:border-[var(--accent-solid)] hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.work.downloadCv} ↓
              </a>
            )}
          </motion.div>
          {data.contact.address && <p className="mt-8 font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">{data.contact.address}</p>}
        </div>
      </section>

      {/* A dense inline run of labels, not one card per technology. */}
      {stack.length > 0 && (
        <section aria-label={t.work.skills} className="border-b border-[var(--theme-border)] px-6 py-10">
          <ul className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-6 gap-y-3 font-mono text-sm text-[var(--theme-text-muted)]">
            {stack.map((tech) => (
              <li key={tech} className="transition-colors hover:text-foreground">
                <span className="text-[var(--accent-solid)]">/</span> {tech}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasProjects && (
        <section id="work" className="border-b border-[var(--theme-border)] px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="01">{t.nav.work}</SectionLabel>
            <div className="flex flex-col gap-20">
              {data.projects.map((item, i) => {
                // A project with only a picture still has to look composed, so
                // the text column carries the index and stays put whether or
                // not the owner has written anything yet.
                return (
                  <motion.article key={item.id} {...rise} className="grid items-center gap-8 lg:grid-cols-2">
                    {item.imageUrl && (
                      <figure
                        className={`overflow-hidden rounded-lg border border-[var(--theme-border)] bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] ${i % 2 === 1 ? "lg:order-2" : ""}`}
                      >
                        <SafeImage src={item.imageUrl} alt={item.title} className="aspect-[16/10] w-full object-cover" />
                      </figure>
                    )}
                    <div className={item.imageUrl ? "" : "lg:col-span-2"}>
                      <span className="font-mono text-xs text-[var(--accent-solid)]">{String(i + 1).padStart(2, "0")}</span>
                      {item.title && (
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{item.title}</h3>
                      )}
                      {(item.subtitle || item.year) && (
                        <p className="mt-1 font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">
                          {[item.subtitle, item.year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {item.summary && <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--theme-text-muted)]">{item.summary}</p>}
                      {item.tags.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <li key={tag} className="rounded border border-[var(--theme-border)] px-2 py-1 font-mono text-[11px] text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                      {(item.repoUrl || item.liveUrl) && (
                        <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs">
                          {item.liveUrl && (
                            <a
                              href={item.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--accent-solid)] underline-offset-4 hover:underline"
                            >
                              {t.work.viewProject} ↗
                            </a>
                          )}
                          {item.repoUrl && (
                            <a
                              href={item.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--theme-text-muted)] underline-offset-4 hover:text-foreground hover:underline"
                            >
                              {t.work.moreDetails} ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* An expandable index rather than service cards. */}
      {hasCapabilities && (
        <section id="capabilities" className="border-b border-[var(--theme-border)] px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="02">{t.nav.services}</SectionLabel>
            <ul className="flex flex-col">
              {data.expertise.map((item, i) => {
                const isOpen = openCapability === i;
                return (
                  <li key={item.id} className="border-b border-[var(--theme-border)] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenCapability(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-lg font-medium sm:text-2xl">{item.name}</span>
                      </span>
                      <span aria-hidden className={`font-mono text-sm transition-transform ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {isOpen && item.description && (
                      <p className="max-w-2xl pb-5 ps-10 text-sm leading-relaxed text-[var(--theme-text-muted)]">{item.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {(data.bio || experience.length > 0) && (
        <section id="about" className="border-b border-[var(--theme-border)] px-6 py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_1.1fr]">
            {data.bio && (
              <div>
                <SectionLabel index="03">{t.nav.about}</SectionLabel>
                <motion.p {...rise} className="max-w-xl text-lg leading-relaxed text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]">
                  {data.bio}
                </motion.p>
              </div>
            )}
            {experience.length > 0 && (
              <div>
                <SectionLabel index="04">{t.section.work}</SectionLabel>
                <ol className="relative flex flex-col gap-8 border-s border-[var(--theme-border)] ps-6">
                  {experience.map((entry) => (
                    <motion.li key={`${entry.year}-${entry.company}`} {...rise} className="relative">
                      <span aria-hidden className="absolute -start-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-[var(--accent-solid)]" />
                      <p className="font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">{entry.year}</p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {entry.role} <span className="text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]">·</span> <span className="text-[var(--theme-text-muted)]">{entry.company}</span>
                      </p>
                      {entry.detail && <p className="mt-1 text-sm leading-relaxed text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">{entry.detail}</p>}
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {hasRecommendations && (
        <section className="border-b border-[var(--theme-border)] px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="05">{t.section.testimonials}</SectionLabel>
            <div className="grid gap-10 sm:grid-cols-2">
              {data.recommendations.map((item, i) => (
                <motion.figure key={i} {...rise} className="border-s-2 border-[var(--accent-solid)]/40 ps-5">
                  <blockquote className="text-base leading-relaxed text-[color-mix(in_srgb,var(--foreground)_82%,transparent)]">{item.quote}</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    <span className="font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">{item.name}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="px-6 py-24">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 {...rise} className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {t.contact.letsWorkTogether}
          </motion.h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-md bg-[var(--accent-solid)] px-5 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[color-mix(in_srgb,var(--foreground)_22%,transparent)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_50%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--theme-border)] px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-[color-mix(in_srgb,var(--foreground)_52%,transparent)]">
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-5">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="hover:text-foreground">
                {data.contact.email}
              </a>
            )}
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
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
