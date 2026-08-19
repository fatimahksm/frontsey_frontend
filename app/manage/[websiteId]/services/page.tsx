"use client";

import { ServicesManager } from "@/components/services/ServicesManager";
import { sectionLabel } from "@/lib/website/template-content";
import { useWebsite } from "@/lib/website/website-context";

export default function ServicesPage() {
  const { website } = useWebsite();
  // "Packages" on the Services template, "Products" on Brand, "Disciplines" on
  // the gallery one. One store, called what the site calls it, so nobody has to
  // translate between the editor's word and their own page's.
  const label = sectionLabel(website.layoutVariant, "services", "Services");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">{label}</h1>
      <ServicesManager />
    </div>
  );
}
