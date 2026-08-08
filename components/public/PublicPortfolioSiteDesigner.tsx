"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SafeImage } from "@/components/public/SafeImage";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getCompleteness, getDesignerData, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { themeCssVars } from "@/lib/website/theme-config";

/**
 * The Designer template (PORTFOLIO_MINIMAL).
 *
 * Where the Developer template is an index - dense, monospaced, numbered,
 * scannable - this one is a printed portfolio. The work is the page: artwork
 * runs large and at three different compositions so no two projects present
 * identically, type is serif and oversized, and the supporting sections are
 * kept deliberately quiet so nothing competes with the images.
 *
 * Its palette is paper and ink rather than the theme's, because an editorial
 * layout depends on the relationship between warm paper, near-black type and a
 * single accent - a themed background would collapse that. The accent itself
 * still comes from the theme, so an owner's brand colour carries through.
 * themeCssVars publishes the palette as variables without painting background
 * or text, which is what lets a template opt out like this.
 */

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Paper, ink and hairline - the template's own tokens, kept in one place. */
const PAPER = "#efe9e0";
const INK = "#1c1a17";
const RULE = "rgba(28,26,23,0.16)";
const SERIF = 'Georgia, "Times New Roman", serif';

export function PublicPortfolioSiteDesigner({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();

  const data = getDesignerData(normalizePortfolioData(site, { isSample }));

  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const tools = asStringArray(about.tools);

  const hasWork = data.selectedWork.length > 0;
  const hasDisciplines = data.disciplines.length > 0;
  const hasWords = data.testimonials.length > 0;

  // See the Developer template: a nearly-empty portfolio should read as a
  // deliberate single screen rather than a page with its middle missing, so
  // the hero takes the leftover height and the footer settles at the bottom.
  const { isSparse } = getCompleteness(data);

  /**
   * The Designer motion language: artwork is uncovered rather than moved, and
   * type arrives a line at a time. Deliberately not the Developer's single
   * uniform rise - a reveal reads as a page being turned, which is the feeling
   * this template is after.
   */
  const uncover = reduceMotion
    ? {}
    : {
        initial: { clipPath: "inset(12% 0% 12% 0%)", opacity: 0 },
        whileInView: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
      };

  const line = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const contactHref = primaryContactHref(data);

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(site.theme, data.brandColor || undefined), background: PAPER, color: INK }}
    >
      {/* A wordmark and a short list, right-aligned. No numbering, no rules. */}
      <header className="px-6 pt-8 sm:px-12">
        <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-baseline justify-between gap-4">
          <a href="#top" className="text-xl tracking-tight" style={{ fontFamily: SERIF }}>
            {data.name}
          </a>
          <nav aria-label="Sections" className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm">
            {hasWork && (
              <a href="#work" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
                {t.nav.work}
              </a>
            )}
            <a href="#approach" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
              {t.nav.about}
            </a>
            <a href="#contact" className="underline-offset-[6px] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]">
              {t.nav.contact}
            </a>
          </nav>
        </div>
      </header>

      {/* Asymmetric hero: type on the left, a tall piece of work on the right. */}
      <section
        id="top"
        className={`px-6 pb-16 pt-14 sm:px-12 sm:pb-24 sm:pt-20 ${isSparse ? "flex flex-1 items-center" : ""}`}
      >
        <div className="mx-auto grid w-full max-w-[92rem] items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            {data.badge && (
              <motion.p {...line(0)} className="mb-8 text-xs uppercase tracking-[0.28em]" style={{ color: "var(--accent-solid)" }}>
                {data.badge}
              </motion.p>
            )}
            <motion.h1
              {...line(0.05)}
              className="text-[clamp(2.75rem,8vw,7rem)] leading-[0.94] tracking-[-0.02em]"
              style={{ fontFamily: SERIF }}
            >
              {data.name}
            </motion.h1>
            {data.headline && (
              <motion.p {...line(0.14)} className="mt-6 max-w-xl text-xl leading-snug sm:text-2xl" style={{ fontFamily: SERIF }}>
                {data.headline}
              </motion.p>
            )}
            {data.subheadline && (
              <motion.p {...line(0.22)} className="mt-5 max-w-lg text-base leading-relaxed opacity-70">
                {data.subheadline}
              </motion.p>
            )}
            {data.contact.address && (
              <motion.p {...line(0.3)} className="mt-10 text-xs uppercase tracking-[0.2em] opacity-50">
                {data.contact.address}
              </motion.p>
            )}
          </div>
          {data.coverImageUrl && (
            <motion.figure {...uncover} className="overflow-hidden">
              <SafeImage
                src={data.coverImageUrl}
                alt={`Selected work by ${data.name}`}
                className="aspect-[4/5] w-full object-cover"
              />
            </motion.figure>
          )}
        </div>
      </section>

      {/* Selected work. Three compositions in rotation so no two projects
          present identically - the single repeated block is what makes a
          portfolio look like a template. */}
      {hasWork && (
        <section id="work" className="px-6 py-16 sm:px-12 sm:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <h2 className="mb-14 border-t pt-4 text-xs uppercase tracking-[0.28em] opacity-60" style={{ borderColor: RULE }}>
              {t.section.selectedWork}
            </h2>
            <div className="flex flex-col gap-24 sm:gap-36">
              {data.selectedWork.map((item, i) => {
                const composition = i % 3;
                const caption = (
                  <div className={composition === 1 ? "lg:pt-10" : ""}>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="text-3xl tracking-tight sm:text-4xl" style={{ fontFamily: SERIF }}>
                        {item.title || `${t.section.work} ${String(i + 1).padStart(2, "0")}`}
                      </h3>
                      {item.year && <span className="text-sm opacity-50">{item.year}</span>}
                    </div>
                    {item.subtitle && (
                      <p className="mt-2 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--accent-solid)" }}>
                        {item.subtitle}
                      </p>
                    )}
                    {item.summary && <p className="mt-4 max-w-md text-base leading-relaxed opacity-75">{item.summary}</p>}
                    {item.tags.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.18em] opacity-55">
                        {item.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block border-b pb-0.5 text-sm underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
                        style={{ borderColor: INK }}
                      >
                        {t.work.viewProject}
                      </a>
                    )}
                  </div>
                );

                const art = item.imageUrl && (
                  <motion.figure {...uncover} className="group overflow-hidden">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title ? `${item.title}${item.subtitle ? ` - ${item.subtitle}` : ""}` : `Work by ${data.name}`}
                      className={`w-full object-cover transition-transform duration-[900ms] ease-out ${
                        reduceMotion ? "" : "group-hover:scale-[1.03]"
                      } ${composition === 0 ? "aspect-[16/10]" : composition === 1 ? "aspect-[4/5]" : "aspect-[3/2]"}`}
                    />
                  </motion.figure>
                );

                // 0: full-bleed artwork, caption beneath in a narrow column.
                if (composition === 0) {
                  return (
                    <article key={item.id}>
                      {art}
                      <div className="mt-8 lg:w-2/3">{caption}</div>
                    </article>
                  );
                }
                // 1: tall artwork offset left, caption in the right column.
                if (composition === 1) {
                  return (
                    <article key={item.id} className={`grid gap-10 lg:gap-16 ${art ? "lg:grid-cols-[0.55fr_0.45fr]" : ""}`}>
                      {art}
                      {caption}
                    </article>
                  );
                }
                // 2: caption first, artwork wide to the right.
                return (
                  <article key={item.id} className={`grid gap-10 lg:items-center lg:gap-16 ${art ? "lg:grid-cols-[0.4fr_0.6fr]" : ""}`}>
                    {caption}
                    {art}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Disciplines: a ruled editorial list, not an accordion or cards. */}
      {hasDisciplines && (
        <section className="px-6 py-16 sm:px-12 sm:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <h2 className="mb-10 border-t pt-4 text-xs uppercase tracking-[0.28em] opacity-60" style={{ borderColor: RULE }}>
              {t.nav.services}
            </h2>
            <ul>
              {data.disciplines.map((item) => (
                <motion.li
                  key={item.id}
                  {...line(0)}
                  className="grid gap-3 border-b py-8 lg:grid-cols-[0.4fr_0.6fr] lg:gap-12"
                  style={{ borderColor: RULE }}
                >
                  <h3 className="text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: SERIF }}>
                    {item.name}
                  </h3>
                  {item.description && <p className="max-w-xl text-base leading-relaxed opacity-70">{item.description}</p>}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Approach: an oversized statement, then the detail beside it. */}
      {data.bio && (
        <section id="approach" className="px-6 py-16 sm:px-12 sm:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <h2 className="mb-10 border-t pt-4 text-xs uppercase tracking-[0.28em] opacity-60" style={{ borderColor: RULE }}>
              {t.nav.about}
            </h2>
            <div className="grid gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:gap-16">
              <motion.p {...line(0)} className="text-2xl leading-[1.25] tracking-tight sm:text-4xl" style={{ fontFamily: SERIF }}>
                {data.bio}
              </motion.p>
              {data.bioImageUrl && (
                <motion.figure {...uncover} className="overflow-hidden">
                  <SafeImage src={data.bioImageUrl} alt="" className="aspect-[3/2] w-full object-cover" />
                </motion.figure>
              )}
            </div>
            {tools.length > 0 && (
              <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 text-xs uppercase tracking-[0.2em] opacity-60" style={{ borderColor: RULE }}>
                {tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Words: large serif quotes, staggered rather than boxed. */}
      {hasWords && (
        <section className="px-6 py-16 sm:px-12 sm:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <h2 className="mb-12 border-t pt-4 text-xs uppercase tracking-[0.28em] opacity-60" style={{ borderColor: RULE }}>
              {t.section.about}
            </h2>
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
              {data.testimonials.map((item, i) => (
                <motion.figure key={i} {...line(i * 0.08)} className={i % 2 === 1 ? "lg:pt-16" : ""}>
                  <blockquote className="text-xl leading-[1.4] tracking-tight sm:text-2xl" style={{ fontFamily: SERIF }}>
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] opacity-60">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact: one oversized line, the way a portfolio signs off. */}
      <section id="contact" className="px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24">
        <div className="mx-auto w-full max-w-[92rem]">
          <motion.h2
            {...line(0)}
            className="max-w-4xl text-[clamp(2.25rem,6vw,5rem)] leading-[1.02] tracking-[-0.02em]"
            style={{ fontFamily: SERIF }}
          >
            {t.contact.letsWorkTogether}
          </motion.h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {contactHref && (
              <a
                href={contactHref}
                className="border-b-2 pb-1 text-lg underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
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
                className="text-sm uppercase tracking-[0.2em] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-6 pb-10 sm:px-12">
        <div
          className="mx-auto flex w-full max-w-[92rem] flex-wrap items-baseline justify-between gap-4 border-t pt-6 text-xs uppercase tracking-[0.2em] opacity-55"
          style={{ borderColor: RULE }}
        >
          <span style={{ fontFamily: SERIF, textTransform: "none", letterSpacing: 0 }} className="text-sm opacity-100">
            {data.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
