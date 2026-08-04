"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DynamicSections } from "@/components/public/DynamicSections";
import { PublicMenuListItem } from "@/components/public/PublicMenuListItem";
import type { PublicMenuItem, PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { itemsUnder } from "@/lib/site/menu-categories";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

/**
 * The Classic menu layout: a business-card header, a gallery strip, and a
 * categorized price list with one level of sub-categories.
 *
 * Deliberately display-only - customers read what is on offer and what it
 * costs, and there is no cart, no quantity, and no ordering anywhere on the
 * page. Owners who want WhatsApp ordering pick one of the other menu
 * layouts; selecting this one pins the website to DISPLAY_ONLY (see
 * LayoutVariant.isDisplayOnly on the backend).
 */
export function PublicMenuSite({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [activeCategoryId, setActiveCategoryId] = useState(site.categories[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const content = parseDraftContent(site.publishedContent);
  const activeCategory = site.categories.find((c) => c.id === activeCategoryId) ?? site.categories[0];

  const matching = (items: PublicMenuItem[]) => items.filter((item) => itemMatchesQuery(item, query));
  const directMatches = activeCategory ? matching(activeCategory.items) : [];
  const matchingSubcategories = activeCategory
    ? activeCategory.subcategories
        .map((sub) => ({ sub, items: matching(sub.items) }))
        .filter((group) => group.items.length > 0)
    : [];
  const hasResults = directMatches.length > 0 || matchingSubcategories.length > 0;

  function itemGrid(items: PublicMenuItem[], key: string) {
    return (
      <StaggerGroup key={key} className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <StaggerItem key={item.id}>
            <PublicMenuListItem item={item} currency={site.currency} onFirstView={onFirstView} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    );
  }

  return (
    <div
      dir={dir}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10"
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
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
              {site.openingHours.map((h) => (
                <span key={h.dayOfWeek}>
                  {t.hours.dayFull[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : t.hours.closed}
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

        {site.categories.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.filter.searchPlaceholder}
            className="mb-4 h-11 w-full rounded-xl border border-black/[.12] bg-surface px-3.5 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[var(--accent-solid)]/40 dark:border-white/[.16]"
          />
        )}

        {site.categories.length > 0 && (
          <Reveal as="div" className="mb-6 flex flex-wrap gap-2">
            {site.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                aria-pressed={activeCategory?.id === category.id}
                style={{ borderRadius: "var(--theme-button-radius, 9999px)" }}
                className={`inline-flex items-center gap-1.5 border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory?.id === category.id
                    ? "border-transparent bg-[var(--accent-solid)] text-white"
                    : "border-black/[.1] text-zinc-600 hover:bg-black/[.04] dark:border-white/[.16] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                }`}
              >
                {category.name}
                <span className={activeCategory?.id === category.id ? "text-white/70" : "text-zinc-400"}>
                  {itemsUnder(category).length}
                </span>
              </button>
            ))}
          </Reveal>
        )}

        {activeCategory && !hasResults && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.filter.noResults}</p>
        )}

        {activeCategory && hasResults && (
          <div key={activeCategory.id} className="flex flex-col gap-8">
            {/* Items filed straight against the category, before any sub-category. */}
            {directMatches.length > 0 && itemGrid(directMatches, `${activeCategory.id}-direct`)}

            {matchingSubcategories.map(({ sub, items }) => (
              <section key={sub.id} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {sub.name}
                </h2>
                {itemGrid(items, sub.id)}
              </section>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-8">
          <DynamicSections sections={site.sections} tone="classic" />
        </div>

        {(site.profile?.policies.PRIVACY || site.profile?.policies.TERMS || site.profile?.policies.DELIVERY || site.profile?.policies.REFUND) && (
          <footer className="mt-10 flex flex-col gap-4 border-t border-black/[.06] pt-6 text-xs text-zinc-500 dark:border-white/[.1]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, content]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{t.policy[key.toLowerCase() as keyof typeof t.policy]}</summary>
                <p className="mt-2 whitespace-pre-wrap">{content}</p>
              </details>
            ))}
          </footer>
        )}
      </div>
    </div>
  );
}
