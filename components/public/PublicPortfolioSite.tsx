"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { fadeInUp } from "@/lib/motion";
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
 * The PORTFOLIO template's public page - deliberately a different shape
 * from PublicMenuSite (full-bleed hero, About, a services grid, a work
 * gallery, one contact section) rather than the same compact business-card
 * header with a swapped-out middle section. No cart - a single WhatsApp
 * inquiry is the only conversion path.
 */
export function PublicPortfolioSite({ site }: { site: PublicWebsiteResponse }) {
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;

  return (
    <div className="flex flex-1 flex-col">
      <section
        className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-24 text-center text-white"
        style={
          site.profile?.coverImageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(9,9,11,0.7), rgba(9,9,11,0.85)), url(${site.profile.coverImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div aria-hidden className="animate-float absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-accent opacity-20 blur-3xl" />
        {site.profile?.logoUrl && (
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={site.profile.logoUrl}
            alt=""
            className="relative mb-6 h-24 w-24 rounded-full border-2 border-white/30 object-cover"
          />
        )}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {site.businessName}
        </motion.h1>
        {site.profile?.description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative mt-4 max-w-xl text-balance text-lg text-zinc-300"
          >
            {site.profile.description}
          </motion.p>
        )}
        {whatsappNumber && (
          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            className="relative mt-8 inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lift hover:bg-emerald-700"
          >
            Contact us on WhatsApp
          </motion.a>
        )}
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-20 px-4 py-16">
        {site.services.length > 0 && (
          <section>
            <Reveal as="section">
              <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">Services</h2>
            </Reveal>
            <StaggerGroup as="ul" className="grid gap-5 sm:grid-cols-2">
              {site.services.map((service) => (
                <StaggerItem as="li" key={service.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-2xl border border-black/[.08] p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-white/[.145]"
                  >
                    {service.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                      <img src={service.imageUrl} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" />
                    )}
                    <p className="text-lg font-medium">{service.name}</p>
                    {service.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{service.description}</p>
                    )}
                    <p className="mt-3 text-sm font-semibold">
                      {service.price != null ? formatMoney(service.price, site.currency) : "Priced on request"}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {site.galleryImageUrls.length > 0 && (
          <section>
            <Reveal as="section">
              <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">Work</h2>
            </Reveal>
            <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {site.galleryImageUrls.map((url) => (
                <StaggerItem key={url}>
                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    src={url}
                    alt=""
                    className="aspect-square w-full rounded-xl object-cover shadow-soft"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <section className="flex flex-col gap-3 text-xs text-zinc-500">
            {Object.entries(site.profile?.policies ?? {}).map(([key, content]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
                <p className="mt-2 whitespace-pre-wrap">{content}</p>
              </details>
            ))}
          </section>
        )}
      </div>

      <Reveal as="section" className="bg-zinc-950 px-4 py-16 text-center text-white">
        <h2 className="text-2xl font-semibold tracking-tight">Get in touch</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-300">
          {site.profile?.phone && <span>{site.profile.phone}</span>}
          {site.profile?.address && <span>{site.profile.address}</span>}
          {site.profile?.googleMapsUrl && (
            <a href={site.profile.googleMapsUrl} target="_blank" className="hover:underline">
              Map
            </a>
          )}
          {site.profile?.instagramUrl && (
            <a href={site.profile.instagramUrl} target="_blank" className="hover:underline">
              Instagram
            </a>
          )}
          {site.profile?.tiktokUrl && (
            <a href={site.profile.tiktokUrl} target="_blank" className="hover:underline">
              TikTok
            </a>
          )}
        </div>

        {site.openingHours.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
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
            className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Contact us on WhatsApp
          </motion.a>
        )}
      </Reveal>
    </div>
  );
}
