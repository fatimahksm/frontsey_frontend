"use client";

import { ServicesManager } from "@/components/services/ServicesManager";

/**
 * The console names this section - "Packages" on the Services template,
 * "Products" on Brand, "Disciplines" on the gallery one - from the template's
 * own plan, which is the same list the sidebar row came from. The page used to
 * look that name up a second time and print it as a heading, which is how a
 * section ended up with two names on one screen.
 */
export default function ServicesPage() {
  return <ServicesManager />;
}
