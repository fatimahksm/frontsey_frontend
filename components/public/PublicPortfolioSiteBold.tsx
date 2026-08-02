"use client";

import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";
import { whatsappUrl } from "@/lib/site/whatsapp";

/**
 * The "Bold" layout for PORTFOLIO: same data as Hero/Minimal, presented as
 * a vibrant, asymmetric creative-agency page - big rotated accent shapes,
 * oversized display type, services as chunky alternating cards, and a
 * masonry work gallery as the centerpiece. Same WhatsApp-only contact.
 */
export function PublicPortfolioSiteBold({ site }: { site: PublicWebsiteResponse }) {
  const { t, dir } = useLocale();
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'm interested in your services.`;
  const content = parseDraftContent(site.publishedContent);

  return (
    <div dir={dir} className="flex flex-1 flex-col overflow-hidden" style={themeCssVars(site.theme, content.brandColor)}>
      <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center">
        <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rotate-12 rounded-[3rem] bg-gradient-accent opacity-20 blur-2xl" />
        <div aria-hidden className="absolute -right-16 top-32 h-56 w-56 -rotate-12 rounded-full bg-gradient-accent opacity-10 blur-2xl" />

        {site.profile?.logoUrl ? (
          <motion.img
            initial={{ opacity: 0, rotate: -8, scale: 0.8 }}
            animate={{ opacity: 1, rotate: -4, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={site.profile.logoUrl}
            alt=""
            className="relative mx-auto mb-6 h-20 w-20 rounded-2xl object-cover shadow-lift"
          />
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-gradient relative text-5xl font-extrabold tracking-tight sm:text-6xl"
          style={themeHeadingStyle()}
        >
          {site.businessName}
        </motion.h1>
        {content.heroHeading && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative mt-4 text-xl font-semibold"
          >
            {content.heroHeading}
          </motion.p>
        )}
        {content.heroSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative mx-auto mt-3 max-w-md text-balance text-zinc-500 dark:text-zinc-400"
          >
            {content.heroSubtitle}
          </motion.p>
        )}
        {whatsappNumber && (
          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.96 }}
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
            className="relative mt-8 inline-flex items-center bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lift hover:bg-emerald-700"
          >
            {t.hero.letsTalkOnWhatsApp}
          </motion.a>
        )}
      </section>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20">
        {site.services.length > 0 && (
          <section className="mb-20">
            <Reveal>
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                <span className="h-3 w-3 rounded-full bg-gradient-accent" aria-hidden />
                {t.section.services}
              </h2>
            </Reveal>
            <StaggerGroup className="grid gap-5 sm:grid-cols-2">
              {site.services.map((service, i) => (
                <StaggerItem key={service.id}>
                  <motion.div
                    whileHover={{ y: -4, rotate: i % 2 === 0 ? -1 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderRadius: "var(--theme-radius, 1.5rem)" }}
                    className={`h-full border-2 border-black/[.08] p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-white/[.145] ${
                      i % 3 === 0 ? "bg-gradient-accent text-white" : ""
                    }`}
                  >
                    {service.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
                      <img src={service.imageUrl} alt="" className="mb-4 h-40 w-full rounded-2xl object-cover" />
                    )}
                    <p className="text-lg font-bold">{service.name}</p>
                    {service.description && (
                      <p className={`mt-1 text-sm ${i % 3 === 0 ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {service.description}
                      </p>
                    )}
                    <p className="mt-3 text-sm font-semibold">
                      {service.price != null ? formatMoney(service.price, site.currency) : t.item.pricedOnRequest}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        {site.galleryImageUrls.length > 0 && (
          <section>
            <Reveal>
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                <span className="h-3 w-3 rotate-45 bg-gradient-accent" aria-hidden />
                {t.section.work}
              </h2>
            </Reveal>
            <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {site.galleryImageUrls.map((url, i) => (
                <StaggerItem key={url} className={i % 5 === 0 ? "col-span-2 row-span-2" : ""}>
                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    src={url}
                    alt=""
                    className="aspect-square h-full w-full rounded-2xl object-cover shadow-soft"
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        )}

        <DynamicSections sections={site.sections} tone="bold" />

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <section className="mt-16 flex flex-col gap-3 text-xs text-zinc-500">
            {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{t.policy[key.toLowerCase() as keyof typeof t.policy]}</summary>
                <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
              </details>
            ))}
          </section>
        )}
      </div>

      <Reveal className="bg-gradient-accent px-4 py-16 text-center text-white">
        <h2 className="text-2xl font-extrabold tracking-tight">{t.contact.getInTouch}</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          {site.profile?.phone && <span>{site.profile.phone}</span>}
          {site.profile?.address && <span>{site.profile.address}</span>}
          {site.profile?.googleMapsUrl && (
            <a href={site.profile.googleMapsUrl} target="_blank" className="hover:underline">
              {t.contact.map}
            </a>
          )}
          {site.profile?.instagramUrl && (
            <a href={site.profile.instagramUrl} target="_blank" className="hover:underline">
              {t.contact.instagram}
            </a>
          )}
          {site.profile?.tiktokUrl && (
            <a href={site.profile.tiktokUrl} target="_blank" className="hover:underline">
              {t.contact.tiktok}
            </a>
          )}
        </div>

        {whatsappNumber && (
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={whatsappUrl(whatsappNumber, inquiryMessage)}
            target="_blank"
            style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
            className="mt-6 inline-flex items-center bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90"
          >
            {t.contact.contactUsOnWhatsApp}
          </motion.a>
        )}
      </Reveal>
    </div>
  );
}
