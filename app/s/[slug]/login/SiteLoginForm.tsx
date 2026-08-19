"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { friendlyMessage } from "@/lib/api/client";
import { publicSiteApi } from "@/lib/api/publicSite";
import { websitesApi } from "@/lib/api/websites";
import { useAuth } from "@/lib/auth/auth-context";
import { grantConsoleAccess, hasConsoleAccess } from "@/lib/website/console-session";
import { parseDraftContent } from "@/lib/website/draft-content";
import { themeCssVars } from "@/lib/website/theme-config";
import type { ThemeConfig } from "@/lib/website/theme-config";

/**
 * The sign-in form for one business's admin console.
 *
 * It dresses itself in that site's own theme - their logo, their accent colour,
 * their headline - because this screen belongs to the business, not to the
 * platform. The lookup is the public endpoint: whoever is reading this has not
 * signed in yet, so nothing here can require a token.
 *
 * The access check is the point of having a separate door. A valid platform
 * session is not permission to be in this console, so after signing in we
 * confirm the account actually reaches this website and say so plainly when it
 * does not - rather than letting them in and failing on the next request.
 */

interface Brand {
  name: string;
  logoUrl: string | null;
  tagline: string | null;
  theme: ThemeConfig | null;
  accent: string | null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * A readable name from the slug, for the case where there is none to fetch.
 *
 * The public endpoint only knows about published websites, so the door to a
 * draft site's console had nothing to wear and printed the raw slug -
 * "fatima-portfolio" - on a page that is meant to look like the business's own.
 */
function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SiteLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { login, session } = useAuth();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forwarded only if this browser has actually signed in to *this* console.
  // A Frontsey session on its own is deliberately not enough: the whole point
  // of a separate admin link is that opening it asks who you are, rather than
  // letting whoever happens to be logged in on this machine walk into somebody
  // else's business.
  useEffect(() => {
    if (!session || !hasConsoleAccess(slug, session.accountId)) return;
    router.replace(`/s/${slug}`);
  }, [session, slug, router]);

  useEffect(() => {
    let cancelled = false;
    publicSiteApi
      .getBySlug(slug)
      .then((envelope) => {
        const site = envelope.website;
        if (cancelled || !site) return;
        const content = parseDraftContent(site.publishedContent);
        setBrand({
          name: site.businessName,
          logoUrl: site.profile?.logoUrl ?? null,
          tagline: content.heroHeading || null,
          theme: site.theme ?? null,
          accent: content.brandColor || null,
        });
      })
      .catch(() => {
        // Unknown or unpublished slug: no branding to wear, but the form still
        // has to work - the owner of a draft site needs to get in too.
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const authenticated = await login({ email, password });
      const accessible = await websitesApi.listAccessible(authenticated.accessToken).catch(() => []);
      if (!accessible.some((w) => w.slug === slug)) {
        setError("That account doesn't have access to this website.");
        setIsSubmitting(false);
        return;
      }
      // Credentials for this website were typed here and checked against its
      // access list - that, and only that, opens the console.
      grantConsoleAccess(slug, authenticated.accountId);
      router.push(`/s/${slug}`);
    } catch (err) {
      setError(friendlyMessage(err, "Login failed. Please try again."));
      setIsSubmitting(false);
    }
  }

  // The accent has to survive a site with no stored theme - a brand colour set
  // in the page content is enough on its own, and falling back to the
  // platform's purple would put somebody else's colour on their door.
  const themeStyle = brand?.theme
    ? themeCssVars(brand.theme, brand.accent ?? undefined)
    : brand?.accent
      ? ({ "--accent-solid": brand.accent } as React.CSSProperties)
      : undefined;

  return (
    // `text-foreground` alongside the background, not instead of it. themeCssVars
    // redefines --foreground to the site's text colour but deliberately sets no
    // `color`, so a surface that names only a background inherits the app's own
    // - which on a site with a dark palette put near-white type on this page's
    // light card and made the business name invisible on its own front door.
    <div className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-16 text-foreground" style={themeStyle}>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          {brand?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL; next/image would need a configured remote pattern per business
            <img src={brand.logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-semibold text-white"
              style={{ background: "var(--accent-solid, #7c3aed)" }}
            >
              {initialsOf(brand?.name ?? titleFromSlug(slug))}
            </span>
          )}
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{brand?.name ?? titleFromSlug(slug)}</h1>
            <p className="mt-0.5 text-sm text-[var(--theme-text-muted,color-mix(in_srgb,var(--foreground)_62%,transparent))]">
              {brand?.tagline ?? "Sign in to your website's admin."}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-[var(--theme-border)] bg-surface p-7 text-foreground shadow-lift"
        >
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--theme-text-muted,color-mix(in_srgb,var(--foreground)_62%,transparent))]">
          Only the owner and invited managers of {brand?.name ?? "this website"} can sign in here.
        </p>
      </div>
    </div>
  );
}
