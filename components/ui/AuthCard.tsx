"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: { question?: string; linkLabel: string; href: string };
  /**
   * A specific business to wear instead of the platform.
   *
   * Set when someone is signing in to one website's admin console rather than
   * to the platform: they are opening their own back office, and meeting a
   * different company's name and pitch on the way in is exactly the confusion
   * the separate /manage area exists to remove.
   */
  brand?: { name: string; logoUrl?: string | null; tagline?: string | null };
}

/** Shared shell for every /register, /login, /verify-email, /reset-password page. */
export function AuthCard({ title, subtitle, children, footer, brand }: AuthCardProps) {
  return (
    <div className="flex flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-accent p-12 text-white lg:flex">
        <div aria-hidden className="animate-float absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        {brand ? (
          <span className="relative flex items-center gap-3">
            {brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL; next/image would need a configured remote pattern per business
              <img src={brand.logoUrl} alt="" className="h-9 w-9 rounded-lg bg-white/15 object-cover" />
            )}
            <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
          </span>
        ) : (
          <Link href="/" className="relative text-lg font-semibold tracking-tight">
            Frontsey
          </Link>
        )}
        <div className="relative">
          {brand ? (
            <>
              <p className="text-3xl font-semibold leading-tight tracking-tight">{brand.name}</p>
              <p className="mt-3 max-w-sm text-white/80">{brand.tagline || "Sign in to manage your website."}</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold leading-tight tracking-tight">
                Build your business website in minutes.
              </p>
              <p className="mt-3 max-w-sm text-white/80">
                Menu &amp; ordering or a services portfolio - published live, no code required.
              </p>
            </>
          )}
        </div>
        <div />
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-surface p-8 shadow-lift dark:border-white/[.1]"
        >
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
          <div className="mt-6 flex flex-col gap-4">{children}</div>
          {footer && (
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {footer.question && <>{footer.question} </>}
              <Link href={footer.href} className="font-medium text-foreground hover:underline">
                {footer.linkLabel}
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
