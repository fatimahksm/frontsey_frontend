import { PublicMenuSite } from "@/components/public/PublicMenuSite";
import { PublicMenuSiteGrid } from "@/components/public/PublicMenuSiteGrid";
import { PublicPortfolioSite } from "@/components/public/PublicPortfolioSite";
import { PublicPortfolioSiteMinimal } from "@/components/public/PublicPortfolioSiteMinimal";
import type { PublicWebsiteResponse } from "@/lib/api/types";

/** Single dispatch point from (templateType, layoutVariant) to the actual page component - used by both the live public site and the owner preview, so they can never drift apart. */
export function PublicSiteRenderer({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  switch (site.layoutVariant) {
    case "MENU_GRID":
      return <PublicMenuSiteGrid site={site} onFirstView={onFirstView} />;
    case "PORTFOLIO_MINIMAL":
      return <PublicPortfolioSiteMinimal site={site} />;
    case "PORTFOLIO_HERO":
      return <PublicPortfolioSite site={site} />;
    case "MENU_CLASSIC":
    default:
      return <PublicMenuSite site={site} onFirstView={onFirstView} />;
  }
}
