import type { ReactNode } from "react";

const NATURAL_WIDTH = 1200;
const THUMB_WIDTH = 360;
const THUMB_HEIGHT = 260;
const SCALE = THUMB_WIDTH / NATURAL_WIDTH;

/** Renders real components at full desktop width, then shrinks them into a fixed-size thumbnail card - a genuine live preview, not a screenshot. */
export function ScaledPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-black/[.08] bg-white dark:border-white/[.145]"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      <div
        style={{ width: NATURAL_WIDTH, transform: `scale(${SCALE})`, transformOrigin: "top left" }}
        className="pointer-events-none"
      >
        {children}
      </div>
    </div>
  );
}
