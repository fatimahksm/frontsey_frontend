"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { friendlyMessage } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * A section of a business's console, reached by its short link.
 *
 * Everything under /s/<slug>/ used to mount a second copy of the console's
 * editors behind a second sign-in. There is one console now, so this resolves
 * the slug and forwards the section to it - which also means an old bookmark
 * or a link somebody sent a manager still lands where it used to.
 *
 * An unknown section is not a 404: the sections a console shows depend on the
 * template, so a link that was valid on one website is not on another, and the
 * console itself says so far better than a dead end does.
 */
export default function SiteConsoleSectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = use(params);
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/s/${slug}/${section}`)}`);
      return;
    }
    let cancelled = false;
    websitesApi
      .listAccessible(session.accessToken)
      .then((all) => {
        if (cancelled) return;
        const match = all.find((w) => w.slug === slug);
        if (!match) {
          setIsDenied(true);
          return;
        }
        router.replace(`/manage/${match.id}/${section}`);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Could not open this website."));
      });
    return () => {
      cancelled = true;
    };
  }, [isLoading, session, router, slug, section]);

  if (isDenied) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-3 px-4 py-16 text-center">
        <h1 className="text-lg font-semibold tracking-tight">You don&apos;t have access to this website</h1>
        <p className="text-sm text-muted">
          You are signed in as {session?.email}. Ask the owner to invite you as a manager, or sign in with the account
          that owns it.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
      <p className="text-sm text-muted">Opening your console…</p>
    </div>
  );
}
