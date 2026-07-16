"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { whatsappUrl } from "@/lib/site/whatsapp";
import { brandColorStyle, parseDraftContent } from "@/lib/website/draft-content";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const SECTION_HEADING = "mb-10 text-center text-2xl font-bold tracking-tight text-white";
const SECTION_UNDERLINE = "mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--accent-solid)]";

/** Decorative animated badge for the Hero design: a slowly rotating dashed ring with corner brackets and orbiting dots, centered on a business monogram. */
function OrbitBadge({ monogram }: { monogram: string }) {
  return (
    <div aria-hidden className="relative hidden h-64 w-64 shrink-0 items-center justify-center sm:flex">
      {(["-top-1 -left-1 border-l-2 border-t-2", "-top-1 -right-1 border-r-2 border-t-2", "-bottom-1 -left-1 border-l-2 border-b-2", "-bottom-1 -right-1 border-r-2 border-b-2"] as const).map(
        (cls) => (
          <span key={cls} className={`absolute h-6 w-6 border-white/25 ${cls}`} />
        ),
      )}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-6 rounded-full border border-dashed border-white/20"
      >
        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/40"
            style={{ top: "50%", left: "50%", transform: `rotate(${deg}deg) translate(6.5rem) rotate(-${deg}deg)` }}
          />
        ))}
      </motion.div>
      <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl font-bold text-[var(--accent-solid)] backdrop-blur-sm">
        {monogram}
      </div>
    </div>
  );
}

/**
 * "Hero" design for PORTFOLIO: a dark, editorial single-page site with a
 * sticky nav, a two-column hero (headline + animated decorative badge, a
 * location pill, and a scroll cue), a stats-backed About section, then
 * Services and Work as their own sections, closing with Contact.
 */
export function PublicPortfolioSite({ site }: { site: PublicWebsiteResponse }) {
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;
  const content = parseDraftContent(site.publishedContent);
  const hasServices = site.services.length > 0;
  const hasGallery = site.galleryImageUrls.length > 0;
  const monogram = site.businessName.trim().charAt(0).toUpperCase() || "?";

  const navLinks = [
    { href: "#home", label: "Home" },
    ...(hasServices ? [{ href: "#services", label: "Services" }] : []),
    ...(hasGallery ? [{ href: "#work", label: "Work" }] : []),
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-white" style={brandColorStyle(content.brandColor)}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/80 px-6 py-4 backdrop-blur">
        <span className="font-semibold tracking-tight">{site.businessName}</span>
        <nav className="hidden items-center gap-6 text-sm text-zinc-300 sm:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        {whatsappNumber && (
          <a
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            className="rounded-full bg-[var(--accent-solid)] px-4 py-2 text-xs font-medium text-white transition-transform hover:scale-105"
          >
            Contact
          </a>
        )}
      </header>

      <section id="home" className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden px-6 py-20 sm:px-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent)]" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            {site.profile?.address && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300"
              >
                📍 {site.profile.address}
              </motion.span>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
            >
              {site.businessName}
            </motion.h1>
            {content.heroHeading && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-3 text-lg font-medium text-[var(--accent-solid)]"
              >
                {content.heroHeading}
              </motion.p>
            )}
            {(content.heroSubtitle || site.profile?.description) && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-4 text-balance text-zinc-400"
              >
                {content.heroSubtitle || site.profile?.description}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {hasServices && (
                <a
                  href="#services"
                  className="rounded-full bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  View services
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={whatsappUrl(whatsappNumber, inquiryMessage)}
                  target="_blank"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Contact us
                </a>
              )}
              {hasGallery && (
                <a
                  href="#work"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  View work
                </a>
              )}
            </motion.div>
          </div>
          <OrbitBadge monogram={monogram} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500"
        >
          Scroll
          <motion.span
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-6 w-px origin-top bg-[var(--accent-solid)]"
          />
        </motion.div>
      </section>

      <section className="bg-zinc-900 px-6 py-20 sm:px-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Reveal>
              <h2 className={`${SECTION_HEADING} text-left`}>
                About
                <span className={`${SECTION_UNDERLINE} ml-0`} />
              </h2>
              {site.profile?.description && <p className="max-w-md text-zinc-400">{site.profile.description}</p>}
            </Reveal>
          </div>
          <StaggerGroup className="grid flex-1 grid-cols-2 gap-4">
            {[
              hasServices && { label: "Services", value: `${site.services.length}+` },
              hasGallery && { label: "Photos", value: `${site.galleryImageUrls.length}` },
              site.openingHours.some((h) => h.open) && { label: "Open days", value: `${site.openingHours.filter((h) => h.open).length}` },
              whatsappNumber && { label: "Booking", value: "WhatsApp" },
            ]
              .filter((stat): stat is { label: string; value: string } => Boolean(stat))
              .map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                    <p className="text-2xl font-bold text-[var(--accent-solid)]">{stat.value}</p>
                    <p className="mt-1 text-xs text-zinc-400">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
          </StaggerGroup>
        </div>
      </section>

      {hasServices && (
        <section id="services" className="px-6 py-20 sm:px-12">
          <div className="mx-auto w-full max-w-5xl">
            <Reveal>
              <h2 className={SECTION_HEADING}>
                Services
                <span className={SECTION_UNDERLINE} />
              </h2>
            </Reveal>
            <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {site.services.map((service) => (
                <StaggerItem key={service.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="flex h-32 items-center justify-center bg-gradient-accent">
                      {service.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                        <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-white/70">{service.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-semibold">{service.name}</p>
                      {service.description && <p className="mt-1 text-sm text-zinc-400">{service.description}</p>}
                      <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[var(--accent-solid)]">
                        {service.price != null ? formatMoney(service.price, site.currency) : "Priced on request"}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {hasGallery && (
        <section id="work" className="bg-zinc-900 px-6 py-20 sm:px-12">
          <div className="mx-auto w-full max-w-5xl">
            <Reveal>
              <h2 className={SECTION_HEADING}>
                Work
                <span className={SECTION_UNDERLINE} />
              </h2>
            </Reveal>
            <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {site.galleryImageUrls.map((url) => (
                <StaggerItem key={url}>
                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    src={url}
                    alt=""
                    className="aspect-square w-full rounded-xl border border-white/10 object-cover"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <DynamicSections sections={site.sections} tone="hero" />

      {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
        <section className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-zinc-500 sm:px-12">
          {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
            <details key={key}>
              <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
              <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
            </details>
          ))}
        </section>
      )}

      <Reveal id="contact" as="section" className="px-6 py-16 text-center sm:px-12">
        <h2 className="text-2xl font-bold tracking-tight">Get in touch</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
          {site.profile?.phone && <span>{site.profile.phone}</span>}
          {site.profile?.address && <span>{site.profile.address}</span>}
          {site.profile?.googleMapsUrl && (
            <a href={site.profile.googleMapsUrl} target="_blank" className="hover:text-white hover:underline">
              Map
            </a>
          )}
          {site.profile?.instagramUrl && (
            <a href={site.profile.instagramUrl} target="_blank" className="hover:text-white hover:underline">
              Instagram
            </a>
          )}
          {site.profile?.tiktokUrl && (
            <a href={site.profile.tiktokUrl} target="_blank" className="hover:text-white hover:underline">
              TikTok
            </a>
          )}
        </div>

        {site.openingHours.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            {site.openingHours.map((h) => (
              <span key={h.dayOfWeek}>
                {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
              </span>
            ))}
          </div>
        )}

        {whatsappNumber && (
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            className="mt-6 inline-flex items-center rounded-full bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white"
          >
            Contact us on WhatsApp
          </motion.a>
        )}
      </Reveal>
    </div>
  );
}
