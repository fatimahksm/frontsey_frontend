"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { friendlyMessage } from "@/lib/api/client";
import { websitesApi } from "@/lib/api/websites";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * The short link to a business's console.
 *
 * /s/<slug> is the address an owner can recognise and type, and the one handed
 * to a manager. It used to open a second console of its own - its own shell,
 * its own icons, its own sign-in page - listing the same sections as the one at
 * /manage/<id>. Two consoles for one website is one too many, so this resolves
 * the slug and sends you to the console.
 *
 * The separate door it used to keep is gone with it. It only ever guarded this
 * entrance: the same person, with the same session, could already open the same
 * website from their dashboard - so it stopped nobody while asking an owner to
 * sign in twice to a product they were signed in to. What actually protects a
 * website is the server, which authorizes every request against the account's
 * real access to it, and that has not changed.
 */
export default function SiteConsoleEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/s/${slug}`)}`);
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
        router.replace(`/manage/${match.id}`);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Could not open this website."));
      });
    return () => {
      cancelled = true;
    };
  }, [isLoading, session, router, slug]);

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
