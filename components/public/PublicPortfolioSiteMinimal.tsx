"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
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
 * The "Minimal" layout for PORTFOLIO: same data as the Hero layout (profile,
 * services, gallery), arranged as a light, editorial split-screen instead of
 * a dark full-bleed hero - a fixed left profile panel and a scrollable right
 * content column. Same WhatsApp-only contact model.
 */
export function PublicPortfolioSiteMinimal({ site }: { site: PublicWebsiteResponse }) {
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;
  const content = parseDraftContent(site.publishedContent);

  return (
    <div className="flex flex-1 flex-col lg:flex-row" style={brandColorStyle(content.brandColor)}>
      <aside className="flex shrink-0 flex-col justify-center gap-5 border-b border-black/[.06] px-6 py-12 dark:border-white/[.1] lg:sticky lg:top-0 lg:h-screen lg:w-[380px] lg:border-b-0 lg:border-r">
        {site.profile?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
          <img src={site.profile.logoUrl} alt="" className="h-20 w-20 rounded-full object-cover shadow-soft" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-accent text-2xl font-semibold text-white">
            {site.businessName.charAt(0)}
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold tracking-tight"
        >
          {site.businessName}
        </motion.h1>

        {content.heroHeading && <p className="text-gradient text-lg font-medium">{content.heroHeading}</p>}
        {content.heroSubtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{content.heroSubtitle}</p>}
        {site.profile?.description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{site.profile.description}</p>}

        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
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
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            {site.openingHours.map((h) => (
              <span key={h.dayOfWeek}>
                {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
              </span>
            ))}
          </div>
        )}

        {whatsappNumber && (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            className="mt-2 inline-flex w-fit items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-emerald-700"
          >
            Contact on WhatsApp
          </motion.a>
        )}
      </aside>

      <div className="min-w-0 flex-1 px-6 py-12 lg:px-12">
        {site.services.length > 0 && (
          <section className="mb-16">
            <Reveal>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500">Services</h2>
            </Reveal>
            <StaggerGroup as="ul" className="flex flex-col divide-y divide-black/[.06] dark:divide-white/[.1]">
              {site.services.map((service) => (
                <StaggerItem as="li" key={service.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium">{service.name}</p>
                    {service.description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{service.description}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {service.price != null ? formatMoney(service.price, site.currency) : "On request"}
                  </span>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {site.galleryImageUrls.length > 0 && (
          <section>
            <Reveal>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500">Work</h2>
            </Reveal>
            <StaggerGroup className="columns-2 gap-3 sm:columns-3">
              {site.galleryImageUrls.map((url) => (
                <StaggerItem key={url} className="mb-3 break-inside-avoid">
                  <motion.img
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    src={url}
                    alt=""
                    className="w-full rounded-xl object-cover shadow-soft"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <footer className="mt-16 flex flex-col gap-4 border-t border-black/[.06] pt-6 text-xs text-zinc-500 dark:border-white/[.1]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
                <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
              </details>
            ))}
          </footer>
        )}
      </div>
    </div>
  );
}
