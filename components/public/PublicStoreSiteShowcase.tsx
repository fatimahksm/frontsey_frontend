"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { LocationCard } from "@/components/public/LocationCard";
import { PublicMenuItemCard } from "@/components/public/PublicMenuItemCard";
import { SafeImage } from "@/components/public/SafeImage";
import type { PublicCategory, PublicDeliveryArea, PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { CartLine } from "@/lib/site/cart";
import { cartSubtotal } from "@/lib/site/cart";
import { ListControls } from "@/components/public/ListControls";
import { ShowMore } from "@/components/public/ShowMore";
import { CONTROLS_THRESHOLD } from "@/lib/site/item-query";
import { itemsUnder } from "@/lib/site/menu-categories";
import { useListControls } from "@/lib/site/use-list-controls";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

/**
 * The shop front (STORE_SHOWCASE).
 *
 * A menu and a shop were the same template here until now, which read as an
 * efficiency and was not one. Someone opening a menu has already chosen the
 * restaurant and is deciding between dishes; someone opening a shop is
 * deciding whether to buy anything at all. The three things that follow from
 * that difference are what this page is built around, and are exactly what the
 * menu layouts have no reason to do:
 *
 * - Collections are entered, not filtered. They are photographed tiles you
 *   walk into, the way a shop's front page sends you to an aisle - not a row
 *   of chips narrowing one long list.
 * - The bag is always on screen, with its count and its running total. A menu
 *   is one sitting and one order; a shop is filled a thing at a time, and a
 *   total you have to open a drawer to see is a total nobody checks.
 * - Sold out is a state of the tile, not a line of small text inside it. In a
 *   shop it is the answer to the question being asked.
 */
export function PublicStoreSiteShowcase({
  site,
  onFirstView,
}: {
  site: PublicWebsiteResponse;
  onFirstView(itemId: string): void;
}) {
  const { t, dir } = useLocale();
  const content = parseDraftContent(site.publishedContent);

  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;

  /** Only collections with something in them - an empty aisle is a dead end. */
  const collections = useMemo(
    () => site.categories.filter((category) => itemsUnder(category).length > 0),
    [site.categories],
  );

  const openCollection = collections.find((category) => category.id === collectionId) ?? null;

  /**
   * Searching looks across the whole shop, not inside the open collection.
   * Someone typing "candle" wants the candle wherever it is filed; making them
   * guess the aisle first is the behaviour of a filter, and this is a search.
   */
  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    if (!searching) return [];
    return collections.flatMap((category) =>
      itemsUnder(category).filter((item) => itemMatchesQuery(item, query)),
    );
  }, [collections, query, searching]);

  // Entering a collection or typing a search is a different list; the count
  // starts again, which is what the reset key says.
  const list = useListControls(`${collectionId ?? ""}|${query.trim()}`);
  const matches = list.refine(searching ? results : openCollection ? itemsUnder(openCollection) : []);
  const shownItems = matches.slice(0, list.limit);
  /** Everything in the shop, before any narrowing - the controls are only worth a row when there is a lot to control. */
  const stockCount = useMemo(
    () => collections.reduce((sum, collection) => sum + itemsUnder(collection).length, 0),
    [collections],
  );

  const bagCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function handleAddToCart(line: CartLine) {
    setCart((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...prev, line];
    });
    // Deliberately no drawer here, unlike the menu layouts. A shop is filled a
    // thing at a time, and a panel over the products after every single one is
    // a panel you spend the visit closing. The bar below updates instead.
  }

  function handleRemove(key: string) {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }

  function handleCheckout(customer: Customer, deliveryArea: PublicDeliveryArea | null, deliveryFee: number) {
    if (!site.profile?.whatsappNumber) return;
    const message = buildWhatsAppMessage(
      site.businessName, cart, site.currency, deliveryArea?.name ?? null, deliveryFee, customer);
    window.open(whatsappUrl(site.profile.whatsappNumber, message), "_blank");
  }

  function enter(id: string | null) {
    setCollectionId(id);
    setQuery("");
    document.getElementById("shop-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      dir={dir}
      className="min-h-screen bg-background text-foreground"
      style={themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined)}
    >
      <header className="relative">
        {site.profile?.coverImageUrl ? (
          <SafeImage src={site.profile.coverImageUrl} alt="" className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="h-32 w-full bg-[var(--accent-solid)]/15" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-5xl items-end gap-4 px-4 pb-5">
          {site.profile?.logoUrl && (
            <SafeImage
              src={site.profile.logoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl border-2 border-white/80 object-cover"
            />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{site.businessName}</h1>
            {content.heroSubtitle && (
              <p className="mt-1 line-clamp-2 text-sm text-white/85">{content.heroSubtitle}</p>
            )}
          </div>
        </div>
      </header>

      <div id="shop-top" className="mx-auto max-w-5xl px-4 pb-32 pt-6">
        <label className="block">
          <span className="sr-only">{t.filter.searchProductsPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.filter.searchProductsPlaceholder}
            className="w-full rounded-full border border-[var(--theme-border)] bg-surface px-5 py-3 text-sm outline-none focus:border-[var(--accent-solid)]"
          />
        </label>

        {/*
          The way back out of an aisle. Only shown once you are in one, so the
          front page is the collections themselves rather than a page with a
          redundant "all" button on it.
        */}
        {(openCollection || searching) && (
          <button
            type="button"
            onClick={() => enter(null)}
            className="mt-4 text-sm font-medium text-[var(--accent-ink)] hover:underline"
          >
            {dir === "rtl" ? `${t.filter.all} →` : `← ${t.filter.all}`}
          </button>
        )}

        {!openCollection && !searching && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold" style={themeHeadingStyle()}>
              {t.nav.products}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {collections.map((collection) => (
                <CollectionTile key={collection.id} collection={collection} onOpen={() => enter(collection.id)} />
              ))}
            </div>
          </section>
        )}

        {(openCollection || searching) && (
          <section className="mt-6">
            {/*
              Searching, the heading is what was typed - not the field's own
              placeholder, which read "Search products..." as a title over the
              results and said nothing about them. The query needs no
              translating: the visitor wrote it.
            */}
            <h2 className="text-lg font-semibold" style={themeHeadingStyle()}>
              {searching ? query.trim() : openCollection?.name}
            </h2>
            {searching && (
              <p className="mt-1 text-xs text-[var(--theme-text-muted)]">
                {matches.length} {matches.length === 1 ? t.filter.itemSingular : t.filter.itemPlural}
              </p>
            )}
            {stockCount >= CONTROLS_THRESHOLD && (
              <div className="mt-3">
                <ListControls {...list.controlProps} currency={site.currency} />
              </div>
            )}
            {shownItems.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--theme-text-muted)]">{t.filter.noResults}</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {shownItems.map((item) => (
                  <Reveal key={item.id}>
                    <PublicMenuItemCard
                      item={item}
                      currency={site.currency}
                      orderingEnabled={orderingEnabled}
                      onAddToCart={handleAddToCart}
                      onFirstView={onFirstView}
                    />
                  </Reveal>
                ))}
              </div>
            )}
            <ShowMore shown={shownItems.length} total={matches.length} onShowMore={list.showMore} />
          </section>
        )}

        {site.profile?.description && (
          <section className="mt-12 rounded-2xl border border-[var(--theme-border)] bg-surface p-5">
            <h2 className="text-lg font-semibold" style={themeHeadingStyle()}>
              {t.nav.about}
            </h2>
            <p className="mt-2 leading-relaxed text-[var(--theme-text-muted)]">{site.profile.description}</p>
          </section>
        )}

        <DynamicSections sections={site.sections ?? []} tone="grid" />

        {site.profile && <LocationCard profile={site.profile} openingHours={site.openingHours} />}
      </div>

      {/*
        The bag bar. Present from the first product on and never in the way of
        one: it is the running total a shop is browsed against.
      */}
      {orderingEnabled && bagCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--theme-border)] bg-background/95 p-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            /*
              The left gutter is the language switcher's corner. It is fixed at
              bottom-left on every public site, and this is the first bar to
              run the full width of the screen down there, so it is the first
              to have to give it room. Only needed while the bar is wider than
              its own centred content - once the page is wide enough, the
              content already starts clear of it.
            */
            className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-3 pl-40 text-sm font-semibold text-[color:var(--accent-contrast)] lg:pl-5"
            style={{ background: "var(--accent-solid)" }}
          >
            <span>
              {bagCount} {bagCount === 1 ? t.cart.itemSingular : t.cart.itemsPlural}
            </span>
            {/* The bar is plainly a button; on a phone the words cost room the count and the total need. */}
            <span className="hidden sm:inline">{t.cart.viewOrder}</span>
            <span>{formatMoney(cartSubtotal(cart), site.currency)}</span>
          </button>
        </div>
      )}

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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-4 shadow-lift"
            >
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mb-3 text-sm text-[var(--theme-text-muted)] hover:underline"
              >
                {dir === "rtl" ? `${t.cart.close} →` : `← ${t.cart.close}`}
              </button>
              <CartPanel
                isShop
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
    </div>
  );
}

/**
 * One aisle, as a photograph you walk into.
 *
 * The picture is the first product in the collection that has one. A shop's
 * collections almost never carry an image of their own, so waiting for the
 * owner to add one would leave every tile blank on every real shop; borrowing
 * from the stock inside is both truthful about what is in there and free.
 */
function CollectionTile({ collection, onOpen }: { collection: PublicCategory; onOpen(): void }) {
  const { t } = useLocale();
  const items = itemsUnder(collection);
  const cover = items.find((item) => item.imageUrl)?.imageUrl ?? null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-[var(--theme-border)] text-start"
    >
      {cover ? (
        <SafeImage
          src={cover}
          alt=""
          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44"
        />
      ) : (
        <div className="h-36 w-full bg-[var(--accent-solid)]/15 sm:h-44" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-semibold text-white">{collection.name}</p>
        <p className="text-xs text-white/80">
          {items.length} {items.length === 1 ? t.filter.itemSingular : t.filter.itemPlural}
        </p>
      </div>
    </button>
  );
}
