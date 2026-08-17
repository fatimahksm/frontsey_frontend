"use client";

import { MotionSafeImage, SafeImage } from "@/components/public/SafeImage";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { LocationCard } from "@/components/public/LocationCard";
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

function slugifyId(value: string): string {
  return `category-${value}`;
}

/**
 * A category filter chip.
 *
 * The selected one is filled with the accent rather than merely outlined: this
 * bar used to be a row of identical white pills that scrolled the page instead
 * of filtering it, so nothing on screen ever said which one you had pressed.
 */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      aria-pressed={active}
      className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        active
          ? "text-[color:var(--accent-contrast)]"
          : "border border-black/[.1] bg-surface hover:border-[var(--accent-solid)]/40 hover:text-[var(--accent-ink)] dark:border-white/[.14] dark:bg-white/[.04]"
      }`}
      style={active ? { background: "var(--accent-solid)" } : undefined}
    >
      {children}
    </motion.button>
  );
}

/**
 * The "Grid" layout for MENU_ORDERING: same data and ordering logic as the
 * Classic layout, arranged completely differently - a full-width cover
 * hero, sticky category pills, items as a card grid, and the cart as a
 * floating slide-in drawer instead of a fixed sidebar.
 */
export function PublicMenuSiteGrid({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  /** null = every category. The chips are a filter, not a scroll shortcut. */
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const content = parseDraftContent(site.publishedContent);
  const hasCover = !!site.profile?.coverImageUrl;
  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;
  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  // Two independent narrowings: the chips choose a category, the box searches
  // within whatever is showing. Both are applied here so the count under the
  // bar and the sections below can never disagree.
  const matchingCategories = site.categories
    .map((category) => ({ ...category, items: itemsUnder(category).filter((item) => itemMatchesQuery(item, query)) }))
    .filter((category) => category.items.length > 0);
  const visibleCategories = activeCategory
    ? matchingCategories.filter((category) => category.id === activeCategory)
    : matchingCategories;
  const visibleItemCount = visibleCategories.reduce((sum, category) => sum + category.items.length, 0);
  // Chips list every category that still has a match, so a chip is never a
  // dead end - plus whichever one is selected, so it cannot vanish under you.
  const chipCategories = site.categories.filter(
    (category) => category.id === activeCategory || matchingCategories.some((match) => match.id === category.id),
  );

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

  function chooseCategory(id: string | null) {
    setActiveCategory(id);
    // Filtering shortens the page; without this the visitor can be left looking
    // at the footer of a menu that no longer has anything below the fold.
    document.getElementById("menu-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div dir={dir} className="flex flex-1 flex-col bg-background text-foreground" style={themeCssVars(site.theme, content.brandColor)}>
      {/* A practical, app-like header (cover strip + overlapping logo, left-aligned info) - deliberately not a
          cinematic full-bleed hero, which is Portfolio's signature move. Menu sites are about getting to the
          menu fast, not a dramatic intro. */}
      {/* One block, not a photo strip with a header pinned underneath it. The
          logo used to straddle the boundary between the two, which read as a
          seam rather than as a design, and left an empty band under the cover
          on wide screens. Everything now sits inside the image, over a scrim
          heavy enough that white text stays legible on any owner photo. */}
      <header
        className={`relative isolate w-full overflow-hidden ${
          hasCover ? "min-h-[300px] sm:min-h-[400px]" : "bg-surface-muted"
        }`}
      >
        {hasCover && (
          <>
            <SafeImage src={site.profile!.coverImageUrl!} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          </>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-8 ${hasCover ? "pt-28 sm:pt-40" : "pt-8"}`}
        >
          {site.profile?.logoUrl ? (
            <SafeImage
              src={site.profile.logoUrl}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover shadow-lift ring-1 ring-white/25 sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent text-2xl font-semibold text-[var(--accent-contrast)] shadow-lift sm:h-20 sm:w-20">
              {site.businessName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1
              className={`text-3xl font-semibold tracking-tight sm:text-4xl ${hasCover ? "text-white" : ""}`}
              style={themeHeadingStyle()}
            >
              {site.businessName}
            </h1>
            {content.heroHeading && (
              <p className={`mt-1.5 text-base font-medium sm:text-lg ${hasCover ? "text-white/85" : "text-[var(--accent-ink)]"}`}>
                {content.heroHeading}
              </p>
            )}
            {content.heroSubtitle && (
              <p
                className={`mt-2 max-w-2xl text-sm leading-relaxed ${
                  hasCover ? "text-white/70" : "text-[var(--theme-text-muted)]"
                }`}
              >
                {content.heroSubtitle}
              </p>
            )}
          </div>
        </motion.div>
      </header>

      {site.categories.length > 0 && (
        <div
          id="menu-top"
          className="sticky top-0 z-30 scroll-mt-0 border-b border-black/[.06] bg-surface/95 backdrop-blur-md dark:border-white/[.1]"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-3 lg:flex-row lg:items-center lg:gap-5">
            {/* One row on a wide screen. Stacked, this bar was two thirds the
                height of a phone's viewport before a single dish appeared. */}
            <label className="relative shrink-0 lg:w-72">
              <span className="sr-only">{t.filter.searchPlaceholder}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-45"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.6-3.6" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.filter.searchPlaceholder}
                className="h-10 w-full rounded-full border border-black/[.12] bg-surface ps-9 pe-3.5 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16]"
              />
            </label>

            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              {/* "All" first, and always present: without it a visitor who taps a
                  chip has no way back to the whole menu. */}
              <FilterChip active={activeCategory === null} onClick={() => chooseCategory(null)}>
                {t.filter.all}
              </FilterChip>
              {chipCategories.map((category) => (
                <FilterChip
                  key={category.id}
                  active={activeCategory === category.id}
                  onClick={() => chooseCategory(category.id)}
                >
                  {category.name}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {site.galleryImageUrls.length > 0 && (
          <div className="relative mb-10">
            {/* Labelled, so it reads as photos of the place rather than as the
                menu itself - which is what an unexplained row of food pictures
                directly above the menu looked like. */}
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">
              {t.stats.photos}
            </p>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto">
              {site.galleryImageUrls.map((url) => (
                <MotionSafeImage
                  key={url}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  src={url}
                  alt=""
                  className="h-36 w-52 shrink-0 snap-start rounded-2xl object-cover shadow-soft"
                />
              ))}
            </div>
            {/* A fade at the trailing edge: the strip scrolls, and a photo cut
                flat by the container edge reads as broken rather than as more. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 end-0 top-8 w-12 bg-gradient-to-l from-background to-transparent"
            />
          </div>
        )}

        {visibleCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/[.12] py-14 text-center dark:border-white/[.16]">
            <p className="text-sm font-medium">{t.filter.noResults}</p>
            {(query || activeCategory) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  chooseCategory(null);
                }}
                className="mt-2 text-sm font-medium text-[var(--accent-ink)] hover:underline"
              >
                {t.filter.clearFilters}
              </button>
            )}
          </div>
        ) : (
          (query || activeCategory) && (
            <p className="mb-6 text-sm text-[var(--theme-text-muted)]">
              {visibleItemCount} {visibleItemCount === 1 ? t.filter.itemSingular : t.filter.itemPlural}
            </p>
          )
        )}

        <div className="flex flex-col" style={{ gap: "var(--theme-section-gap, 3rem)" }}>
          {visibleCategories.map((category) => (
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
          <Reveal as="section" className="mt-16 flex flex-col gap-5">
            {site.profile?.description && (
              <p className="max-w-3xl text-sm leading-relaxed text-[var(--theme-text-muted)]">{site.profile.description}</p>
            )}
            {site.profile && <LocationCard profile={site.profile} openingHours={site.openingHours} />}
            {(site.profile?.instagramUrl || site.profile?.tiktokUrl) && (
              <div className="flex flex-wrap gap-2">
                {site.profile?.instagramUrl && (
                  <a
                    href={site.profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--accent-solid)]/40 hover:text-[var(--accent-ink)] dark:border-white/[.12]"
                  >
                    {t.contact.instagram}
                  </a>
                )}
                {site.profile?.tiktokUrl && (
                  <a
                    href={site.profile.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--accent-solid)]/40 hover:text-[var(--accent-ink)] dark:border-white/[.12]"
                  >
                    {t.contact.tiktok}
                  </a>
                )}
              </div>
            )}
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
            className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 bg-gradient-accent px-5 text-sm font-medium text-[var(--accent-contrast)] shadow-lift"
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
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mb-3 text-sm text-[var(--theme-text-muted)] hover:underline"
                  >
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
