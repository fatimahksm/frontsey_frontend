"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { PublicMenuItemCard } from "@/components/public/PublicMenuItemCard";
import type { PublicDeliveryArea, PublicWebsiteResponse } from "@/lib/api/types";
import type { CartLine } from "@/lib/site/cart";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

/** The MENU_ORDERING template's public page: profile header, gallery, categorized menu, and a WhatsApp cart. */
export function PublicMenuSite({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const [cart, setCart] = useState<CartLine[]>([]);

  const content = parseDraftContent(site.publishedContent);
  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;

  function handleAddToCart(line: CartLine) {
    setCart((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...prev, line];
    });
  }

  function handleRemove(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function handleCheckout(customer: Customer, deliveryArea: PublicDeliveryArea | null, deliveryFee: number) {
    if (!site.profile?.whatsappNumber) return;
    const message = buildWhatsAppMessage(site.businessName, cart, site.currency, deliveryArea?.name ?? null, deliveryFee, customer);
    window.open(whatsappUrl(site.profile.whatsappNumber, message), "_blank");
  }

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start"
      style={themeCssVars(site.theme, content.brandColor)}
    >
      <div className="min-w-0 flex-1">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          {site.profile?.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
            <img src={site.profile.coverImageUrl} alt="" className="mb-4 h-48 w-full rounded-2xl object-cover shadow-soft" />
          )}
          <div className="flex items-center gap-4">
            {site.profile?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
              <img src={site.profile.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover shadow-soft" />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={themeHeadingStyle()}>{site.businessName}</h1>
              {content.heroHeading && (
                <p className="mt-1 text-lg font-medium text-[var(--accent-solid)]">{content.heroHeading}</p>
              )}
              {content.heroSubtitle && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{content.heroSubtitle}</p>
              )}
              {site.profile?.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{site.profile.description}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
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
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
              {site.openingHours.map((h) => (
                <span key={h.dayOfWeek}>
                  {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {site.galleryImageUrls.length > 0 && (
          <StaggerGroup className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {site.galleryImageUrls.map((url) => (
              <StaggerItem key={url}>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  src={url}
                  alt=""
                  className="h-24 w-full rounded-lg object-cover shadow-soft"
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        <div className="flex flex-col" style={{ gap: "var(--theme-section-gap, 2rem)" }}>
          {site.categories.map((category) => (
            <section key={category.id}>
              <Reveal as="div">
                <h2 className="mb-3 text-lg font-semibold tracking-tight">{category.name}</h2>
              </Reveal>
              <StaggerGroup as="ul" className="flex flex-col gap-3">
                {category.items.map((item) => (
                  <StaggerItem as="li" key={item.id}>
                    <PublicMenuItemCard
                      item={item}
                      currency={site.currency}
                      orderingEnabled={orderingEnabled}
                      onAddToCart={handleAddToCart}
                      onFirstView={onFirstView}
                    />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <DynamicSections sections={site.sections} tone="classic" />
        </div>

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <footer className="mt-10 flex flex-col gap-4 border-t border-black/[.06] pt-6 text-xs text-zinc-500 dark:border-white/[.1]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, content]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
                <p className="mt-2 whitespace-pre-wrap">{content}</p>
              </details>
            ))}
          </footer>
        )}
      </div>

      {orderingEnabled && (
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <CartPanel lines={cart} currency={site.currency} deliveryAreas={site.deliveryAreas} onRemove={handleRemove} onCheckout={handleCheckout} />
        </aside>
      )}
    </div>
  );
}
