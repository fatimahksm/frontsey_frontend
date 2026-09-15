"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { ListControls } from "@/components/public/ListControls";
import { CartPanel } from "@/components/public/CartPanel";
import { DynamicSections } from "@/components/public/DynamicSections";
import { LocationCard } from "@/components/public/LocationCard";
import { SafeImage } from "@/components/public/SafeImage";
import { ShowMore } from "@/components/public/ShowMore";
import { thumbnailUrl } from "@/lib/images/thumbnail-url";
import type {
  PublicCategory,
  PublicDeliveryArea,
  PublicMenuItem,
  PublicWebsiteResponse,
} from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { CartLine } from "@/lib/site/cart";
import { cartSubtotal } from "@/lib/site/cart";
import { CONTROLS_THRESHOLD } from "@/lib/site/item-query";
import { itemsUnder } from "@/lib/site/menu-categories";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { useListControls } from "@/lib/site/use-list-controls";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";
import { parseDraftContent } from "@/lib/website/draft-content";
import { effectiveTheme, themeCssVars } from "@/lib/website/theme-config";

/**
 * The shop front (STORE_SHOWCASE): a fashion storefront.
 *
 * Built to a supplied design - a blush page with an orange accent, a script
 * wordmark centred between the utility icons, a hero with the model in a
 * circle, collections as round chips, and dense four-up product cards with a
 * corner badge and an Add To Cart under every one.
 *
 * Where the design shows content this platform has no data for, the block is
 * not drawn rather than filled with something invented. That means no row of
 * brand logos a shop does not stock, no "100% money back" a shop has not
 * promised, and no newsletter box that would collect an address nothing sends
 * to. The three trust badges are the exception that survived, because they can
 * be told truthfully: they are built from the owner's own delivery areas,
 * their WhatsApp number and their opening hours, and each disappears when the
 * fact behind it is missing.
 */

/** The corner badge. Only ever says something the item's own data says. */
function Badge({ item }: { item: PublicMenuItem }) {
  const { t } = useLocale();
  if (item.availability === "UNAVAILABLE") {
    return (
      <span className="absolute end-0 top-3 rounded-s-full bg-[var(--shop-ink)]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
        {t.item.currentlyUnavailable}
      </span>
    );
  }
  if (item.discountPrice != null && item.price > 0) {
    const off = Math.round(((item.price - item.discountPrice) / item.price) * 100);
    return (
      <span className="absolute end-0 top-3 rounded-s-full bg-[var(--accent-solid)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--accent-contrast)]">
        -{off}%
      </span>
    );
  }
  return null;
}

function ProductCard({
  item,
  currency,
  orderingEnabled,
  onAdd,
  onFirstView,
}: {
  item: PublicMenuItem;
  currency: string;
  orderingEnabled: boolean;
  onAdd(item: PublicMenuItem): void;
  onFirstView(itemId: string): void;
}) {
  const { t } = useLocale();
  const unavailable = item.availability === "UNAVAILABLE";
  const now = item.discountPrice ?? item.price;

  return (
    <motion.article
      whileHover={unavailable ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      // The card reports itself viewed on mount, as every other template does:
      // a product someone scrolled past was seen whether or not they tapped it.
      ref={() => onFirstView(item.id)}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-[var(--shop-card)] ${unavailable ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--shop-tint)]">
        {item.imageUrl && (
          <SafeImage
            src={thumbnailUrl(item.imageUrl)}
            fallbackSrc={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Badge item={item} />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 px-3 pb-3 pt-3 text-center">
        <h3 className="line-clamp-1 text-sm font-semibold">{item.name}</h3>
        <p className="text-sm">
          <span className="font-semibold text-[var(--accent-ink)]">{formatMoney(now, currency)}</span>
          {item.discountPrice != null && (
            <span className="ms-2 text-xs text-[var(--shop-muted)] line-through">
              {formatMoney(item.price, currency)}
            </span>
          )}
        </p>

        {orderingEnabled && !unavailable && (
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 border-t border-[var(--shop-line)] pt-2.5 text-xs font-semibold transition-colors hover:text-[var(--accent-ink)]"
          >
            <CartGlyph className="h-3.5 w-3.5" />
            {t.item.addToCart}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function CartGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" strokeLinecap="round" />
    </svg>
  );
}

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;

  const collections = useMemo(
    () => site.categories.filter((category) => itemsUnder(category).length > 0),
    [site.categories],
  );
  const stockCount = useMemo(
    () => collections.reduce((sum, collection) => sum + itemsUnder(collection).length, 0),
    [collections],
  );

  const list = useListControls(`${collectionId ?? ""}|${query.trim()}`);
  const chosen = collections.find((collection) => collection.id === collectionId) ?? null;
  const matches = useMemo(() => {
    const pool = chosen ? itemsUnder(chosen) : collections.flatMap(itemsUnder);
    return list.refine(pool.filter((item) => itemMatchesQuery(item, query)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refine's inputs are the control values, which are in the key it was built with
  }, [chosen, collections, query, list.controlProps.order, list.controlProps.min, list.controlProps.max]);
  const shown = matches.slice(0, list.limit);

  const bagCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  /**
   * One tap adds one of a thing.
   *
   * The design puts Add To Cart on the card itself, with no room for a size or
   * a quantity, so the line takes the item's own price and its first size when
   * it has any - the customer changes both in the cart, which is where this
   * design puts every decision that needs a form.
   */
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
    document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** The free-delivery promise, only when an owner has actually set one. */
  const freeOver = site.deliveryAreas
    .map((area) => area.freeThreshold)
    .filter((threshold): threshold is number => threshold != null)
    .sort((a, b) => a - b)[0];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[var(--shop-paper)] text-[var(--shop-ink)]"
      style={{
        ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined),
        // The design's own palette, kept as its own variables so the owner's
        // theme still drives the accent while the page keeps its blush ground.
        ["--shop-paper" as string]: "#fdf1ea",
        ["--shop-card" as string]: "#ffffff",
        ["--shop-tint" as string]: "#f7e3d8",
        ["--shop-ink" as string]: "#1c1a19",
        ["--shop-muted" as string]: "#8a807b",
        ["--shop-line" as string]: "#efe0d7",
      }}
    >
      {/* --- utility bar + wordmark + nav --- */}
      <header className="sticky top-0 z-30 border-b border-[var(--shop-line)] bg-[var(--shop-card)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {site.profile?.address ? (
            <a
              href={site.profile.googleMapsUrl ?? undefined}
              target={site.profile.googleMapsUrl ? "_blank" : undefined}
              rel="noreferrer"
              className="hidden min-w-0 items-center gap-1.5 text-xs text-[var(--shop-muted)] sm:flex"
            >
              <span aria-hidden className="text-[var(--accent-solid)]">📍</span>
              <span className="truncate">{site.profile.address}</span>
            </a>
          ) : (
            <span className="hidden sm:block sm:w-40" />
          )}

          <div className="flex min-w-0 items-center gap-2">
            {site.profile?.logoUrl && (
              <SafeImage
                src={thumbnailUrl(site.profile.logoUrl)}
                fallbackSrc={site.profile.logoUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            )}
            <span className="truncate text-xl font-semibold italic tracking-tight sm:text-2xl">
              {site.businessName}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1 sm:w-40">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-label={t.filter.searchProductsPlaceholder}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--shop-tint)]"
            >
              <SearchGlyph />
            </button>
            {orderingEnabled && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={t.cart.cart}
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--shop-tint)]"
              >
                <CartGlyph />
                {bagCount > 0 && (
                  <span
                    className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[color:var(--accent-contrast)]"
                    style={{ background: "var(--accent-solid)" }}
                  >
                    {bagCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* The collections, as the design's centred nav row. */}
        {collections.length > 0 && (
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2.5 sm:justify-center">
            <button
              type="button"
              onClick={() => choose(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
                collectionId === null ? "font-semibold text-[var(--accent-ink)]" : "text-[var(--shop-muted)]"
              }`}
            >
              {t.filter.all}
            </button>
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => choose(collection.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
                  collectionId === collection.id
                    ? "font-semibold text-[var(--accent-ink)]"
                    : "text-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
                }`}
              >
                {collection.name}
              </button>
            ))}
          </nav>
        )}

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--shop-line)]"
            >
              <div className="mx-auto max-w-6xl px-4 py-3">
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.filter.searchProductsPlaceholder}
                  className="w-full rounded-full border border-[var(--shop-line)] bg-[var(--shop-paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-solid)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- hero --- */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="grid grid-cols-1 items-center gap-6 rounded-2xl bg-[var(--shop-tint)] px-6 py-10 sm:px-10 md:grid-cols-2 md:py-14">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-ink)]">
              {t.section.featured}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
              {content.heroHeading || site.businessName}
            </h1>
            {content.heroSubtitle && (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--shop-muted)]">{content.heroSubtitle}</p>
            )}
            <button
              type="button"
              onClick={() => choose(null)}
              className="mt-7 rounded-md px-7 py-3 text-sm font-semibold text-[color:var(--accent-contrast)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--accent-solid)" }}
            >
              {t.hero.viewProducts}
            </button>
          </div>

          {site.profile?.coverImageUrl && (
            <div className="justify-self-center">
              {/* The circle is the design's own device: the photograph is cropped
                  to it rather than sat in a frame, so a portrait and a flat-lay
                  both land the same way. */}
              <div className="h-56 w-56 overflow-hidden rounded-full border-8 border-[var(--shop-card)] sm:h-72 sm:w-72">
                <SafeImage
                  src={site.profile.coverImageUrl}
                  alt=""
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- collections as round chips --- */}
      {collections.length > 1 && (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="flex gap-6 overflow-x-auto pb-2 sm:justify-center">
            {collections.map((collection) => (
              <CollectionChip
                key={collection.id}
                collection={collection}
                active={collectionId === collection.id}
                onOpen={() => choose(collection.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* --- products --- */}
      <section id="shop-products" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {chosen ? chosen.name : t.nav.products}
          </h2>
          <p className="text-xs text-[var(--shop-muted)]">
            {matches.length} {matches.length === 1 ? t.filter.itemSingular : t.filter.itemPlural}
          </p>
        </div>

        {stockCount >= CONTROLS_THRESHOLD && (
          <div className="mt-4">
            <ListControls {...list.controlProps} currency={site.currency} />
          </div>
        )}

        {shown.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--shop-muted)]">{t.filter.noResults}</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                currency={site.currency}
                orderingEnabled={orderingEnabled}
                onAdd={addToCart}
                onFirstView={onFirstView}
              />
            ))}
          </div>
        )}

        <ShowMore shown={shown.length} total={matches.length} onShowMore={list.showMore} />
      </section>

      {/* --- what the shop can actually promise --- */}
      <ShopPromises site={site} freeOver={freeOver} />

      {site.profile?.description && (
        <section className="mx-auto max-w-3xl px-4 py-10 text-center">
          <h2 className="text-xl font-bold tracking-tight">{t.nav.about}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shop-muted)]">{site.profile.description}</p>
        </section>
      )}

      <DynamicSections sections={site.sections ?? []} tone="grid" />

      <div className="mx-auto max-w-6xl px-4">
        {site.profile && <LocationCard profile={site.profile} openingHours={site.openingHours} />}
      </div>

      <footer className="mt-10 border-t border-[var(--shop-line)] bg-[var(--shop-card)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-center text-xs text-[var(--shop-muted)]">
          <span className="text-base font-semibold italic tracking-tight text-[var(--shop-ink)]">
            {site.businessName}
          </span>
          <span>
            © {new Date().getFullYear()} {site.businessName}. {t.contact.allRightsReserved}
          </span>
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
              className="fixed end-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto bg-[var(--shop-card)] p-4 shadow-lift"
            >
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mb-3 text-sm text-[var(--shop-muted)] hover:underline"
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

      {/* The running total, so a bag being filled is visible without opening it. */}
      {orderingEnabled && bagCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 end-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[color:var(--accent-contrast)] shadow-lift"
          style={{ background: "var(--accent-solid)" }}
        >
          <CartGlyph className="h-4 w-4" />
          {formatMoney(cartSubtotal(cart), site.currency)}
        </button>
      )}
    </div>
  );
}

/**
 * One collection as a round chip, the way the design opens its aisles.
 *
 * The picture is the first product in it that has one: a shop's collections
 * carry no image of their own, so waiting for the owner to add one would leave
 * every chip blank on every real shop.
 */
function CollectionChip({
  collection,
  active,
  onOpen,
}: {
  collection: PublicCategory;
  active: boolean;
  onOpen(): void;
}) {
  const cover = itemsUnder(collection).find((item) => item.imageUrl)?.imageUrl ?? null;

  return (
    <button type="button" onClick={onOpen} className="flex shrink-0 flex-col items-center gap-2">
      <span
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--shop-tint)] transition-shadow sm:h-20 sm:w-20 ${
          active ? "ring-2 ring-[var(--accent-solid)] ring-offset-2 ring-offset-[var(--shop-paper)]" : ""
        }`}
      >
        {cover && (
          <SafeImage
            src={thumbnailUrl(cover)}
            fallbackSrc={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </span>
      <span className={`max-w-20 truncate text-xs ${active ? "font-semibold" : "text-[var(--shop-muted)]"}`}>
        {collection.name}
      </span>
    </button>
  );
}

/**
 * The design's three trust badges, built only from things this shop has said.
 *
 * Free delivery appears when a delivery area has a threshold, the reply
 * promise when there is a WhatsApp number to reply on, and the opening line
 * when there are opening hours. A shop that has set none of them gets no strip
 * at all, rather than three claims nobody made.
 */
function ShopPromises({ site, freeOver }: { site: PublicWebsiteResponse; freeOver: number | undefined }) {
  const { t } = useLocale();

  const promises: { icon: string; title: string; body: string }[] = [];
  if (freeOver != null) {
    promises.push({
      icon: "🚚",
      title: t.policy.delivery,
      body: `${formatMoney(freeOver, site.currency)}+`,
    });
  }
  if (site.profile?.whatsappNumber) {
    promises.push({ icon: "💬", title: t.contact.contactUsOnWhatsApp, body: site.profile.whatsappNumber });
  }
  if (site.openingHours.length > 0) {
    promises.push({ icon: "🕘", title: t.hours.openingHours, body: "" });
  }
  if (promises.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[var(--shop-card)] p-5 sm:grid-cols-3">
        {promises.map((promise) => (
          <div key={promise.title} className="flex items-center gap-3">
            <span aria-hidden className="text-xl">{promise.icon}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{promise.title}</span>
              {promise.body && (
                <span className="block truncate text-xs text-[var(--shop-muted)]">{promise.body}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
