"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getDeveloperData, normalizePortfolioData } from "@/lib/website/portfolio-data";
import { themeCssVars } from "@/lib/website/theme-config";

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

interface ProjectMeta {
  name: string;
  role?: string;
  tech?: string[];
  repo?: string | null;
  live?: string | null;
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

function asProjectMeta(value: unknown): ProjectMeta[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is ProjectMeta => !!v && typeof v === "object" && typeof (v as Record<string, unknown>).name === "string");
}

/** The section marker used throughout: a monospace index and a rule. */
function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-baseline gap-3 border-b border-white/10 pb-3">
      <span className="font-mono text-xs text-[var(--accent-solid)]">{index}</span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">{children}</h2>
    </div>
  );
}

export function PublicPortfolioSiteDeveloper({ site }: { site: PublicWebsiteResponse }) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();
  const [openCapability, setOpenCapability] = useState<number | null>(null);

  // The design gallery's sample uses this slug; a real published site never
  // does. Nothing illustrative is rendered without it, so no statistic or
  // achievement is ever invented on someone's real website.
  const data = getDeveloperData(normalizePortfolioData(site, { isSample: site.slug === "preview" }));

  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const stack = asStringArray(about.stack);
  const experience = asExperience(about.experience);
  const projectMeta = asProjectMeta(about.projectMeta);

  const hasProjects = data.projects.length > 0;
  const hasCapabilities = data.expertise.length > 0;
  const hasRecommendations = data.recommendations.length > 0;

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

  const contactHref = data.contact.email
    ? `mailto:${data.contact.email}`
    : data.contact.whatsappNumber
      ? whatsappUrl(data.contact.whatsappNumber, "")
      : null;

  const navLinks = [
    ...(hasProjects ? [{ href: "#work", label: t.nav.work }] : []),
    ...(hasCapabilities ? [{ href: "#capabilities", label: t.nav.services }] : []),
    ...(data.bio || experience.length > 0 ? [{ href: "#about", label: t.nav.about }] : []),
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col bg-[#08090c] text-zinc-100 selection:bg-[var(--accent-solid)] selection:text-white"
      style={themeCssVars(site.theme, undefined)}
    >
      {/* Reads like a file listing rather than a marketing header. */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090c]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <a href="#top" className="font-mono text-sm font-semibold tracking-tight text-white">
            {data.name}
            <span className="text-[var(--accent-solid)]">.</span>
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-6 font-mono text-xs text-zinc-400 sm:flex">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
              >
                <span className="text-[var(--accent-solid)]">{String(i + 1).padStart(2, "0")}</span> {link.label}
              </a>
            ))}
          </nav>
          {contactHref && (
            <a
              href={contactHref}
              className="shrink-0 rounded-md border border-white/20 px-3.5 py-1.5 font-mono text-xs text-white transition-colors hover:border-[var(--accent-solid)] hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
            >
              {t.nav.contact}
            </a>
          )}
        </div>
      </header>

      {/* Type-led, left-aligned, over a faint technical grid. */}
      <section id="top" className="relative overflow-hidden border-b border-white/10 px-6 py-20 sm:py-28">
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
            <motion.p {...rise} className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="relative flex h-2 w-2">
                {!reduceMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {data.badge}
            </motion.p>
          )}
          <motion.h1 {...rise} className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
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
              className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400"
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
                className="rounded-md bg-[var(--accent-solid)] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.hero.viewWork}
              </a>
            )}
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.hero.getInTouch}
              </a>
            )}
          </motion.div>
          {data.contact.address && <p className="mt-8 font-mono text-xs text-zinc-500">{data.contact.address}</p>}
        </div>
      </section>

      {/* A dense inline run of labels, not one card per technology. */}
      {stack.length > 0 && (
        <section aria-label="Technologies" className="border-b border-white/10 px-6 py-10">
          <ul className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-6 gap-y-3 font-mono text-sm text-zinc-400">
            {stack.map((tech) => (
              <li key={tech} className="transition-colors hover:text-white">
                <span className="text-[var(--accent-solid)]">/</span> {tech}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasProjects && (
        <section id="work" className="border-b border-white/10 px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="01">{t.nav.work}</SectionLabel>
            <div className="flex flex-col gap-20">
              {data.projects.map((image, i) => {
                const meta = projectMeta[i];
                return (
                  <motion.article key={image} {...rise} className="grid items-center gap-8 lg:grid-cols-2">
                    <figure className={`overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                      <SafeImage src={image} alt="" className="aspect-[16/10] w-full object-cover" />
                    </figure>
                    <div>
                      <span className="font-mono text-xs text-[var(--accent-solid)]">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {meta?.name ?? `${t.nav.projects} ${i + 1}`}
                      </h3>
                      {meta?.role && <p className="mt-1 font-mono text-xs text-zinc-500">{meta.role}</p>}
                      {meta?.tech && meta.tech.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {meta.tech.map((tech) => (
                            <li key={tech} className="rounded border border-white/15 px-2 py-1 font-mono text-[11px] text-zinc-300">
                              {tech}
                            </li>
                          ))}
                        </ul>
                      )}
                      {(meta?.repo || meta?.live) && (
                        <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs">
                          {meta?.live && (
                            <a href={meta.live} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-solid)] underline-offset-4 hover:underline">
                              Live ↗
                            </a>
                          )}
                          {meta?.repo && (
                            <a href={meta.repo} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline-offset-4 hover:text-white hover:underline">
                              Source ↗
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
        <section id="capabilities" className="border-b border-white/10 px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="02">{t.nav.services}</SectionLabel>
            <ul className="flex flex-col">
              {data.expertise.map((item, i) => {
                const isOpen = openCapability === i;
                return (
                  <li key={item.id} className="border-b border-white/10 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenCapability(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-[var(--accent-solid)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-xs text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-lg font-medium sm:text-2xl">{item.name}</span>
                      </span>
                      <span aria-hidden className={`font-mono text-sm transition-transform ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {isOpen && item.description && (
                      <p className="max-w-2xl pb-5 ps-10 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {(data.bio || experience.length > 0) && (
        <section id="about" className="border-b border-white/10 px-6 py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_1.1fr]">
            {data.bio && (
              <div>
                <SectionLabel index="03">{t.nav.about}</SectionLabel>
                <motion.p {...rise} className="max-w-xl text-lg leading-relaxed text-zinc-300">
                  {data.bio}
                </motion.p>
              </div>
            )}
            {experience.length > 0 && (
              <div>
                <SectionLabel index="04">{t.section.work}</SectionLabel>
                <ol className="relative flex flex-col gap-8 border-s border-white/10 ps-6">
                  {experience.map((entry) => (
                    <motion.li key={`${entry.year}-${entry.company}`} {...rise} className="relative">
                      <span aria-hidden className="absolute -start-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-[var(--accent-solid)]" />
                      <p className="font-mono text-xs text-zinc-500">{entry.year}</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {entry.role} <span className="text-zinc-600">·</span> <span className="text-zinc-400">{entry.company}</span>
                      </p>
                      {entry.detail && <p className="mt-1 text-sm leading-relaxed text-zinc-500">{entry.detail}</p>}
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {hasRecommendations && (
        <section className="border-b border-white/10 px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <SectionLabel index="05">{t.section.about}</SectionLabel>
            <div className="grid gap-10 sm:grid-cols-2">
              {data.recommendations.map((item, i) => (
                <motion.figure key={i} {...rise} className="border-s-2 border-[var(--accent-solid)]/40 ps-5">
                  <blockquote className="text-base leading-relaxed text-zinc-300">{item.quote}</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    <span className="font-mono text-xs text-zinc-500">{item.name}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="px-6 py-24">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 {...rise} className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {t.contact.letsWorkTogether}
          </motion.h2>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-md bg-[var(--accent-solid)] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-5">
            {data.contact.email && (
              <a href={`mailto:${data.contact.email}`} className="hover:text-white">
                {data.contact.email}
              </a>
            )}
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
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
