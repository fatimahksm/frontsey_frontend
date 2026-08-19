"use client";

import { MenuManager } from "@/components/menu/MenuManager";

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Menu</h1>
      <MenuManager />
    </div>
  );
}
