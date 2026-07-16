"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { brandColorStyle, parseDraftContent } from "@/lib/website/draft-content";

function slugifyId(value: string): string {
  return `category-${value}`;
}

/**
 * The "Grid" layout for MENU_ORDERING: same data and ordering logic as the
 * Classic layout, arranged completely differently - a full-width cover
 * hero, sticky category pills, items as a card grid, and the cart as a
 * floating slide-in drawer instead of a fixed sidebar.
 */
export function PublicMenuSiteGrid({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const content = parseDraftContent(site.publishedContent);
  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;
  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);

  function handleAddToCart(line: CartLine) {
    setCart((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...prev, line];
    });
    setCartOpen(true);
  }

  function handleRemove(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function handleCheckout(customer: Customer, deliveryArea: PublicDeliveryArea | null, deliveryFee: number) {
    if (!site.profile?.whatsappNumber) return;
    const message = buildWhatsAppMessage(site.businessName, cart, site.currency, deliveryArea?.name ?? null, deliveryFee, customer);
    window.open(whatsappUrl(site.profile.whatsappNumber, message), "_blank");
  }

  function scrollToCategory(id: string) {
    document.getElementById(slugifyId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-1 flex-col" style={brandColorStyle(content.brandColor)}>
      {/* A practical, app-like header (cover strip + overlapping logo, left-aligned info) - deliberately not a
          cinematic full-bleed hero, which is Portfolio's signature move. Menu sites are about getting to the
          menu fast, not a dramatic intro. */}
      <div className="relative h-40 w-full overflow-hidden bg-surface-muted sm:h-52">
        {site.profile?.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
          <img src={site.profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
          {site.profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
            <img
              src={site.profile.logoUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl border-4 border-background object-cover shadow-lift sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-gradient-accent text-2xl font-semibold text-white shadow-lift sm:h-24 sm:w-24">
              {site.businessName.charAt(0)}
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 pb-2">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{site.businessName}</h1>
            {content.heroHeading && <p className="mt-0.5 truncate text-sm font-medium text-[var(--accent-solid)]">{content.heroHeading}</p>}
          </motion.div>
        </div>
        {content.heroSubtitle && <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{content.heroSubtitle}</p>}
      </div>

      {site.categories.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-black/[.06] bg-surface/90 px-4 py-3 backdrop-blur-md dark:border-white/[.1]">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
            {site.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className="shrink-0 rounded-full border border-black/[.1] px-4 py-1.5 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {site.galleryImageUrls.length > 0 && (
          <div className="mb-10 flex gap-3 overflow-x-auto pb-2">
            {site.galleryImageUrls.map((url) => (
              <motion.img
                key={url}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.25 }}
                src={url}
                alt=""
                className="h-32 w-48 shrink-0 rounded-xl object-cover shadow-soft"
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-12">
          {site.categories.map((category) => (
            <section key={category.id} id={slugifyId(category.id)} className="scroll-mt-24">
              <Reveal as="div">
                <h2 className="mb-4 text-xl font-semibold tracking-tight">{category.name}</h2>
              </Reveal>
              <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <StaggerItem key={item.id}>
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

        {(site.profile?.description ||
          site.profile?.phone ||
          site.profile?.address ||
          site.openingHours.length > 0) && (
          <Reveal as="section" className="mt-16 rounded-2xl border border-black/[.08] p-6 text-sm dark:border-white/[.145]">
            {site.profile?.description && <p className="mb-3 text-zinc-600 dark:text-zinc-400">{site.profile.description}</p>}
            <div className="flex flex-wrap gap-3 text-zinc-600 dark:text-zinc-400">
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
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                {site.openingHours.map((h) => (
                  <span key={h.dayOfWeek}>
                    {h.dayOfWeek.slice(0, 3)}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
                  </span>
                ))}
              </div>
            )}
          </Reveal>
        )}

        <DynamicSections sections={site.sections} tone="grid" />

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <footer className="mt-10 flex flex-col gap-4 border-t border-black/[.06] pt-6 text-xs text-zinc-500 dark:border-white/[.1]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
                <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
              </details>
            ))}
          </footer>
        )}
      </div>

      {orderingEnabled && (
        <>
          <motion.button
            type="button"
            onClick={() => setCartOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-accent px-5 text-sm font-medium text-white shadow-lift"
          >
            🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </motion.button>

          <AnimatePresence>
            {cartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCartOpen(false)}
                  className="fixed inset-0 z-40 bg-black/40"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 34 }}
                  className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto bg-background p-4 shadow-lift"
                >
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mb-3 text-sm text-zinc-500 hover:underline"
                  >
                    ← Close
                  </button>
                  <CartPanel
                    lines={cart}
                    currency={site.currency}
                    deliveryAreas={site.deliveryAreas}
                    onRemove={handleRemove}
                    onCheckout={handleCheckout}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
