"use client";

import { ServicesManager } from "@/components/services/ServicesManager";

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Services</h1>
      <ServicesManager />
    </div>
  );
}
