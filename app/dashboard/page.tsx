"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [isLoading, session, router]);

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-black/[.08] p-8 dark:border-white/[.145]">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
          <dd>{session.email}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Role</dt>
          <dd>{session.role}</dd>
        </dl>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Website creation is coming in the next phase. For now, this confirms your account is
          registered, verified, and authenticated end to end against the backend.
        </p>
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
