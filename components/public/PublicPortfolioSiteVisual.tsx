"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import { PortfolioWordmark } from "@/components/public/PortfolioWordmark";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getCompleteness, getVisualData, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import type { WorkItem } from "@/lib/website/portfolio-data";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The Creative / Visual template (PORTFOLIO_MINIMAL).
 *
 * A gallery, and it behaves like one. The previous version ran every piece of
 * work full-bleed at three alternating compositions, which on a wide screen
 * meant a single image two metres tall and a page you scrolled for a minute to
 * see four things. Photographers and designers have twenty pieces, not four.
 *
 * So: work is a responsive grid of evenly-cropped tiles - one column on a
 * phone, two on a tablet, three on a desktop - and "big" is something the
 * visitor asks for by opening a piece, not something forced on them. Filters
 * come from the owner's own categories, so a photographer can separate weddings
 * from portraits without any new field.
 *
 * The palette is the template's own warm neutral rather than the theme's,
 * because a gallery depends on artwork sitting against a quiet, consistent
 * ground. The accent still resolves from the owner's brand colour, which is
 * exactly what `themeCssVars` publishing variables (rather than painting
 * background and text) is for.
 */

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * The template's own tokens, kept in one place - and now read from the site's
 * theme rather than frozen into the file.
 *
 * The four portfolio templates each painted a fixed shell, which meant the
 * theme editor did nothing at all on a portfolio: an owner picked a palette,
 * saved it, and their site stayed exactly as dark (or as cream) as before. The
 * accent colour was the only thing that ever came through.
 *
 * These read from the variables themeCssVars puts on the shell, so the palette
 * is the owner's while the template's identity - its type, its rules, its
 * proportions - stays the template's. Every value is derived from the two the
 * owner actually picks, so a light palette and a dark one both hold together
 * without a per-theme branch anywhere below.
 */
const PAPER = "var(--background)";
const CARD = "color-mix(in srgb, var(--foreground) 10%, var(--background))";
const INK = "var(--foreground)";
const RULE = "var(--theme-border)";
const SERIF = 'Georgia, "Times New Roman", serif';

/** The filter set, taken from whatever the owner called their kinds of work. */
function categoriesOf(items: WorkItem[]): string[] {
  const seen: string[] = [];
  for (const item of items) {
    if (item.subtitle && !seen.includes(item.subtitle)) seen.push(item.subtitle);
  }
  // One category is not a filter, it is a label - showing a single chip that
  // does nothing is worse than showing none.
  return seen.length > 1 ? seen : [];
}

/**
 * The opened piece.
 *
 * This is where an image is allowed to be large, because the visitor asked for
 * it. `object-contain` inside a viewport-bounded box means a tall photograph
 * and a wide one both fit without either being cropped or overflowing.
 */
function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  viewLabel,
}: {
  item: WorkItem;
  onClose(): void;
  onPrev(): void;
  onNext(): void;
  viewLabel: string;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll while a piece is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || viewLabel}
      className="fixed inset-0 z-50 flex flex-col"
      // Solid, not translucent: a gallery viewer exists to remove everything
      // else from view, and the page bleeding through a tinted layer is exactly
      // the distraction it is meant to prevent.
      style={{ background: "color-mix(in srgb, var(--foreground) 92%, var(--background))", color: PAPER }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate text-sm">
          {item.title}
          {item.year && <span className="opacity-50"> · {item.year}</span>}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full px-3 py-1.5 text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 sm:px-6">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous"
          className="absolute start-1 top-1/2 z-10 -translate-y-1/2 rounded-full px-3 py-4 text-xl hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current sm:start-3"
        >
          ‹
        </button>
        {item.imageUrl && (
          <SafeImage src={item.imageUrl} alt={item.title} className="max-h-full max-w-full object-contain" />
        )}
        <button
          type="button"
          onClick={onNext}
          aria-label="Next"
          className="absolute end-1 top-1/2 z-10 -translate-y-1/2 rounded-full px-3 py-4 text-xl hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current sm:end-3"
        >
          ›
        </button>
      </div>

      {(item.summary || item.tags.length > 0 || item.liveUrl) && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3 text-sm sm:px-6">
          {item.subtitle && <p className="text-xs uppercase tracking-[0.2em] opacity-55">{item.subtitle}</p>}
          {item.summary && <p className="mt-2 leading-relaxed opacity-80">{item.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] opacity-55">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
            {item.liveUrl && (
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 opacity-100">
                {viewLabel} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PublicPortfolioSiteVisual({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();

  const data = getVisualData(normalizePortfolioData(site, { isSample }));

  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const tools = asStringArray(about.tools);

  // No useMemo: both are cheap derivations of already-derived data, and the
  // React Compiler memoizes them for us - hand-written memoization here only
  // stops it from optimizing the component at all.
  const categories = categoriesOf(data.selectedWork);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const shown = activeCategory ? data.selectedWork.filter((item) => item.subtitle === activeCategory) : data.selectedWork;

  const hasWork = data.selectedWork.length > 0;
  const hasDisciplines = data.disciplines.length > 0;
  const hasWords = data.testimonials.length > 0;

  // As in the other three templates: too little content collapses to one
  // deliberate screen rather than a page with its middle missing.
  const { isSparse } = getCompleteness(data);

  /** One quiet entrance for everything. A gallery should not perform. */
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const contactHref = primaryContactHref(data);
  const cover = data.coverImageUrl ?? data.selectedWork.find((item) => item.imageUrl)?.imageUrl ?? null;

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), data.brandColor || undefined), background: PAPER, color: INK }}
    >
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: RULE, background: "color-mix(in srgb, var(--background) 90%, transparent)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-6 px-5 py-4 sm:px-8">
          <PortfolioWordmark
            logoUrl={data.logoUrl}
            name={data.name}
            size="h-9 w-9"
            rounding="rounded-full"
            className="text-lg tracking-tight"
            style={{ fontFamily: SERIF }}
          />
          <nav aria-label="Sections" className="flex items-baseline gap-5 text-sm sm:gap-7">
            {hasWork && (
              <a href="#work" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.work}
              </a>
            )}
            {(data.bio || hasDisciplines) && (
              <a href="#about" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.about}
              </a>
            )}
            <a href="#contact" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
              {t.nav.contact}
            </a>
          </nav>
        </div>
      </header>

      {/* Hero: compact by design. Two short columns, capped height on the
          image, so the work below is reachable in one scroll rather than five. */}
      <section id="top" className={`px-5 py-12 sm:px-8 sm:py-16 ${isSparse ? "flex flex-1 items-center" : ""}`}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1fr_0.8fr] md:gap-12">
          <div>
            {data.badge && (
              <motion.p {...rise(0)} className="mb-5 text-xs uppercase tracking-[0.24em]" style={{ color: "var(--accent-solid)" }}>
                {data.badge}
              </motion.p>
            )}
            <motion.h1
              {...rise(0.04)}
              className="text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02] tracking-[-0.02em]"
              style={{ fontFamily: SERIF }}
            >
              {data.name}
            </motion.h1>
            {data.headline && (
              <motion.p {...rise(0.1)} className="mt-4 text-lg leading-snug opacity-80 sm:text-xl" style={{ fontFamily: SERIF }}>
                {data.headline}
              </motion.p>
            )}
            {data.subheadline && (
              <motion.p {...rise(0.16)} className="mt-4 max-w-md text-base leading-relaxed opacity-65">
                {data.subheadline}
              </motion.p>
            )}
            <motion.div {...rise(0.22)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {hasWork && (
                <a
                  href="#work"
                  className="border-b-2 pb-1 text-sm underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                  style={{ borderColor: "var(--accent-solid)" }}
                >
                  {t.hero.viewWork}
                </a>
              )}
              {contactHref && (
                <a
                  href={contactHref}
                  className="text-sm opacity-65 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                >
                  {t.hero.getInTouch}
                </a>
              )}
            </motion.div>
            {data.contact.address && (
              <p className="mt-8 text-xs uppercase tracking-[0.2em] opacity-45">{data.contact.address}</p>
            )}
          </div>

          {cover && (
            <motion.figure
              {...rise(0.1)}
              className="overflow-hidden rounded-sm"
              style={{ background: CARD }}
            >
              {/* A fixed, modest height rather than an aspect ratio: a portrait
                  ratio in a half-width column grows past the text beside it and
                  leaves the hero mostly empty on a wide screen. */}
              <SafeImage src={cover} alt="" className="h-56 w-full object-cover sm:h-72 md:h-[22rem]" />
            </motion.figure>
          )}
        </div>
      </section>

      {/* Work: an even grid. Every tile is the same crop, so the page reads as
          a body of work instead of a slideshow of unrelated rectangles. */}
      {hasWork && (
        <section id="work" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t pt-4" style={{ borderColor: RULE }}>
              <h2 className="text-xs uppercase tracking-[0.24em] opacity-60">{t.section.selectedWork}</h2>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em]">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)] ${
                      activeCategory === null ? "underline opacity-100" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    {t.filter.all}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)] ${
                        activeCategory === category ? "underline opacity-100" : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ul className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((item, i) => {
                const indexInAll = data.selectedWork.indexOf(item);
                return (
                  <motion.li key={item.id} {...rise(Math.min(i, 5) * 0.04)}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(indexInAll)}
                      className="group block w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                    >
                      <span className="block overflow-hidden rounded-sm" style={{ background: CARD }}>
                        {item.imageUrl ? (
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.title}
                            className={`aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out ${
                              reduceMotion ? "" : "group-hover:scale-[1.04]"
                            }`}
                          />
                        ) : (
                          <span className="flex aspect-[4/3] w-full items-center justify-center text-3xl opacity-25" style={{ fontFamily: SERIF }}>
                            {String(indexInAll + 1).padStart(2, "0")}
                          </span>
                        )}
                      </span>
                      <span className="mt-3 flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-lg tracking-tight" style={{ fontFamily: SERIF }}>
                          {item.title || `${t.section.work} ${String(indexInAll + 1).padStart(2, "0")}`}
                        </span>
                        {item.year && <span className="shrink-0 text-xs opacity-45">{item.year}</span>}
                      </span>
                      {item.subtitle && (
                        <span className="mt-1 block text-xs uppercase tracking-[0.18em]" style={{ color: "var(--accent-solid)" }}>
                          {item.subtitle}
                        </span>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* About and disciplines share one band, so neither becomes a lonely
          section between two pieces of work. */}
      {(data.bio || hasDisciplines) && (
        <section id="about" className="scroll-mt-16 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="border-t pt-4 text-xs uppercase tracking-[0.24em] opacity-60" style={{ borderColor: RULE }}>
              {t.nav.about}
            </h2>
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              {data.bio && (
                <motion.p {...rise(0)} className="text-xl leading-relaxed sm:text-2xl" style={{ fontFamily: SERIF }}>
                  {data.bio}
                </motion.p>
              )}
              {hasDisciplines && (
                <ul className="flex flex-col">
                  {data.disciplines.map((item, i) => (
                    <motion.li
                      key={item.id}
                      {...rise(Math.min(i, 4) * 0.05)}
                      className="grid gap-1.5 border-b py-4 sm:grid-cols-[0.45fr_0.55fr] sm:gap-6"
                      style={{ borderColor: RULE }}
                    >
                      <h3 className="text-lg tracking-tight" style={{ fontFamily: SERIF }}>
                        {item.name}
                      </h3>
                      {item.description && <p className="text-sm leading-relaxed opacity-65">{item.description}</p>}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {tools.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] opacity-55">
                {tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {hasWords && (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="border-t pt-4 text-xs uppercase tracking-[0.24em] opacity-60" style={{ borderColor: RULE }}>
              {t.section.testimonials}
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:gap-12">
              {data.testimonials.map((item, i) => (
                <motion.figure key={i} {...rise(Math.min(i, 3) * 0.06)}>
                  <blockquote className="text-lg leading-[1.5] tracking-tight sm:text-xl" style={{ fontFamily: SERIF }}>
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.18em] opacity-55">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="scroll-mt-16 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2
            {...rise(0)}
            className="max-w-3xl text-[clamp(1.875rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: SERIF }}
          >
            {t.contact.letsWorkTogether}
          </motion.h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            {contactHref && (
              <a
                href={contactHref}
                className="border-b-2 pb-1 text-base underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)] sm:text-lg"
                style={{ borderColor: "var(--accent-solid)", fontFamily: SERIF }}
              >
                {data.contact.email ?? t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 sm:px-8">
        <div
          className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 border-t pt-5 text-xs uppercase tracking-[0.18em] opacity-55"
          style={{ borderColor: RULE }}
        >
          <span style={{ fontFamily: SERIF, textTransform: "none", letterSpacing: 0 }} className="text-sm opacity-100">
            {data.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">
                {social.label}
              </a>
            ))}
            {data.contact.address && <span>{data.contact.address}</span>}
          </div>
        </div>
      </footer>

      {openIndex !== null && data.selectedWork[openIndex] && (
        <Lightbox
          item={data.selectedWork[openIndex]}
          viewLabel={t.work.viewProject}
          onClose={() => setOpenIndex(null)}
          onPrev={() => setOpenIndex((current) => (current === null ? null : (current - 1 + data.selectedWork.length) % data.selectedWork.length))}
          onNext={() => setOpenIndex((current) => (current === null ? null : (current + 1) % data.selectedWork.length))}
        />
      )}
    </div>
  );
}
