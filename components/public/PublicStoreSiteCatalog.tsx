"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { LocationCard } from "@/components/public/LocationCard";
import { PublicMenuItemCard } from "@/components/public/PublicMenuItemCard";
import { SafeImage } from "@/components/public/SafeImage";
import type { PublicDeliveryArea, PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { CartLine } from "@/lib/site/cart";
import { cartSubtotal } from "@/lib/site/cart";
import { ListControls } from "@/components/public/ListControls";
import { ShowMore } from "@/components/public/ShowMore";
import { CONTROLS_THRESHOLD, countItems, takeFromGroups } from "@/lib/site/item-query";
import { itemsUnder } from "@/lib/site/menu-categories";
import { useListControls } from "@/lib/site/use-list-controls";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

/**
 * The catalogue (STORE_CATALOG).
 *
 * The other shop template is for stock bought with the eye. This one is for
 * the shop with three hundred lines of it - a pharmacy, a hardware shop, a
 * phone accessories counter - where the visitor already knows the name of the
 * thing they came for and every second of scrolling is a second wasted.
 *
 * So: no cover photograph and no hero, because they push the only thing anyone
 * wants below the fold. The search field is the top of the page. Products are
 * rows, not tiles, with the thumbnail small enough that thirty fit on a phone
 * screen and the price aligned down a single column so it can be read straight
 * down the page. Collection headings stick as you pass them, so you always
 * know which part of the shop you are looking at.
 */
export function PublicStoreSiteCatalog({
  site,
  onFirstView,
}: {
  site: PublicWebsiteResponse;
  onFirstView(itemId: string): void;
}) {
  const { t, dir } = useLocale();
  const content = parseDraftContent(site.publishedContent);

  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;

  /**
   * Every collection, already narrowed by the search box and by the chosen
   * collection, with the empty ones dropped. Computed once so the headings,
   * the rows and the result count can never disagree with each other.
   */
  const list = useListControls(`${collectionId ?? ""}|${query.trim()}`);
  const groups = useMemo(() => {
    return site.categories
      .filter((category) => !collectionId || category.id === collectionId)
      .map((category) => ({
        id: category.id,
        name: category.name,
        items: list.refine(itemsUnder(category).filter((item) => itemMatchesQuery(item, query))),
      }))
      .filter((group) => group.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refine is rebuilt every render; its inputs are the controls, which are already in the key below
  }, [site.categories, collectionId, query, list.controlProps.order, list.controlProps.min, list.controlProps.max]);

  const total = countItems(groups);
  const pagedGroups = takeFromGroups(groups, list.limit);
  const shown = countItems(pagedGroups);
  /** Everything the shop stocks, before any narrowing - what decides whether the controls are worth a row of the screen. */
  const stockCount = useMemo(
    () => countItems(site.categories.map((category) => ({ items: itemsUnder(category) }))),
    [site.categories],
  );

  /**
   * Whether to give every row a picture column.
   *
   * All or none, decided once for the whole shop rather than per row: a column
   * that appears on some rows and not others is a ragged left edge down the
   * whole list, which is worse than no pictures at all. A shop that has
   * photographed nothing gets the tighter list it should have.
   */
  const showThumbnails = useMemo(
    () => site.categories.some((category) => itemsUnder(category).some((item) => item.imageUrl)),
    [site.categories],
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

  return (
    <div
      dir={dir}
      className="min-h-screen bg-background text-foreground"
      style={themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined)}
    >
      {/*
        A bar, not a hero. The shop's name and logo at the size they need to be
        recognised and no larger, because everything below them is the point.
      */}
      <header className="sticky top-0 z-30 border-b border-[var(--theme-border)] bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          {site.profile?.logoUrl && (
            <SafeImage src={site.profile.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
          )}
          <h1 className="truncate text-base font-semibold" style={themeHeadingStyle()}>
            {site.businessName}
          </h1>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <label className="block">
            <span className="sr-only">{t.filter.searchProductsPlaceholder}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.filter.searchProductsPlaceholder}
              className="w-full rounded-lg border border-[var(--theme-border)] bg-surface px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-solid)]"
            />
          </label>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-4">
        {/* Collections as a scrolling row: a jump, not the page's structure. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <CollectionChip active={collectionId === null} onClick={() => setCollectionId(null)}>
            {t.filter.all}
          </CollectionChip>
          {site.categories
            .filter((category) => itemsUnder(category).length > 0)
            .map((category) => (
              <CollectionChip
                key={category.id}
                active={collectionId === category.id}
                onClick={() => setCollectionId(category.id)}
              >
                {category.name}
              </CollectionChip>
            ))}
        </div>

        {stockCount >= CONTROLS_THRESHOLD && (
          <div className="mt-3">
            <ListControls {...list.controlProps} currency={site.currency} />
          </div>
        )}

        <p className="mt-3 text-xs text-[var(--theme-text-muted)]">
          {total} {total === 1 ? t.filter.itemSingular : t.filter.itemPlural}
        </p>

        {groups.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--theme-text-muted)]">{t.filter.noResults}</p>
        ) : (
          pagedGroups.map((group) => (
            <section key={group.id} className="mt-6">
              <h2
                className="sticky top-[104px] z-20 -mx-4 bg-background/95 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--accent-ink)] backdrop-blur"
                style={themeHeadingStyle()}
              >
                {group.name}
              </h2>
              <div className="divide-y divide-[var(--theme-border)]">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-1">
                    {showThumbnails && (
                      <SafeImage
                        src={item.imageUrl ?? ""}
                        alt=""
                        className="mt-3 h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    )}
                    {/* min-w-0 or the row's own text refuses to wrap and widens the page. */}
                    <div className="min-w-0 flex-1">
                      <PublicMenuItemCard
                        item={item}
                        currency={site.currency}
                        orderingEnabled={orderingEnabled}
                        onAddToCart={handleAddToCart}
                        onFirstView={onFirstView}
                        variant="elegant"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        <ShowMore shown={shown} total={total} onShowMore={list.showMore} shape="square" />

        {site.profile?.description && (
          <section className="mt-12 rounded-lg border border-[var(--theme-border)] bg-surface p-5">
            <h2 className="text-base font-semibold" style={themeHeadingStyle()}>
              {t.nav.about}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text-muted)]">{site.profile.description}</p>
          </section>
        )}

        <DynamicSections sections={site.sections ?? []} tone="elegant" />

        {site.profile && <LocationCard profile={site.profile} openingHours={site.openingHours} />}
      </div>

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
            className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-lg px-5 py-3 pl-40 text-sm font-semibold text-[color:var(--accent-contrast)] lg:pl-5"
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

function CollectionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-transparent text-[color:var(--accent-contrast)]"
          : "border-[var(--theme-border)] bg-surface text-[var(--theme-text-muted)]"
      }`}
      style={active ? { background: "var(--accent-solid)" } : undefined}
    >
      {children}
    </button>
  );
}
