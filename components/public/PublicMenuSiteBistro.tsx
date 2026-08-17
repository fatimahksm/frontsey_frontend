"use client";

import { MotionSafeImage, SafeImage } from "@/components/public/SafeImage";
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
import { useLocale } from "@/lib/i18n/LocaleContext";
import { itemsUnder } from "@/lib/site/menu-categories";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCardStyle, themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

function slugifyId(value: string): string {
  return `category-${value}`;
}

/**
 * "Bistro" layout for MENU_ORDERING: same data and ordering logic as the
 * other three menu layouts, presented as a warm, photography-led cafe/bistro
 * homepage - a bold headline hero with a real cover photo and an optional
 * floating highlight badge, a "Combo Boxes" section built from items already
 * marked fixedBoxItem (no fabricated "featured" concept), sticky category
 * filters, and a card-grid menu.
 */
export function PublicMenuSiteBistro({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  const content = parseDraftContent(site.publishedContent);
  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;
  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const whatsappNumber = site.profile?.whatsappNumber;
  const inquiryMessage = `Hi ${site.businessName}, I'd like to place an order.`;

  const allItems = site.categories.flatMap(itemsUnder);
  const comboItems = allItems.filter((item) => item.fixedBoxItem && itemMatchesQuery(item, query));
  const comboIds = new Set(allItems.filter((item) => item.fixedBoxItem).map((i) => i.id));
  const visibleCategories = site.categories
    .map((category) => ({
      ...category,
      items: itemsUnder(category).filter((item) => !comboIds.has(item.id) && itemMatchesQuery(item, query)),
    }))
    .filter((category) => category.items.length > 0);
  const hasNoResults = query.trim() !== "" && comboItems.length === 0 && visibleCategories.length === 0;

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
    <div dir={dir} className="flex flex-1 flex-col bg-background text-foreground" style={themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor)}>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--theme-border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] px-6 py-4 backdrop-blur sm:px-12">
        <div className="flex items-center gap-2">
          {site.profile?.logoUrl ? (
            <SafeImage src={site.profile.logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent text-sm font-semibold text-white">
              {site.businessName.charAt(0)}
            </span>
          )}
          <span className="font-semibold tracking-tight">{site.businessName}</span>
        </div>
        <a href="#menu" className="hidden text-sm sm:inline">
          {t.nav.menu}
        </a>
      </header>

      <section className="relative px-6 py-14 sm:px-12 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 sm:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl" style={themeHeadingStyle()}>
              {site.businessName}
            </h1>
            {content.heroHeading && (
              <p className="mt-3 text-2xl font-semibold italic text-[var(--accent-solid)]">{content.heroHeading}</p>
            )}
            {(content.heroSubtitle || site.profile?.description) && (
              <p className="mt-4 max-w-md text-sm text-[var(--theme-text-muted)]">{content.heroSubtitle || site.profile?.description}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {site.categories.length > 0 && (
                <a
                  href="#menu"
                  style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                  className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-105"
                >
                  {t.hero.viewMenu}
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={whatsappUrl(whatsappNumber, inquiryMessage)}
                  target="_blank"
                  style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                  className="inline-flex items-center gap-2 bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
                >
                  {t.hero.orderOnWhatsApp}
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
            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[var(--theme-secondary,#f4f0fb)]">
              {site.profile?.coverImageUrl && (
                <SafeImage src={site.profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            {content.heroBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={themeCardStyle()}
                className="absolute right-4 top-4 max-w-[70%] bg-surface px-4 py-3 text-foreground"
              >
                <p className="text-sm font-semibold">{content.heroBadge}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {site.galleryImageUrls.length > 0 && (
        <div className="mx-auto mb-4 flex w-full max-w-6xl gap-3 overflow-x-auto px-6 pb-2 sm:px-12">
          {site.galleryImageUrls.map((url) => (
            <MotionSafeImage
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

      {comboItems.length > 0 && (
        <section className="px-6 py-10 sm:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal>
              <h2 className="text-2xl font-bold">{t.bistro.comboBoxesTitle}</h2>
              <p className="mt-1 text-sm text-[var(--theme-text-muted)]">{t.bistro.comboBoxesSubtitle}</p>
            </Reveal>
            <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comboItems.map((item) => (
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
          </div>
        </section>
      )}

      {site.categories.length > 0 && (
        <div className="sticky top-[65px] z-20 flex flex-col gap-3 border-b border-[var(--theme-border)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] px-6 py-3 backdrop-blur-md sm:px-12">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.filter.searchPlaceholder}
            className="mx-auto h-10 w-full max-w-6xl rounded-xl border border-[var(--theme-border)] bg-surface px-3.5 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-[var(--theme-text-muted)] focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40"
          />
          {visibleCategories.length > 0 && (
            <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className="shrink-0 rounded-full border border-[var(--theme-border)] px-4 py-1.5 text-sm font-medium transition-colors hover:border-[var(--accent-solid)] hover:text-[var(--accent-solid)]"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div id="menu" className="mx-auto w-full max-w-6xl flex-1 scroll-mt-24 px-6 py-10 sm:px-12">
        {hasNoResults && <p className="text-sm text-[var(--theme-text-muted)]">{t.filter.noResults}</p>}

        <div className="flex flex-col" style={{ gap: "var(--theme-section-gap, 3rem)" }}>
          {visibleCategories.map((category) => {
            return (
              <section key={category.id} id={slugifyId(category.id)} className="scroll-mt-32">
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
            );
          })}
        </div>

        {(site.profile?.description ||
          site.profile?.phone ||
          site.profile?.address ||
          site.openingHours.length > 0) && (
          <Reveal as="section" className="mt-16">
            <div className="p-6 text-sm" style={themeCardStyle()}>
              {site.profile?.description && <p className="mb-3 text-[var(--theme-text-muted)]">{site.profile.description}</p>}
              <div className="flex flex-wrap gap-3 text-[var(--theme-text-muted)]">
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
              {site.openingHours.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {site.openingHours.map((h) => (
                    <span key={h.dayOfWeek}>
                      {t.hours.dayShort[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : t.hours.closed}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        <DynamicSections sections={site.sections} tone="grid" />

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <footer className="mt-10 flex flex-col gap-4 border-t border-[var(--theme-border)] pt-6 text-xs text-[var(--theme-text-muted)]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{t.policy[key.toLowerCase() as keyof typeof t.policy]}</summary>
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
            style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
            className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 bg-[#25D366] px-5 text-sm font-medium text-white shadow-lift"
          >
            🛒 {t.cart.cart}{cartCount > 0 ? ` (${cartCount})` : ""}
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
                  <button type="button" onClick={() => setCartOpen(false)} className="mb-3 text-sm text-zinc-500 hover:underline">
                    {dir === "rtl" ? `${t.cart.close} →` : `← ${t.cart.close}`}
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
