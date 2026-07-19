import type { ReactNode } from "react";

const NATURAL_WIDTH = 1200;
const THUMB_WIDTH = 360;
const THUMB_HEIGHT = 260;

/** Renders real components at full desktop width, then shrinks them into a fixed-size card - a genuine live preview, not a screenshot. Defaults to a small thumbnail; pass a bigger width/height for a larger "look closer" preview. */
export function ScaledPreviewFrame({
  children,
  width = THUMB_WIDTH,
  height = THUMB_HEIGHT,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  const scale = width / NATURAL_WIDTH;
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-black/[.08] bg-white dark:border-white/[.145]"
      style={{ width, height }}
    >
      <div style={{ width: NATURAL_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }} className="pointer-events-none">
        {children}
      </div>
    </div>
  );
}
