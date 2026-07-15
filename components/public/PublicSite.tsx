"use client";

import { useEffect, useState } from "react";

import { CartPanel } from "@/components/public/CartPanel";
import { PublicMenuItemCard } from "@/components/public/PublicMenuItemCard";
import { publicSiteApi } from "@/lib/api/publicSite";
import type { PublicDeliveryArea, PublicWebsiteResponse } from "@/lib/api/types";
import type { CartLine } from "@/lib/site/cart";
import type { Customer } from "@/lib/site/whatsapp";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/site/whatsapp";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function PublicSite({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable" | "not_found">("loading");
  const [site, setSite] = useState<PublicWebsiteResponse | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    publicSiteApi
      .getBySlug(slug)
      .then((envelope) => {
        if (envelope.status === "AVAILABLE" && envelope.website) {
          setSite(envelope.website);
          setStatus("available");
        } else if (envelope.status === "UNAVAILABLE") {
          setStatus("unavailable");
        } else {
          setStatus("not_found");
        }
      })
      .catch(() => setStatus("not_found"));
  }, [slug]);

  function handleFirstView(itemId: string) {
    publicSiteApi.recordItemView(slug, itemId).catch(() => {});
  }

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
    if (!site?.profile?.whatsappNumber) return;
    const message = buildWhatsAppMessage(
      site.businessName,
      cart,
      site.currency,
      deliveryArea?.name ?? null,
      deliveryFee,
      customer,
    );
    window.open(whatsappUrl(site.profile.whatsappNumber, message), "_blank");
  }

  if (status === "loading") {
    return <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">Loading…</div>;
  }

  if (status === "not_found") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-zinc-500">This website doesn&apos;t exist.</p>
      </div>
    );
  }

  if (status === "unavailable" || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">Temporarily unavailable</h1>
        <p className="text-sm text-zinc-500">This website isn&apos;t available right now. Please check back later.</p>
      </div>
    );
  }

  const orderingEnabled = site.orderingMode === "WHATSAPP_ORDERING" && !!site.profile?.whatsappNumber;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <header className="mb-8">
          {site.profile?.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.profile.coverImageUrl} alt="" className="mb-4 h-48 w-full rounded-2xl object-cover" />
          )}
          <div className="flex items-center gap-4">
            {site.profile?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.profile.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{site.businessName}</h1>
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
                Map
              </a>
            )}
            {site.profile?.instagramUrl && (
              <a href={site.profile.instagramUrl} target="_blank" className="hover:underline">
                Instagram
              </a>
            )}
            {site.profile?.tiktokUrl && (
              <a href={site.profile.tiktokUrl} target="_blank" className="hover:underline">
                TikTok
              </a>
            )}
          </div>

          {site.openingHours.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
              {site.openingHours.map((h) => (
                <span key={h.dayOfWeek}>
                  {DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek}: {h.open ? `${h.opensAt?.slice(0, 5)}-${h.closesAt?.slice(0, 5)}` : "Closed"}
                </span>
              ))}
            </div>
          )}
        </header>

        {site.galleryImageUrls.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {site.galleryImageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-8">
          {site.categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">{category.name}</h2>
              <ul className="flex flex-col gap-3">
                {category.items.map((item) => (
                  <PublicMenuItemCard
                    key={item.id}
                    item={item}
                    currency={site.currency}
                    orderingEnabled={orderingEnabled}
                    onAddToCart={handleAddToCart}
                    onFirstView={handleFirstView}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>

        {(site.profile?.policies.PRIVACY ||
          site.profile?.policies.TERMS ||
          site.profile?.policies.DELIVERY ||
          site.profile?.policies.REFUND) && (
          <footer className="mt-10 flex flex-col gap-4 border-t border-black/[.06] pt-6 text-xs text-zinc-500 dark:border-white/[.1]">
            {Object.entries(site.profile?.policies ?? {}).map(([key, content]) => (
              <details key={key}>
                <summary className="cursor-pointer font-medium">{key.charAt(0) + key.slice(1).toLowerCase()} policy</summary>
                <p className="mt-2 whitespace-pre-wrap">{content}</p>
              </details>
            ))}
          </footer>
        )}
      </div>

      {orderingEnabled && (
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <CartPanel
            lines={cart}
            currency={site.currency}
            deliveryAreas={site.deliveryAreas}
            onRemove={handleRemove}
            onCheckout={handleCheckout}
          />
        </aside>
      )}
    </div>
  );
}
