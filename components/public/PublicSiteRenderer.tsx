import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { PublicMenuSite } from "@/components/public/PublicMenuSite";
import { PublicMenuSiteBistro } from "@/components/public/PublicMenuSiteBistro";
import { PublicMenuSiteElegant } from "@/components/public/PublicMenuSiteElegant";
import { PublicMenuSiteGrid } from "@/components/public/PublicMenuSiteGrid";
import { PublicPortfolioSiteProfessional } from "@/components/public/PublicPortfolioSiteProfessional";
import { PublicPortfolioSiteBrand } from "@/components/public/PublicPortfolioSiteBrand";
import { PublicPortfolioSiteVisual } from "@/components/public/PublicPortfolioSiteVisual";
import { PublicPortfolioSiteServices } from "@/components/public/PublicPortfolioSiteServices";
import { PublicEventsSite } from "@/components/public/PublicEventsSite";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

function renderLayout(site: PublicWebsiteResponse, onFirstView: (itemId: string) => void, isSample: boolean) {
  switch (site.layoutVariant) {
    case "MENU_GRID":
      return <PublicMenuSiteGrid site={site} onFirstView={onFirstView} />;
    case "MENU_ELEGANT":
      return <PublicMenuSiteElegant site={site} onFirstView={onFirstView} />;
    case "MENU_BISTRO":
      return <PublicMenuSiteBistro site={site} onFirstView={onFirstView} />;
    case "PORTFOLIO_VISUAL":
      return <PublicPortfolioSiteVisual site={site} isSample={isSample} />;
    case "PORTFOLIO_BRAND":
      return <PublicPortfolioSiteBrand site={site} isSample={isSample} />;
    case "PORTFOLIO_SERVICES":
      return <PublicPortfolioSiteServices site={site} isSample={isSample} />;
    case "EVENTS_CELEBRATION":
      return <PublicEventsSite site={site} />;
    case "PORTFOLIO_PROFESSIONAL":
      return <PublicPortfolioSiteProfessional site={site} isSample={isSample} />;
    case "MENU_CLASSIC":
    default:
      return <PublicMenuSite site={site} onFirstView={onFirstView} />;
  }
}

/**
 * Single dispatch point from (templateType, layoutVariant) to the actual
 * page component - used by both the live public site and the owner
 * preview, so they can never drift apart. Also the single place the
 * visitor-facing LocaleProvider/LanguageSwitcher are mounted, so every
 * consumer (public site, draft preview, wizard mock preview, admin theme
 * preview) gets language switching for free.
 */
export function PublicSiteRenderer({
  site,
  onFirstView,
  isSample = false,
}: {
  site: PublicWebsiteResponse;
  onFirstView(itemId: string): void;
  /**
   * True only where the caller knowingly passes fabricated content - the design
   * gallery and the template pickers, which all render `mockSiteFor(...)`.
   *
   * It defaults to false and is never derived from the data, because every
   * field in the response is user-editable: an owner who slugs their site
   * "preview" must not have demo content appear on it. A published site can
   * therefore only ever be treated as real.
   */
  isSample?: boolean;
}) {
  return (
    <LocaleProvider defaultLocale={site.primaryLanguage}>
      {renderLayout(site, onFirstView, isSample)}
      <LanguageSwitcher />
    </LocaleProvider>
  );
}
