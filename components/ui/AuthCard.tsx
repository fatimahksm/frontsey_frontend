import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: { question?: string; linkLabel: string; href: string };
}

/** Shared shell for every /register, /login, /verify-email, /reset-password page. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        )}
        <div className="mt-6 flex flex-col gap-4">{children}</div>
        {footer && (
          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {footer.question && <>{footer.question} </>}
            <Link href={footer.href} className="font-medium text-foreground hover:underline">
              {footer.linkLabel}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
