"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoutIcon, PeopleIcon, SettingsIcon, TextIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Who you are signed in as, and the way to your own settings.
 *
 * There was no such way. The top bar ended in a bare "Log out" button, the
 * owner's nav carried an "Account" link buried between two others, and the
 * Super Admin's nav had no route to it at all - so the person who runs the
 * platform could not open their own account page without typing the URL.
 *
 * It also answers a question the console never answered: which account am I
 * using? That matters most to the people most likely to have two - an owner
 * who is also a manager elsewhere, and an admin with a personal site.
 */
function initialsOf(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 1).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Platform admin",
  BUSINESS_OWNER: "Business owner",
  MANAGER: "Manager",
};

export function AccountMenu() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  // Tied to the route it was opened on, so following a link inside it closes
  // it on the first render of the next page rather than one render later.
  const [menu, setMenu] = useState({ path: pathname, open: false });
  const open = menu.path === pathname && menu.open;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setMenu((m) => ({ ...m, open: false }));
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu((m) => ({ ...m, open: false }));
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!session) return null;

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setMenu({ path: pathname, open: !open })}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Your account"
        className="focus-ring flex h-9 items-center gap-2 rounded-full border border-line-strong ps-1 pe-2.5 transition-colors hover:bg-surface-muted"
      >
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-accent text-[11px] font-semibold text-white"
        >
          {initialsOf(session.email)}
        </span>
        {/* The email itself only where there is room for it; the mark is the
            control at every width, so the target never changes size. */}
        <span className="hidden max-w-40 truncate text-xs text-muted lg:inline">{session.email}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-30 mt-2 w-64 overflow-hidden rounded-card border border-line bg-surface shadow-lift"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium">{session.email}</p>
            <p className="mt-0.5 text-xs text-muted">{ROLE_LABELS[session.role] ?? session.role}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard/account"
              role="menuitem"
              className="focus-ring flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <SettingsIcon className="h-[17px] w-[17px] shrink-0" />
              Account settings
            </Link>
            {/* A Super Admin's own websites live behind their platform hat, so
                the way back to them belongs here rather than in a nav that is
                about the platform. */}
            {isSuperAdmin && (
              <Link
                href="/dashboard"
                role="menuitem"
                className="focus-ring flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <PeopleIcon className="h-[17px] w-[17px] shrink-0" />
                My own websites
              </Link>
            )}
            <Link
              href="/dashboard/support"
              role="menuitem"
              className="focus-ring flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <TextIcon className="h-[17px] w-[17px] shrink-0" />
              Support
            </Link>
          </div>
          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="focus-ring flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-start text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <LogoutIcon className="h-[17px] w-[17px] shrink-0" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
