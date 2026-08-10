"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { friendlyMessage } from "@/lib/api/client";
import { publicSiteApi } from "@/lib/api/publicSite";
import { websitesApi } from "@/lib/api/websites";
import { useAuth } from "@/lib/auth/auth-context";
import { parseDraftContent } from "@/lib/website/draft-content";

/**
 * Sign-in, in two flavours.
 *
 * Plain `/login` is the platform's own front door. `/login?site=<slug>` is one
 * business's back-office door: it wears their name and logo, and it sends them
 * straight into that website's console afterwards instead of via a list of
 * everything they own. Same form, same credentials - only the way in belongs to
 * them rather than to the platform.
 *
 * The site lookup uses the public endpoint, which needs no token, because the
 * person reading this screen has not signed in yet.
 */

interface SiteBrand {
  name: string;
  logoUrl: string | null;
  tagline: string | null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const siteSlug = searchParams.get("site");
  const next = searchParams.get("next");

  const [brand, setBrand] = useState<SiteBrand | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteSlug) return;
    let cancelled = false;
    publicSiteApi
      .getBySlug(siteSlug)
      .then((envelope) => {
        const site = envelope.website;
        if (cancelled || !site) return;
        const content = parseDraftContent(site.publishedContent);
        setBrand({
          name: site.businessName,
          logoUrl: site.profile?.logoUrl ?? null,
          tagline: content.heroHeading || null,
        });
      })
      .catch(() => {
        // An unpublished or unknown slug simply means no branding to show; the
        // sign-in form itself must still work.
      });
    return () => {
      cancelled = true;
    };
  }, [siteSlug]);

  /** Where to land after a successful sign-in. */
  async function destination(accessToken: string): Promise<string> {
    if (next && next.startsWith("/")) return next;
    if (siteSlug) {
      // The console is keyed by id, and this screen only knows the slug, so
      // resolve it against what this account can actually reach - which also
      // means someone signing in at a site they do not manage lands somewhere
      // sensible rather than on a permission error.
      const accessible = await websitesApi.listAccessible(accessToken).catch(() => []);
      const match = accessible.find((w) => w.slug === siteSlug);
      if (match) return `/manage/${match.id}`;
    }
    return "/dashboard";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login({ email, password });
      router.push(await destination(session.accessToken));
    } catch (err) {
      setError(friendlyMessage(err, "Login failed. Please try again."));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle={brand ? `Manage ${brand.name}` : undefined}
      brand={brand ?? undefined}
      footer={siteSlug ? undefined : { question: "New to Frontsey?", linkLabel: "Create an account", href: "/register" }}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
        <div className="-mt-1 text-right text-sm">
          <Link href="/reset-password" className="text-zinc-600 hover:underline dark:text-zinc-400">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}

