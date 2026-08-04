"use client";

import { SafeImage } from "@/components/public/SafeImage";
import { motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { PublicMenuItemCard } from "@/components/public/PublicMenuItemCard";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { itemsUnder } from "@/lib/site/menu-categories";
import { itemMatchesQuery } from "@/lib/site/menu-search";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, themeHeadingStyle } from "@/lib/website/theme-config";

/**
 * The "Elegant" layout for MENU_ORDERING: a fine-dining menu card, and
 * deliberately nothing else - masthead, search, and the dishes with dotted
 * price leaders.
 *
 * This layout is display-only by design, so it ignores the website's
 * `orderingMode` instead of respecting it: there is no cart, no add-to-cart,
 * and no checkout on any Elegant site. It also skips the owner's custom
 * sections (testimonials, FAQ, about, team) and the contact block that the
 * other menu layouts render. That is the point of it - the layouts that carry
 * all of that are Grid and Classic, and an owner who wants them picks one of
 * those. Keeping the page to a single column of food is what makes this one
 * read like a printed menu rather than a web page.
 */
export function PublicMenuSiteElegant({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  const { t, dir } = useLocale();
  const [query, setQuery] = useState("");

  const content = parseDraftContent(site.publishedContent);
  const visibleCategories = site.categories
    .map((category) => ({ ...category, items: itemsUnder(category).filter((item) => itemMatchesQuery(item, query)) }))
    .filter((category) => category.items.length > 0);

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
            <SafeImage src={site.profile.logoUrl} alt="" className="mb-4 h-16 w-16 rounded-full object-cover shadow-soft" />
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
                    orderingEnabled={false}
                    onAddToCart={() => {}}
                    onFirstView={onFirstView}
                    variant="elegant"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
