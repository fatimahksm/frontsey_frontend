"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-1 flex-col">
        <TopNav />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </RequireAuth>
  );
}
