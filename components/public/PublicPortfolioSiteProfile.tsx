"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCardStyle, themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";
import { whatsappUrl } from "@/lib/site/whatsapp";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

/**
 * "Profile" layout for PORTFOLIO: a personal, photo-led homepage - a
 * two-column hero with a real profile photo and an optional floating
 * highlight badge (content.heroBadge), a scroll-down cue, a "Featured
 * Projects" grid built from the same services data as the other Portfolio
 * layouts, an about block, and the standard WhatsApp contact section.
 */
export function PublicPortfolioSiteProfile({ site }: { site: PublicWebsiteResponse }) {
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;
  const content = parseDraftContent(site.publishedContent);
  const hasWork = site.services.length > 0 || site.galleryImageUrls.length > 0;

  return (
    <div
      className="flex flex-1 flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      style={themeCssVars(site.theme, content.brandColor)}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[.06] bg-white/80 px-6 py-4 backdrop-blur sm:px-12 dark:border-white/[.08] dark:bg-zinc-950/80">
        <span className="text-lg font-semibold tracking-tight">
          {site.businessName
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <a href="#home">Home</a>
          {(site.profile?.description || site.profile?.logoUrl) && <a href="#about">About</a>}
          {hasWork && <a href="#work">Projects</a>}
          <a href="#contact">Contact</a>
        </nav>
        {whatsappNumber && (
          <a
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
            className="hidden bg-[var(--accent-solid)] px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105 sm:inline-flex"
          >
            Let&apos;s talk
          </a>
        )}
      </header>

      <section id="home" className="relative px-6 py-14 sm:px-12 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 sm:grid-cols-2 sm:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">Hello, I&apos;m</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl" style={themeHeadingStyle()}>
              {site.businessName}
            </h1>
            {content.heroHeading && <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{content.heroHeading}</p>}
            {(content.heroSubtitle || site.profile?.description) && (
              <p className="mt-4 max-w-md text-sm text-zinc-500 dark:text-zinc-400">{content.heroSubtitle || site.profile?.description}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {hasWork && (
                <a
                  href="#work"
                  style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                  className="inline-flex items-center gap-2 bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  View my work →
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={whatsappUrl(whatsappNumber, inquiryMessage)}
                  target="_blank"
                  style={{ borderRadius: "var(--theme-button-radius, 9999px)", border: "1px solid var(--theme-card-border, currentColor)" }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-transform hover:scale-105"
                >
                  Get in touch
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[var(--theme-secondary,#f4f0fb)]">
              {site.profile?.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                <img src={site.profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            {content.heroBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={themeCardStyle()}
                className="absolute bottom-4 left-4 max-w-[70%] bg-white px-4 py-3 dark:bg-zinc-900"
              >
                <p className="text-sm font-semibold">{content.heroBadge}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {hasWork && (
          <a
            href="#work"
            aria-label="Scroll down"
            className="mx-auto mt-14 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-secondary,#f4f0fb)] text-[var(--accent-solid)] transition-transform hover:scale-105"
          >
            ↓
          </a>
        )}
      </section>

      {(site.profile?.description || site.profile?.logoUrl) && (
        <section id="about" className="px-6 py-14 sm:px-12">
          <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 sm:items-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">About</p>
              {site.profile?.description && <h2 className="mt-2 text-2xl leading-snug sm:text-3xl">{site.profile.description}</h2>}
            </Reveal>
            {site.profile?.logoUrl && (
              <Reveal delay={0.1} className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--theme-secondary,#f4f0fb)] sm:justify-self-end">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL */}
                <img src={site.profile.logoUrl} alt="" className="h-full w-full object-cover" />
              </Reveal>
            )}
          </div>
        </section>
      )}

      {hasWork && (
        <section id="work" className="px-6 py-14 sm:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">Featured</p>
              <h2 className="mt-2 text-3xl font-bold">Projects</h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {site.services.map((service) => (
                <StaggerItem key={service.id}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={themeCardStyle()} className="overflow-hidden bg-white dark:bg-zinc-900">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--theme-secondary,#f4f0fb)]">
                      {service.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                        <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium">{service.name}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {service.price != null ? formatMoney(service.price, site.currency) : "Priced on request"}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
              {site.galleryImageUrls.map((url) => (
                <StaggerItem key={url}>
                  <motion.img
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    src={url}
                    alt=""
                    style={themeCardStyle()}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <DynamicSections sections={site.sections} tone="minimal" />

      <section id="contact" className="px-6 py-14 sm:px-12">
        <Reveal className="mx-auto w-full max-w-6xl">
          <div
            style={themeCardStyle()}
            className="flex flex-col gap-6 bg-[var(--theme-secondary,#f4f0fb)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12"
          >
            <div>
              <h2 className="text-3xl font-bold">Let&apos;s work together</h2>
              <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Have a project in mind or just want to say hello? Feel free to reach out.
              </p>
              {whatsappNumber && (
                <a
                  href={whatsappUrl(whatsappNumber, inquiryMessage)}
                  target="_blank"
                  style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                  className="mt-6 inline-flex items-center gap-2 bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  Get in touch →
                </a>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {site.profile?.email && <span>✉ {site.profile.email}</span>}
              {site.profile?.phone && <span>☎ {site.profile.phone}</span>}
              {site.profile?.address && <span>📍 {site.profile.address}</span>}
              {site.openingHours.length > 0 && (
                <div className="mt-2 flex flex-col gap-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                  {site.openingHours.map((h) => (
                    <span key={h.dayOfWeek}>
                      {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-8 text-xs text-zinc-500 sm:px-12 dark:text-zinc-500">
          {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
            <details key={key}>
              <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
              <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
            </details>
          ))}
        </section>
      )}

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-black/[.06] px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:px-12 dark:border-white/[.08] dark:text-zinc-500">
        <span>
          © {new Date().getFullYear()} {site.businessName}. All rights reserved.
        </span>
        <div className="flex gap-4">
          {site.profile?.instagramUrl && (
            <a href={site.profile.instagramUrl} target="_blank" className="hover:text-[var(--accent-solid)]">
              Instagram
            </a>
          )}
          {site.profile?.tiktokUrl && (
            <a href={site.profile.tiktokUrl} target="_blank" className="hover:text-[var(--accent-solid)]">
              TikTok
            </a>
          )}
          {site.profile?.googleMapsUrl && (
            <a href={site.profile.googleMapsUrl} target="_blank" className="hover:text-[var(--accent-solid)]">
              Map
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
