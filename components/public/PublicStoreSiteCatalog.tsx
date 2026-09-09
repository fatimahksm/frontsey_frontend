"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { ListControls } from "@/components/public/ListControls";
import { LocationCard } from "@/components/public/LocationCard";
import { SafeImage } from "@/components/public/SafeImage";
import { ShowMore } from "@/components/public/ShowMore";
import { thumbnailUrl } from "@/lib/images/thumbnail-url";
import type { PublicDeliveryArea, PublicMenuItem, PublicWebsiteResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { CartLine } from "@/lib/site/cart";
import { cartSubtotal } from "@/lib/site/cart";
import { CONTROLS_THRESHOLD, countItems, takeFromGroups } from "@/lib/site/item-query";
import { itemsUnder } from "@/lib/site/menu-categories";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { useListControls } from "@/lib/site/use-list-controls";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The catalogue (STORE_CATALOG): a printed index, not a shop window.
 *
 * The other shop template is for stock bought with the eye. This one is for
 * the shop with three hundred lines of it - a hardware shop, a pharmacy, a
 * phone accessories counter - where the visitor already knows the name of the
 * thing they came for.
 *
 * So it is built as an index rather than a gallery, and every decision follows
 * from that. There is no hero, because a photograph at the top of a reference
 * page is a screen of scrolling before the first useful line. The search field
 * is the page's masthead rather than an icon to find. Collections are a
 * numbered contents list down the side, the way a catalogue's sections are
 * numbered, and each says how many lines it holds. Products are rows on a
 * strict grid - thumbnail, name, one line of description, price aligned down a
 * single column in tabular figures so the eye can run down it without reading.
 *
 * Ink on paper, one accent, and nothing else coloured: on a page that is
 * mostly a list, colour is how the few things that matter - the price you are
 * scanning for, the thing that is out of stock - stay findable.
 */

function ProductRow({
  item,
  index,
  currency,
  orderingEnabled,
  showThumbnail,
  onAdd,
  onFirstView,
}: {
  item: PublicMenuItem;
  index: number;
  currency: string;
  orderingEnabled: boolean;
  showThumbnail: boolean;
  onAdd(item: PublicMenuItem): void;
  onFirstView(itemId: string): void;
}) {
  const { t } = useLocale();
  const unavailable = item.availability === "UNAVAILABLE";
  const now = item.discountPrice ?? item.price;

  return (
    <li>
      {/* An <article> because a listed product is a self-contained thing, the
          same as it is on the other shop template - which also means one
          selector finds a product on either of them. */}
      <article
        ref={() => onFirstView(item.id)}
        className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--cat-rule)] py-3 transition-colors hover:bg-[var(--cat-hover)] sm:gap-4 ${
          unavailable ? "opacity-55" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {/* The line number. A catalogue is referred to by position as much as
              by name - "the third one down" is how a counter conversation goes. */}
          <span className="w-6 shrink-0 text-end text-[11px] tabular-nums text-[var(--cat-faint)]">
            {String(index).padStart(2, "0")}
          </span>
          {showThumbnail && (
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded bg-[var(--cat-tint)] sm:h-14 sm:w-14">
              {item.imageUrl && (
                <SafeImage
                  src={thumbnailUrl(item.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-[15px]">{item.name}</p>
          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--cat-muted)]">{item.description}</p>
          )}
          {unavailable && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--accent-ink)]">
              {t.item.currentlyUnavailable}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="text-end">
            <span className="block text-sm font-semibold tabular-nums sm:text-base">
              {formatMoney(now, currency)}
            </span>
            {item.discountPrice != null && (
              <span className="block text-[11px] tabular-nums text-[var(--cat-faint)] line-through">
                {formatMoney(item.price, currency)}
              </span>
            )}
          </span>

          {orderingEnabled && !unavailable && (
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`${t.item.addToCart}: ${item.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--cat-rule)] text-lg leading-none transition-colors hover:border-transparent hover:bg-[var(--accent-solid)] hover:text-[color:var(--accent-contrast)]"
            >
              +
            </button>
          )}
        </div>
      </article>
    </li>
  );
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refine's inputs are the control values, which are already in the key it was built with
  }, [site.categories, collectionId, query, list.controlProps.order, list.controlProps.min, list.controlProps.max]);

  const total = countItems(groups);
  const pagedGroups = takeFromGroups(groups, list.limit);
  const shown = countItems(pagedGroups);

  /** Every collection with something in it, and how much - the contents list. */
  const contents = useMemo(
    () =>
      site.categories
        .map((category) => ({ id: category.id, name: category.name, count: itemsUnder(category).length }))
        .filter((entry) => entry.count > 0),
    [site.categories],
  );
  const stockCount = contents.reduce((sum, entry) => sum + entry.count, 0);

  /**
   * All rows carry a picture column or none do, decided once for the whole
   * shop. A column that appears on some rows and not others is a ragged edge
   * down the page, which is worse on an index than no pictures at all.
   */
  const showThumbnails = useMemo(
    () => site.categories.some((category) => itemsUnder(category).some((item) => item.imageUrl)),
    [site.categories],
  );

  const bagCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function addToCart(item: PublicMenuItem) {
    const size = item.sizes[0] ?? null;
    const line: CartLine = {
      key: `${item.id}:${size?.id ?? ""}`,
      itemId: item.id,
      itemName: item.name,
      imageUrl: item.imageUrl,
      variantLabel: size?.label ?? null,
      unitPrice: size?.price ?? item.discountPrice ?? item.price,
      addons: [],
      quantity: 1,
    };
    setCart((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, line];
    });
  }

  function handleCheckout(customer: Customer, deliveryArea: PublicDeliveryArea | null, deliveryFee: number) {
    if (!site.profile?.whatsappNumber) return;
    const message = buildWhatsAppMessage(
      site.businessName, cart, site.currency, deliveryArea?.name ?? null, deliveryFee, customer);
    window.open(whatsappUrl(site.profile.whatsappNumber, message), "_blank");
  }

  function choose(id: string | null) {
    setCollectionId(id);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[var(--cat-paper)] text-[var(--cat-ink)]"
      style={{
        ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined),
        ["--cat-paper" as string]: "#faf9f7",
        ["--cat-panel" as string]: "#ffffff",
        ["--cat-ink" as string]: "#16151a",
        ["--cat-muted" as string]: "#6f6b78",
        ["--cat-faint" as string]: "#a8a4ae",
        ["--cat-rule" as string]: "#e7e4e0",
        ["--cat-tint" as string]: "#f1efec",
        ["--cat-hover" as string]: "#f4f2ef",
      }}
    >
      {/*
        The masthead. The search field is in it rather than behind an icon,
        because on a page whose whole purpose is finding one line among
        hundreds, a search you have to open first is the wrong default.
      */}
      <header className="sticky top-0 z-30 border-b border-[var(--cat-rule)] bg-[var(--cat-panel)]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            {site.profile?.logoUrl && (
              <SafeImage
                src={thumbnailUrl(site.profile.logoUrl)}
                alt=""
                className="h-9 w-9 shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold tracking-tight">{site.businessName}</h1>
              {content.heroSubtitle && (
                <p className="truncate text-xs text-[var(--cat-muted)]">{content.heroSubtitle}</p>
              )}
            </div>
            {orderingEnabled && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="shrink-0 rounded-full border border-[var(--cat-rule)] px-3 py-1.5 text-xs font-semibold tabular-nums"
              >
                {bagCount > 0 ? formatMoney(cartSubtotal(cart), site.currency) : t.cart.cart}
              </button>
            )}
          </div>

          <label className="mt-3 block">
            <span className="sr-only">{t.filter.searchProductsPlaceholder}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.filter.searchProductsPlaceholder}
              className="w-full rounded-lg border border-[var(--cat-rule)] bg-[var(--cat-paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-solid)]"
            />
          </label>
        </div>
      </header>

      <div id="catalogue" className="mx-auto max-w-5xl scroll-mt-32 gap-8 px-4 py-6 lg:flex">
        {/* --- the contents list --- */}
        <aside className="lg:w-52 lg:shrink-0">
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--cat-faint)] lg:block">
            {t.nav.products}
          </p>

          {/* A column on a wide screen, a scrolling row on a phone: the same
              list, in the shape each has room for. */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-3 lg:flex-col lg:overflow-visible lg:px-0">
            <ContentsEntry
              label={t.filter.all}
              count={stockCount}
              active={collectionId === null}
              onClick={() => choose(null)}
            />
            {contents.map((entry, i) => (
              <ContentsEntry
                key={entry.id}
                index={i + 1}
                label={entry.name}
                count={entry.count}
                active={collectionId === entry.id}
                onClick={() => choose(entry.id)}
              />
            ))}
          </div>
        </aside>

        {/* --- the index itself --- */}
        <main className="min-w-0 flex-1 pt-5 lg:pt-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[var(--cat-ink)] pb-2">
            <h2 className="text-lg font-bold tracking-tight">
              {collectionId ? contents.find((entry) => entry.id === collectionId)?.name : t.nav.products}
            </h2>
            <p className="text-xs tabular-nums text-[var(--cat-muted)]">
              {total} {total === 1 ? t.filter.itemSingular : t.filter.itemPlural}
            </p>
          </div>

          {stockCount >= CONTROLS_THRESHOLD && (
            <div className="mt-4">
              <ListControls {...list.controlProps} currency={site.currency} />
            </div>
          )}

          {pagedGroups.length === 0 ? (
            <p className="mt-10 text-sm text-[var(--cat-muted)]">{t.filter.noResults}</p>
          ) : (
            pagedGroups.map((group, groupIndex) => {
              // Numbering runs across the whole page rather than restarting per
              // section, so "line 41" means one thing on the page it is on.
              const before = pagedGroups
                .slice(0, groupIndex)
                .reduce((sum, earlier) => sum + earlier.items.length, 0);
              return (
                <section key={group.id} className="mt-8 first:mt-6">
                  <h3 className="sticky top-[132px] z-20 -mx-4 flex items-baseline gap-3 bg-[var(--cat-paper)]/95 px-4 py-2 backdrop-blur">
                    <span className="text-[11px] font-bold tabular-nums text-[var(--accent-ink)]">
                      {String(groupIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-[0.14em]">{group.name}</span>
                    <span className="h-px flex-1 bg-[var(--cat-rule)]" aria-hidden />
                    <span className="text-[11px] tabular-nums text-[var(--cat-faint)]">{group.items.length}</span>
                  </h3>

                  <ul className="mt-1">
                    {group.items.map((item, i) => (
                      <ProductRow
                        key={item.id}
                        item={item}
                        index={before + i + 1}
                        currency={site.currency}
                        orderingEnabled={orderingEnabled}
                        showThumbnail={showThumbnails}
                        onAdd={addToCart}
                        onFirstView={onFirstView}
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          )}

          <ShowMore shown={shown} total={total} onShowMore={list.showMore} shape="square" />

          {site.profile?.description && (
            <section className="mt-12 border-t border-[var(--cat-rule)] pt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">{t.nav.about}</h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--cat-muted)]">
                {site.profile.description}
              </p>
            </section>
          )}

          <DynamicSections sections={site.sections ?? []} tone="elegant" />

          {site.profile && <LocationCard profile={site.profile} openingHours={site.openingHours} />}
        </main>
      </div>

      <footer className="border-t border-[var(--cat-rule)] bg-[var(--cat-panel)]">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-[var(--cat-muted)]">
          © {new Date().getFullYear()} {site.businessName}. {t.contact.allRightsReserved}
        </div>
      </footer>

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
              className="fixed end-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto bg-[var(--cat-panel)] p-4 shadow-lift"
            >
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mb-3 text-sm text-[var(--cat-muted)] hover:underline"
              >
                {dir === "rtl" ? `${t.cart.close} →` : `← ${t.cart.close}`}
              </button>
              <CartPanel
                isShop
                lines={cart}
                currency={site.currency}
                deliveryAreas={site.deliveryAreas}
                onRemove={(key) => setCart((prev) => prev.filter((line) => line.key !== key))}
                onCheckout={handleCheckout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** One line of the contents list: number, name, and how many it holds. */
function ContentsEntry({
  index,
  label,
  count,
  active,
  onClick,
}: {
  index?: number;
  label: string;
  count: number;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-baseline gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors lg:w-full lg:rounded-none lg:border-b lg:border-[var(--cat-rule)] lg:px-0 lg:py-2.5 ${
        active
          ? "bg-[var(--accent-solid)] font-semibold text-[color:var(--accent-contrast)] lg:bg-transparent lg:text-[var(--accent-ink)]"
          : "text-[var(--cat-muted)] hover:text-[var(--cat-ink)]"
      }`}
    >
      {index != null && (
        <span className="hidden text-[11px] tabular-nums text-[var(--cat-faint)] lg:inline">
          {String(index).padStart(2, "0")}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="text-[11px] tabular-nums opacity-70">{count}</span>
    </button>
  );
}
