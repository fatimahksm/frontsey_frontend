"use client";

import { EventManager } from "@/components/events/EventManager";
import { sectionLabel } from "@/lib/website/template-content";
import { useWebsite } from "@/lib/website/website-context";

export default function EventPage() {
  const { website } = useWebsite();
  const label = sectionLabel(website.layoutVariant, "event", "The occasion");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">{label}</h1>
      <EventManager />
    </div>
  );
}
