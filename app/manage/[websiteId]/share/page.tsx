"use client";

import { ShareLinksPanel } from "@/components/dashboard/ShareLinksPanel";
import { Card } from "@/components/ui/Card";
import { useWebsite } from "@/lib/website/website-context";

/** Standing home for the owner's admin link, public link, and menu QR code - the same panel the setup wizard ends on. */
export default function SharePage() {
  const { website } = useWebsite();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Share</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your links and QR code for {website.businessName}.
        </p>
      </div>

      <Card title="Links and QR code" description="Everything you need to hand your website to customers.">
        <ShareLinksPanel website={website} />
      </Card>
    </div>
  );
}
