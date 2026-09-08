"use client";

import { useMemo, useState } from "react";

import { SafeImage } from "@/components/public/SafeImage";
import { DynamicSections } from "@/components/public/DynamicSections";
import type { PublicCategory, PublicWebsiteResponse } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { itemsUnder } from "@/lib/site/menu-categories";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars, effectiveTheme } from "@/lib/website/theme-config";

/**
 * The compact digital menu (MENU_COMPACT): the one a customer scans at a table.
 *
 * The other four menu layouts lead with photography. That is slow on a phone
 * on restaurant wifi, and it is actively useless for a drinks list where every
 * row is a name and a number. This one carries no item photographs at all -
 * the only image is the header - and everything else is text a thumb can move
 * through quickly.
 *
 * Three levels of navigation, narrowing as you go: the two top cards for Food
 * and Beverages, a scrolling row of that section's categories, then the list.
 *
 * The two cards are the owner's own top-level categories, not a fixed pair of
 * words. A place with "Food" and "Drinks" gets those; a bakery with one
 * top-level group gets no switch at all. And a menu with flat categories - no
 * parents, which is how most of them start - skips the cards entirely and puts
 * its categories straight into the chip row, so the template works on a menu
 * that was never structured for it.
 */

/** "18.50 USD" - the amount then the code, as the printed menus this imitates do. */
function price(amount: number | null | undefined, currency: string): string {
  if (amount === null || amount === undefined) return "";
  return `${amount.toFixed(2)} ${currency}`;
}

export function PublicMenuSiteCompact({
  site,
  onFirstView,
}: {
  site: PublicWebsiteResponse;
  onFirstView(itemId: string): void;
}) {
  const { t, dir } = useLocale();
  const content = parseDraftContent(site.publishedContent);

  /**
   * A parent with children is a section; a category with none is just a
   * category. Which shape the menu is in decides whether there is a top switch
   * at all.
   */
  const sections = useMemo(
    () => site.categories.filter((category) => category.subcategories.length > 0),
    [site.categories],
  );
  const hasSections = sections.length > 1;

  const [sectionId, setSectionId] = useState<string | null>(hasSections ? sections[0].id : null);

  /** The categories the chip row shows: a section's children, or every category when the menu is flat. */
  const categories: PublicCategory[] = useMemo(() => {
    if (!hasSections) return site.categories.filter((category) => itemsUnder(category).length > 0);
    const section = sections.find((candidate) => candidate.id === sectionId) ?? sections[0];
    return section.subcategories.filter((category) => category.items.length > 0);
  }, [hasSections, sections, sectionId, site.categories]);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const active = categories.find((category) => category.id === categoryId) ?? categories[0] ?? null;
  const items = active ? itemsUnder(active) : [];

  const [tab, setTab] = useState<"menu" | "about">("menu");
  const cover = site.profile?.coverImageUrl ?? site.galleryImageUrls?.[0] ?? null;

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[var(--compact-paper)] text-[var(--compact-ink)]"
      style={{
        ...themeCssVars(effectiveTheme(site.theme, site.layoutVariant), content.brandColor || undefined),
        ["--compact-paper" as string]: "#ffffff",
        ["--compact-ink" as string]: "#1c1c1e",
        ["--compact-muted" as string]: "#6f6f76",
        ["--compact-line" as string]: "#e6e6ea",
        ["--compact-chip" as string]: "#f2f2f4",
      }}
    >
      <header className="relative">
        {cover ? (
          <SafeImage src={cover} alt="" className="h-44 w-full object-cover sm:h-56" />
        ) : (
          <div className="h-28 w-full bg-[var(--accent-solid)]/15" />
        )}

        {/*
          Tabs sit on the photo, as on the menus this follows. The wrapper is
          full-bleed and the nav inside it shares the menu column's width, so on
          a wide screen the tabs line up with the dishes below rather than
          drifting off to the window's edge.
        */}
        <div className="absolute inset-x-0 bottom-0">
          <nav className="mx-auto flex max-w-2xl items-end gap-0 px-4">
            {(["menu", "about"] as const).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`rounded-t-md px-5 py-2.5 text-sm font-medium transition-colors ${
                  tab === name
                    ? "bg-[var(--compact-paper)] text-[var(--compact-ink)]"
                    : "bg-black/35 text-white/90 backdrop-blur-sm"
                }`}
              >
                {name === "menu" ? t.nav.menu : t.nav.about}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {tab === "about" ? (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="text-2xl font-bold tracking-tight">{site.businessName}</h1>
          {site.profile?.description && (
            <p className="mt-3 leading-relaxed text-[var(--compact-muted)]">{site.profile.description}</p>
          )}
          <DynamicSections sections={site.sections ?? []} tone="minimal" />
        </div>
      ) : (
        <main className="mx-auto max-w-2xl px-4 pb-16">
          {hasSections && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {sections.map((section) => {
                const selected = section.id === (sectionId ?? sections[0].id);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSectionId(section.id);
                      // The chip row is about to be replaced, so whatever was
                      // selected in the old section is meaningless now.
                      setCategoryId(null);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-6 text-sm font-medium transition-colors ${
                      selected
                        ? "border-transparent bg-[var(--compact-chip)] text-[var(--compact-muted)]"
                        : "border-[var(--compact-line)] bg-[var(--compact-paper)]"
                    }`}
                  >
                    <span aria-hidden className="text-2xl">
                      {/* A mark, not a photograph - the point of this template. */}
                      {selected ? "◉" : "○"}
                    </span>
                    {section.name}
                  </button>
                );
              })}
            </div>
          )}

          {categories.length > 0 && (
            <div className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max items-stretch gap-2 bg-[var(--compact-chip)] p-2">
                {categories.map((category) => {
                  const selected = category.id === (active?.id ?? "");
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      className={`whitespace-nowrap rounded-md border px-4 text-sm transition-colors ${
                        selected
                          ? "border-[var(--compact-line)] bg-[var(--compact-paper)] py-4 font-semibold"
                          : "border-[var(--compact-line)] bg-[var(--compact-paper)] py-3"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {active && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--accent-solid)]">{active.name}</h2>

              <ul className="mt-5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-[var(--compact-line)] py-3.5 last:border-b-0"
                    // Counted the same as on every other template - a visitor
                    // reading a dish here read it just as much as one who
                    // tapped a photograph of it somewhere else.
                    ref={() => onFirstView(item.id)}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-bold">{item.name}</span>
                      <span className="shrink-0 font-bold tabular-nums">
                        {price(item.discountPrice ?? item.price, site.currency)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-[var(--compact-muted)]">{item.description}</p>
                    )}
                  </li>
                ))}
              </ul>

              {items.length === 0 && (
                <p className="mt-5 text-sm text-[var(--compact-muted)]">{t.filter.noResults}</p>
              )}
            </section>
          )}
        </main>
      )}
    </div>
  );
}
