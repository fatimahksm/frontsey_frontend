"use client";

import Link from "next/link";

import type { SubscriptionResponse } from "@/lib/api/types";
import { isPlanLocked } from "@/lib/website/subscription-state";

/**
 * The bar shown on every page of a website whose plan has stopped.
 *
 * The server refuses every write on such a website (WebsiteAccessGuard), which
 * is where the rule actually lives - but a locked site that looks exactly like
 * a working one is its own problem: an owner fills in a form, presses Save, and
 * only then learns they were never going to be able to. This says it up front,
 * on every page, and points at the one thing that fixes it.
 *
 * Deliberately not a blocking overlay. Everything stays readable - an owner
 * should be able to see their own menu, their own content and their own numbers
 * while they decide whether to pay - it just cannot be changed.
 */

export function PlanLockBanner({
  subscription,
  subscriptionHref,
}: {
  subscription: SubscriptionResponse | null;
  subscriptionHref: string;
}) {
  if (!isPlanLocked(subscription)) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 bg-amber-500/10 px-5 py-3 sm:px-8"
    >
      <p className="text-sm">
        <span className="font-semibold">This website is locked.</span>{" "}
        <span className="text-zinc-600 dark:text-zinc-300">
          Your plan ended, so the site is offline and nothing can be edited. You can still look at everything.
        </span>
      </p>
      <Link
        href={subscriptionHref}
        className="shrink-0 rounded-full bg-[var(--accent-solid)] px-4 py-1.5 text-sm font-medium text-[var(--accent-contrast)] transition-opacity hover:opacity-90"
      >
        Choose a plan
      </Link>
    </div>
  );
}
