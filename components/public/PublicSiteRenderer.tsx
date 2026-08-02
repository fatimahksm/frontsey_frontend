import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { PublicMenuSite } from "@/components/public/PublicMenuSite";
import { PublicMenuSiteBistro } from "@/components/public/PublicMenuSiteBistro";
import { PublicMenuSiteElegant } from "@/components/public/PublicMenuSiteElegant";
import { PublicMenuSiteGrid } from "@/components/public/PublicMenuSiteGrid";
import { PublicPortfolioSite } from "@/components/public/PublicPortfolioSite";
import { PublicPortfolioSiteBold } from "@/components/public/PublicPortfolioSiteBold";
import { PublicPortfolioSiteMinimal } from "@/components/public/PublicPortfolioSiteMinimal";
import { PublicPortfolioSiteProfile } from "@/components/public/PublicPortfolioSiteProfile";
import type { PublicWebsiteResponse } from "@/lib/api/types";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

function renderLayout(site: PublicWebsiteResponse, onFirstView: (itemId: string) => void) {
  switch (site.layoutVariant) {
    case "MENU_GRID":
      return <PublicMenuSiteGrid site={site} onFirstView={onFirstView} />;
    case "MENU_ELEGANT":
      return <PublicMenuSiteElegant site={site} onFirstView={onFirstView} />;
    case "MENU_BISTRO":
      return <PublicMenuSiteBistro site={site} onFirstView={onFirstView} />;
    case "PORTFOLIO_MINIMAL":
      return <PublicPortfolioSiteMinimal site={site} />;
    case "PORTFOLIO_BOLD":
      return <PublicPortfolioSiteBold site={site} />;
    case "PORTFOLIO_PROFILE":
      return <PublicPortfolioSiteProfile site={site} />;
    case "PORTFOLIO_HERO":
      return <PublicPortfolioSite site={site} />;
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
export function PublicSiteRenderer({ site, onFirstView }: { site: PublicWebsiteResponse; onFirstView(itemId: string): void }) {
  return (
    <LocaleProvider defaultLocale={site.primaryLanguage}>
      {renderLayout(site, onFirstView)}
      <LanguageSwitcher />
    </LocaleProvider>
  );
}
