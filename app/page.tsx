"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function Home() {
  const { session, isLoading } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-32 text-center dark:bg-black">
      <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight">
        Build your business website in minutes.
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Pick a template, brand your site, and share it with customers - no code required.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {isLoading ? null : session ? (
          <Link href="/dashboard" className="w-full sm:w-48">
            <Button>Go to dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/register" className="w-full sm:w-48">
              <Button>Get started</Button>
            </Link>
            <Link href="/login" className="w-full sm:w-48">
              <Button variant="secondary">Log in</Button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
