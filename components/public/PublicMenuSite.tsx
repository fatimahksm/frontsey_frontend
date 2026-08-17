"use client";

import { MotionSafeImage, SafeImage } from "@/components/public/SafeImage";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { DynamicSections } from "@/components/public/DynamicSections";
import { PublicMenuListItem } from "@/components/public/PublicMenuListItem";
import type { PublicCategory, PublicMenuItem, PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

function sectionId(categoryId: string): string {
  return `category-${categoryId}`;
}

/** Floating "back to top" control, revealed once the visitor has scrolled past the hero. */
function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center text-lg text-[var(--accent-contrast)] shadow-lift"
      style={{ background: "var(--accent-solid)", borderRadius: "var(--theme-button-radius, 9999px)" }}
    >
      <span aria-hidden>↑</span>
    </button>
  );
}

/**
 * The Classic menu layout: a full-bleed hero, quick category buttons, and a
 * categorized price list with one level of sub-categories.
 *
 * Deliberately display-only - customers read what is on offer and what it
 * costs, and there is no cart, no quantity, and no ordering anywhere on the
 * page. Owners who want WhatsApp ordering pick one of the other menu
 * layouts; selecting this one pins the website to DISPLAY_ONLY (see
 * LayoutVariant.isDisplayOnly on the backend).
 *
 * The entire palette comes from the website's own theme (--theme-*), so the
 * client's chosen colours drive the page rather than any hardcoded scheme.
 */
export function PublicMenuSite({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [query, setQuery] = useState("");

  const content = parseDraftContent(site.publishedContent);
  const hasContact = !!(site.profile?.phone || site.profile?.address || site.openingHours.length > 0);

  // Hero text sits on white only when there is a photo (and its dark overlay)
  // behind it. Without a cover image it sits on the theme's own background,
  // where white would be invisible on any light palette.
  const hasCover = !!site.profile?.coverImageUrl;
  const heroText = hasCover ? "text-white" : "text-[var(--theme-text)]";

  const matching = (items: PublicMenuItem[]) => items.filter((item) => itemMatchesQuery(item, query));

  /** A category is shown only when it, or one of its sub-categories, still has a matching item. */
  const visibleCategories = site.categories
    .map((category) => ({
      category,
      directItems: matching(category.items),
      subgroups: category.subcategories
        .map((sub) => ({ sub, items: matching(sub.items) }))
        .filter((group) => group.items.length > 0),
    }))
    .filter((entry) => entry.directItems.length > 0 || entry.subgroups.length > 0);

  function scrollToCategory(category: PublicCategory) {
    document.getElementById(sectionId(category.id))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function itemRows(items: PublicMenuItem[]) {
    return (
      <div className="divide-y" style={{ borderColor: "var(--theme-border)" }}>
        {items.map((item) => (
          <PublicMenuListItem key={item.id} item={item} currency={site.currency} onFirstView={onFirstView} />
        ))}
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="flex flex-1 flex-col bg-[var(--theme-background)] text-[var(--theme-text)]"
      style={themeCssVars(site.theme, content.brandColor)}
    >
      {/* --- Hero: the business's own photo, its name, and its tagline --- */}
      <header
        className={`relative flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center ${
          hasCover ? "min-h-[78vh]" : "py-20"
        }`}
      >
        {hasCover && (
          <>
            <SafeImage src={site.profile!.coverImageUrl!} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/45" aria-hidden />
          </>
        )}

        {/* The auto margins spread nav/title/base over a tall photo hero; a
            short hero has no slack to distribute, so it uses plain spacing. */}
        <nav
          className={`relative z-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-lg font-medium ${
            hasCover ? "mb-auto" : "mb-12"
          } ${heroText}`}
        >
          <a href="#menu" className="hover:opacity-80">
            {t.nav.menu}
          </a>
          {site.profile?.description && (
            <a href="#about" className="hover:opacity-80">
              {t.nav.about}
            </a>
          )}
          {hasContact && (
            <a href="#contact" className="hover:opacity-80">
              {t.nav.contact}
            </a>
          )}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`relative z-10 flex flex-col items-center gap-4 ${hasCover ? "my-auto" : ""}`}
        >
          {site.profile?.logoUrl && (
            <SafeImage src={site.profile.logoUrl} alt="" className="h-24 w-24 rounded-full object-cover shadow-lift" />
          )}
          <h1
            className={`max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl ${heroText}`}
            style={themeHeadingStyle()}
          >
            {content.heroHeading || site.businessName}
          </h1>
          {content.heroHeading && (
            <p className={`text-xl font-medium ${hasCover ? "text-white/90" : "text-[var(--theme-text)]"}`}>
              {site.businessName}
            </p>
          )}
          {content.heroSubtitle && (
            <p className={`max-w-xl text-base ${hasCover ? "text-white/80" : "text-[var(--theme-text-muted)]"}`}>
              {content.heroSubtitle}
            </p>
          )}
        </motion.div>
        <div className="mb-auto" aria-hidden />
      </header>

      {/* --- Menu --- */}
      <section id="menu" className="mx-auto w-full max-w-3xl scroll-mt-4 px-5 py-14">
        <Reveal as="div" className="flex flex-col items-center">
          <h2 className="text-3xl font-semibold tracking-tight" style={themeHeadingStyle()}>
            {t.nav.menu}
          </h2>
          <span className="mt-3 h-1 w-16 rounded-full" style={{ background: "var(--accent-solid)" }} aria-hidden />
        </Reveal>

        {site.categories.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={(content.menuBusinessKind === "SHOP" ? t.filter.searchProductsPlaceholder : t.filter.searchPlaceholder)}
            className="mt-8 h-11 w-full border bg-transparent px-4 text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-muted)] focus:border-[var(--accent-solid)]"
            style={{ borderColor: "var(--theme-border)", borderRadius: "var(--theme-radius)" }}
          />
        )}

        {/* Quick jump buttons - the reference design's two-column category grid. */}
        {visibleCategories.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            {visibleCategories.map(({ category }) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category)}
                className="px-4 py-3.5 text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-90 sm:text-base"
                style={{ background: "var(--accent-solid)", borderRadius: "var(--theme-button-radius, 9999px)" }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {site.categories.length > 0 && visibleCategories.length === 0 && (
          <p className="mt-8 text-center text-sm text-[var(--theme-text-muted)]">{t.filter.noResults}</p>
        )}

        <div className="mt-4 flex flex-col" style={{ gap: "var(--theme-section-gap, 2.5rem)" }}>
          {visibleCategories.map(({ category, directItems, subgroups }) => (
            <section key={category.id} id={sectionId(category.id)} className="scroll-mt-4 pt-8">
              <Reveal as="div">
                <h3
                  className="text-center text-3xl font-bold tracking-tight text-[var(--accent-ink)]"
                  style={themeHeadingStyle()}
                >
                  {category.name}
                </h3>
                <div className="mt-4 border-t border-dashed" style={{ borderColor: "var(--theme-border)" }} aria-hidden />
              </Reveal>

              {directItems.length > 0 && itemRows(directItems)}

              {subgroups.map(({ sub, items }) => (
                <div key={sub.id} className="mt-6">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                    {sub.name}
                  </h4>
                  {itemRows(items)}
                </div>
              ))}
            </section>
          ))}
        </div>
      </section>

      {/* --- About --- */}
      {site.profile?.description && (
        <section id="about" className="mx-auto w-full max-w-3xl scroll-mt-4 px-5 py-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight" style={themeHeadingStyle()}>
            {t.nav.about}
          </h2>
          <span
            className="mx-auto mt-3 block h-1 w-16 rounded-full"
            style={{ background: "var(--accent-solid)" }}
            aria-hidden
          />
          <p className="mt-6 text-base leading-relaxed text-[var(--theme-text-muted)]">{site.profile.description}</p>
        </section>
      )}

      {site.galleryImageUrls.length > 0 && (
        <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 px-5 py-6 sm:grid-cols-3">
          {site.galleryImageUrls.map((url) => (
            <MotionSafeImage
              key={url}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              src={url}
              alt=""
              className="h-32 w-full object-cover"
              style={{ borderRadius: "var(--theme-radius)" }}
            />
          ))}
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-5">
        <DynamicSections sections={site.sections} tone="classic" />
      </div>

      {/* --- Contact --- */}
      {hasContact && (
        <section id="contact" className="mx-auto w-full max-w-3xl scroll-mt-4 px-5 py-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight" style={themeHeadingStyle()}>
            {t.nav.contact}
          </h2>
          <span
            className="mx-auto mt-3 block h-1 w-16 rounded-full"
            style={{ background: "var(--accent-solid)" }}
            aria-hidden
          />

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-[var(--theme-text-muted)]">
            {site.profile?.phone && <span>{site.profile.phone}</span>}
            {site.profile?.address && <span>{site.profile.address}</span>}
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {site.profile?.googleMapsUrl && (
                <a href={site.profile.googleMapsUrl} target="_blank" className="text-[var(--accent-ink)] hover:underline">
                  {t.contact.map}
                </a>
              )}
              {site.profile?.instagramUrl && (
                <a href={site.profile.instagramUrl} target="_blank" className="text-[var(--accent-ink)] hover:underline">
                  {t.contact.instagram}
                </a>
              )}
              {site.profile?.tiktokUrl && (
                <a href={site.profile.tiktokUrl} target="_blank" className="text-[var(--accent-ink)] hover:underline">
                  {t.contact.tiktok}
                </a>
              )}
            </div>
          </div>

          {site.openingHours.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-[var(--theme-text-muted)]">
              {site.openingHours.map((h) => (
                <span key={h.dayOfWeek}>
                  {t.hours.dayFull[h.dayOfWeek] ?? h.dayOfWeek}:{" "}
                  {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : t.hours.closed}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
        <footer
          className="mx-auto flex w-full max-w-3xl flex-col gap-4 border-t px-5 py-8 text-xs text-[var(--theme-text-muted)]"
          style={{ borderColor: "var(--theme-border)" }}
        >
          {Object.entries(site.profile?.policies ?? {}).map(([key, policyContent]) => (
            <details key={key}>
              <summary className="cursor-pointer font-medium">{t.policy[key.toLowerCase() as keyof typeof t.policy]}</summary>
              <p className="mt-2 whitespace-pre-wrap">{policyContent}</p>
            </details>
          ))}
        </footer>
      )}

      <BackToTop label={t.nav.home} />
    </div>
  );
}
