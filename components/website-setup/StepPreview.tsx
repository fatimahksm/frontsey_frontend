"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useWebsite } from "@/lib/website/website-context";

type DeviceMode = "mobile" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  mobile: 390,
  tablet: 834,
  desktop: 1280,
};

/**
 * Wizard Step 6 - loads the draft preview once (plus a manual refresh),
 * instead of polling every few seconds, per the "avoid reloading every 5
 * seconds" guidance. Reuses the same /preview/{websiteId} route as the
 * dashboard's LivePreviewPanel, so there's still one source of truth for
 * "what does the draft look like."
 */
export function StepPreview({ onContinue }: { onContinue(): void }) {
  const { website } = useWebsite();
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Preview</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            This shows your current draft, exactly as customers would see it once published.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-black/[.1] p-1 dark:border-white/[.16]">
          {(["mobile", "tablet", "desktop"] as DeviceMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDevice(mode)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                device === mode ? "bg-gradient-accent text-white" : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="text-sm font-medium text-[var(--accent-solid)] hover:underline"
        >
          ↻ Refresh preview
        </button>
        <Link href={`/preview/${website.id}`} target="_blank" className="text-sm font-medium text-[var(--accent-solid)] hover:underline">
          Open in new tab ↗
        </Link>
      </div>

      <div className="flex justify-center overflow-x-auto rounded-2xl border border-black/[.08] bg-white p-3 dark:border-white/[.145]">
        <iframe
          key={reloadKey}
          src={`/preview/${website.id}?embedded=1`}
          title="Website preview"
          style={{ width: DEVICE_WIDTHS[device], height: 640 }}
          className="max-w-full shrink-0 rounded-lg border-0"
        />
      </div>

      <Button onClick={onContinue} className="w-auto self-start px-6">
        Continue
      </Button>
    </div>
  );
}
