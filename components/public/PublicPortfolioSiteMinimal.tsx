"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { brandColorStyle, parseDraftContent } from "@/lib/website/draft-content";
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
 * "Minimal" layout for PORTFOLIO: same data as Hero/Bold, presented as a
 * warm, editorial personal-site style - a top nav, a two-column hero with
 * an eyebrow label and a photo, a side-by-side About block, a "Selected
 * Work" project grid, and a warm contact card. Deliberately serif-leaning
 * type and a cream background regardless of the site's light/dark toggle,
 * to read as its own distinct design.
 */
export function PublicPortfolioSiteMinimal({ site }: { site: PublicWebsiteResponse }) {
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;
  const content = parseDraftContent(site.publishedContent);
  const hasWork = site.services.length > 0 || site.galleryImageUrls.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-[#faf6f0] text-[#2b2621]" style={brandColorStyle(content.brandColor)}>
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <span className="font-serif text-2xl">{site.businessName.charAt(0)}.</span>
        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <a href="#home" className="border-b border-current pb-0.5">
            Home
          </a>
          <a href="#about">About</a>
          {site.services.length > 0 && <a href="#work">Work</a>}
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="home" className="px-6 py-10 sm:px-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 sm:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">Hello, I&apos;m</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{site.businessName}</h1>
            {content.heroHeading && <p className="mt-3 text-lg text-[#5c554d]">{content.heroHeading}</p>}
            {(content.heroSubtitle || site.profile?.description) && (
              <p className="mt-4 max-w-md text-sm text-[#7a7369]">{content.heroSubtitle || site.profile?.description}</p>
            )}
            {site.services.length > 0 && (
              <a
                href="#work"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
              >
                View my work →
              </a>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#ece4d8]"
          >
            {site.profile?.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
              <img src={site.profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </motion.div>
        </div>
      </section>

      {(site.profile?.description || site.profile?.logoUrl) && (
        <section id="about" className="px-6 py-14 sm:px-12">
          <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 sm:items-center">
            <Reveal className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#ece4d8]">
              {site.profile?.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                <img src={site.profile.logoUrl} alt="" className="h-full w-full object-cover" />
              )}
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">About</p>
              {site.profile?.description && <h2 className="mt-2 font-serif text-2xl leading-snug sm:text-3xl">{site.profile.description}</h2>}
            </Reveal>
          </div>
        </section>
      )}

      {hasWork && (
        <section id="work" className="px-6 py-14 sm:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-solid)]">Projects</p>
              <h2 className="mt-2 font-serif text-3xl">Selected work</h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {site.services.map((service) => (
                <StaggerItem key={service.id}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#ece4d8]">
                      {service.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                        <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="mt-3 font-medium">{service.name}</p>
                    <p className="text-xs text-[#7a7369]">
                      {service.price != null ? formatMoney(service.price, site.currency) : "Priced on request"}
                    </p>
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
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <DynamicSections sections={site.sections} tone="minimal" />

      <section id="contact" className="px-6 py-14 sm:px-12">
        <Reveal className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl bg-[#ece4d8] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <h2 className="font-serif text-3xl">Let&apos;s work together</h2>
            <p className="mt-2 max-w-sm text-sm text-[#7a7369]">Have a project in mind or just want to say hello? Feel free to reach out.</p>
            {whatsappNumber && (
              <a
                href={whatsappUrl(whatsappNumber, inquiryMessage)}
                target="_blank"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-solid)] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
              >
                Get in touch →
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm text-[#5c554d]">
            {site.profile?.email && <span>✉ {site.profile.email}</span>}
            {site.profile?.phone && <span>☎ {site.profile.phone}</span>}
            {site.profile?.address && <span>📍 {site.profile.address}</span>}
            {site.openingHours.length > 0 && (
              <div className="mt-2 flex flex-col gap-0.5 text-xs text-[#8b8478]">
                {site.openingHours.map((h) => (
                  <span key={h.dayOfWeek}>
                    {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-8 text-xs text-[#8b8478] sm:px-12">
          {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
            <details key={key}>
              <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
              <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
            </details>
          ))}
        </section>
      )}

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-[#e4dccd] px-6 py-6 text-xs text-[#8b8478] sm:flex-row sm:px-12">
        <span>© {new Date().getFullYear()} {site.businessName}. All rights reserved.</span>
        <div className="flex gap-4">
          {site.profile?.instagramUrl && (
            <a href={site.profile.instagramUrl} target="_blank" className="hover:text-[#2b2621]">
              Instagram
            </a>
          )}
          {site.profile?.tiktokUrl && (
            <a href={site.profile.tiktokUrl} target="_blank" className="hover:text-[#2b2621]">
              TikTok
            </a>
          )}
          {site.profile?.googleMapsUrl && (
            <a href={site.profile.googleMapsUrl} target="_blank" className="hover:text-[#2b2621]">
              Map
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
