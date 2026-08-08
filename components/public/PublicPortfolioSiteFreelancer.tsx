"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SafeImage } from "@/components/public/SafeImage";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { getCompleteness, getFreelancerData, normalizePortfolioData, primaryContactHref } from "@/lib/website/portfolio-data";
import { themeCssVars } from "@/lib/website/theme-config";

/**
 * The Freelancer template (PORTFOLIO_PROFILE).
 *
 * One person rather than a studio, so the page is built as a profile: a split
 * hero with the portrait held beside the introduction, a contents rail that
 * stays with you while the story scrolls, and sections written as answers to
 * what someone about to email you actually wants to know - who you are, what
 * you have done, how you work, what it costs to ask.
 *
 * That is the structural difference from the other three. Developer indexes
 * artefacts, Designer exhibits artwork, Agency argues for a service. This one
 * introduces a person, which is why it is the only template with a sticky
 * contents rail and an FAQ.
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

const SHELL = "#14161a";
const CARD = "#1e2127";
const LINE = "rgba(255,255,255,0.09)";

export function PublicPortfolioSiteFreelancer({
  site,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  /** Passed by the design gallery only; a published site is always real. */
  isSample?: boolean;
}) {
  const { t, dir } = useLocale();
  const reduceMotion = useReducedMotion();

  const data = getFreelancerData(normalizePortfolioData(site, { isSample }));
  const about = (data.extra.ABOUT ?? {}) as Record<string, unknown>;
  const experience = asExperience(about.experience);
  const process = asProcess(about.process);

  const hasExpertise = data.expertise.length > 0;
  const hasProjects = data.projects.length > 0;

  // Same rule as the other three: too little content collapses to one screen
  // instead of a page that stops a third of the way down.
  const { isSparse } = getCompleteness(data);
  const hasFaq = data.faq.length > 0;
  const hasRecommendations = data.recommendations.length > 0;

  /**
   * The Freelancer motion language: content settles downward, slowly, one
   * block at a time - the pace of reading about someone rather than scanning.
   * Not Developer's brisk rise, Designer's uncover, or Agency's sideways push.
   */
  const settle = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-70px" },
          transition: { duration: 0.65, delay, ease: [0.25, 0.8, 0.35, 1] as const },
        };

  const contactHref = primaryContactHref(data);

  // The rail only lists sections that actually exist, so it never points at
  // an anchor a sparse site does not render.
  const contents = [
    { href: "#story", label: t.nav.about },
    ...(hasExpertise ? [{ href: "#expertise", label: t.nav.services }] : []),
    ...(experience.length > 0 ? [{ href: "#experience", label: t.section.work }] : []),
    ...(hasProjects ? [{ href: "#projects", label: t.nav.projects }] : []),
    ...(hasFaq ? [{ href: "#faq", label: t.nav.contact }] : []),
  ];

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col"
      style={{ ...themeCssVars(site.theme, data.brandColor || undefined), background: SHELL, color: "#e7e9ec" }}
    >
      {/* Split hero: the portrait is held beside the introduction rather than
          used as a banner, which is what makes this read as a profile. */}
      <section id="top" className={`px-6 py-14 sm:px-10 sm:py-20 ${isSparse ? "flex flex-1 items-center" : ""}`}>
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <motion.div {...settle(0)} className="lg:sticky lg:top-10 lg:self-start">
            {data.coverImageUrl && (
              <SafeImage
                src={data.coverImageUrl}
                alt={`${data.name}`}
                className="mb-6 aspect-[4/5] w-full rounded-2xl object-cover"
              />
            )}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{data.name}</h1>
            {data.headline && <p className="mt-2 text-base opacity-70">{data.headline}</p>}
            {data.badge && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs" style={{ background: CARD, color: "var(--accent-solid)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-solid)" }} />
                {data.badge}
              </p>
            )}
            <dl className="mt-7 flex flex-col gap-2.5 text-sm">
              {data.contact.address && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 opacity-45">{t.nav.home}</dt>
                  <dd className="opacity-85">{data.contact.address}</dd>
                </div>
              )}
              {data.contact.email && (
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 opacity-45">{t.nav.contact}</dt>
                  <dd>
                    <a href={`mailto:${data.contact.email}`} className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]">
                      {data.contact.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>

          <div>
            {data.subheadline && (
              <motion.p {...settle(0.08)} className="text-2xl leading-[1.35] tracking-tight sm:text-3xl">
                {data.subheadline}
              </motion.p>
            )}
            <motion.div {...settle(0.16)} className="mt-8 flex flex-wrap gap-3">
              {contactHref && (
                <a
                  href={contactHref}
                  className="rounded-full px-5 py-3 text-sm font-medium text-[#14161a] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ background: "var(--accent-solid)" }}
                >
                  {t.hero.getInTouch}
                </a>
              )}
              {hasProjects && (
                <a href="#projects" className="rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]" style={{ borderColor: LINE }}>
                  {t.hero.viewWork}
                </a>
              )}
            </motion.div>

            {/* A contents rail - unique to this template. */}
            {contents.length > 1 && (
              <motion.nav {...settle(0.24)} aria-label="Contents" className="mt-12 border-t pt-6" style={{ borderColor: LINE }}>
                <ol className="flex flex-col gap-2 text-sm">
                  {contents.map((entry, i) => (
                    <li key={entry.href} className="flex items-baseline gap-4">
                      <span className="text-xs opacity-35">{String(i + 1).padStart(2, "0")}</span>
                      <a href={entry.href} className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]">
                        {entry.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </motion.nav>
            )}

            {data.story && (
              <motion.div {...settle(0.3)} id="story" className="mt-14 scroll-mt-16">
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] opacity-45">{t.nav.about}</h2>
                <p className="text-base leading-relaxed opacity-80">{data.story}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Expertise: plain rows, no accordion - a freelancer's list is short. */}
      {hasExpertise && (
        <section id="expertise" className="scroll-mt-16 px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.nav.services}</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.expertise.map((item, i) => (
                <motion.li key={item.id} {...settle(i * 0.05)} className="rounded-2xl p-6" style={{ background: CARD }}>
                  <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
                  {item.description && <p className="mt-2 text-sm leading-relaxed opacity-65">{item.description}</p>}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section id="experience" className="scroll-mt-16 px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.section.work}</h2>
            <ol className="flex flex-col">
              {experience.map((entry) => (
                <motion.li key={`${entry.year}-${entry.company}`} {...settle(0)} className="grid gap-2 border-t py-6 sm:grid-cols-[160px_1fr] sm:gap-8" style={{ borderColor: LINE }}>
                  <p className="text-sm opacity-45">{entry.year}</p>
                  <div>
                    <p className="text-base font-semibold">
                      {entry.role} <span className="opacity-45">·</span> <span className="opacity-70">{entry.company}</span>
                    </p>
                    {entry.detail && <p className="mt-1.5 text-sm leading-relaxed opacity-60">{entry.detail}</p>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Projects as stacked panels that hold as you scroll past them. */}
      {hasProjects && (
        <section id="projects" className="scroll-mt-16 px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.nav.projects}</h2>
            <div className="flex flex-col gap-8">
              {data.projects.map((item, i) => (
                <motion.article
                  key={item.id}
                  {...settle(0)}
                  className="overflow-hidden rounded-3xl lg:sticky lg:top-14"
                  style={{ background: CARD, top: reduceMotion ? undefined : `${3.5 + i * 1.5}rem` }}
                >
                  {item.imageUrl && (
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title ? `${item.title}${item.subtitle ? ` - ${item.subtitle}` : ""}` : `${t.nav.projects} ${i + 1}`}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  )}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-baseline gap-x-4">
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {item.title || `${t.nav.projects} ${String(i + 1).padStart(2, "0")}`}
                      </h3>
                      {item.subtitle && (
                        <span className="text-sm" style={{ color: "var(--accent-solid)" }}>
                          {item.subtitle}
                        </span>
                      )}
                      {item.year && <span className="text-sm opacity-45">{item.year}</span>}
                    </div>
                    {item.summary && <p className="mt-3 max-w-2xl text-base leading-relaxed opacity-70">{item.summary}</p>}
                    {item.tags.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <li key={tag} className="rounded-full px-3 py-1 text-xs opacity-70" style={{ background: "rgba(255,255,255,0.06)" }}>
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-solid)]"
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

      {process.length > 0 && (
        <section className="px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.section.services}</h2>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {process.map((step, i) => (
                <motion.li key={step.step} {...settle(i * 0.05)}>
                  <span className="text-sm" style={{ color: "var(--accent-solid)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{step.step}</h3>
                  {step.detail && <p className="mt-2 text-sm leading-relaxed opacity-60">{step.detail}</p>}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {hasRecommendations && (
        <section className="px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.section.about}</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {data.recommendations.map((item, i) => (
                <motion.figure key={i} {...settle(i * 0.06)} className="rounded-2xl p-7" style={{ background: CARD }}>
                  <blockquote className="text-lg leading-relaxed opacity-85">{item.quote}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 text-sm opacity-60">
                    {item.imageUrl && <SafeImage src={item.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    {item.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ - the questions someone asks before they email. */}
      {hasFaq && (
        <section id="faq" className="scroll-mt-16 px-6 py-14 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-8 text-xs uppercase tracking-[0.2em] opacity-45">{t.nav.contact}</h2>
            <div className="flex flex-col gap-3">
              {data.faq.map((item, i) => (
                <details key={i} className="group rounded-2xl px-6 py-1" style={{ background: CARD }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-medium [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span aria-hidden className="text-lg transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed opacity-65">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="px-6 py-20 sm:px-10">
        <div className="mx-auto w-full max-w-6xl rounded-3xl p-8 sm:p-14" style={{ background: CARD }}>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t.contact.letsWorkTogether}
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {contactHref && (
              <a
                href={contactHref}
                className="rounded-full px-6 py-3.5 text-sm font-medium text-[#14161a] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ background: "var(--accent-solid)" }}
              >
                {data.contact.email ?? t.contact.getInTouch}
              </a>
            )}
            {data.contact.whatsappNumber && (
              <a
                href={whatsappUrl(data.contact.whatsappNumber, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-solid)]"
                style={{ borderColor: LINE }}
              >
                {t.contact.contactUsOnWhatsApp}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="px-6 pb-10 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm opacity-55" style={{ borderColor: LINE }}>
          <span>{data.name}</span>
          <div className="flex flex-wrap items-center gap-5">
            {data.contact.phone && <a href={`tel:${data.contact.phone.replace(/\s/g, "")}`} className="hover:opacity-100" dir="ltr">{data.contact.phone}</a>}
            {data.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
