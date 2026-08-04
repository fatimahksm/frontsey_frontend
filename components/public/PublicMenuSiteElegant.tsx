"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
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
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";
import { cartSubtotal } from "@/lib/site/cart";
import { formatMoney } from "@/lib/format";

/**
 * The "Elegant" layout for MENU_ORDERING: same data and ordering logic as
 * Classic/Grid, presented as a fine-dining-style menu - display typography,
 * a plain single-column list with dotted price leaders, muted palette, and
 * the cart as a minimal fixed bottom bar rather than a sidebar or drawer.
 */
export function PublicMenuSiteElegant({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  const content = parseDraftContent(site.publishedContent);
  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;
  const subtotal = cartSubtotal(cart);
  const visibleCategories = site.categories
    .map((category) => ({ ...category, items: itemsUnder(category).filter((item) => itemMatchesQuery(item, query)) }))
    .filter((category) => category.items.length > 0);

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
    setCartOpen(false);
  }

  return (
    <div dir={dir} className="flex flex-1 flex-col bg-surface-muted" style={themeCssVars(site.theme, content.brandColor)}>
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          {site.profile?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
            <img src={site.profile.logoUrl} alt="" className="mb-4 h-16 w-16 rounded-full object-cover shadow-soft" />
          )}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={themeHeadingStyle()}>{site.businessName}</h1>
          {content.heroHeading && <p className="mt-2 text-base text-[var(--accent-solid)]">{content.heroHeading}</p>}
          {content.heroSubtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{content.heroSubtitle}</p>}
        </motion.div>

        {site.categories.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.filter.searchPlaceholder}
            className="mb-8 h-11 w-full rounded-xl border border-black/[.12] bg-surface px-3.5 text-center text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16]"
          />
        )}

        {site.categories.length > 0 && visibleCategories.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t.filter.noResults}</p>
        )}

        <div className="flex flex-col" style={{ gap: "var(--theme-section-gap, 2.5rem)" }}>
          {visibleCategories.map((category) => (
            <section key={category.id}>
              <Reveal as="div">
                <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{category.name}</h2>
              </Reveal>
              <div className="flex flex-col">
                {category.items.map((item) => (
                  <PublicMenuItemCard
                    key={item.id}
                    item={item}
                    currency={site.currency}
                    orderingEnabled={orderingEnabled}
                    onAddToCart={handleAddToCart}
                    onFirstView={onFirstView}
                    variant="elegant"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {(site.profile?.description || site.profile?.phone || site.profile?.address) && (
          <Reveal as="section" className="mt-14 flex flex-col items-center gap-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {site.profile?.description && <p>{site.profile.description}</p>}
            <div className="mt-1 flex flex-wrap justify-center gap-3">
              {site.profile?.phone && <span>{site.profile.phone}</span>}
              {site.profile?.address && <span>{site.profile.address}</span>}
            </div>
          </Reveal>
        )}

        <DynamicSections sections={site.sections} tone="elegant" />
      </div>

      {orderingEnabled && cart.length > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="sticky bottom-0 z-40 border-t border-black/[.08] bg-background/95 px-4 py-3 backdrop-blur-md dark:border-white/[.145]"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {cart.reduce((n, l) => n + l.quantity, 0)} {cart.length !== 1 ? t.cart.itemsPlural : t.cart.itemSingular} · {formatMoney(subtotal, site.currency)}
            </span>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
              className="bg-gradient-accent px-5 py-2 text-sm font-medium text-white shadow-soft"
            >
              {t.cart.viewOrder}
            </button>
          </div>
        </motion.div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setCartOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-background p-4 sm:rounded-2xl">
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
          </div>
        </div>
      )}
    </div>
  );
}
