import type { ReactNode } from "react";

/**
 * The page's own margins, said once.
 *
 * Every signed-in page set its own: four different maximum widths paired with
 * three different padding pairs, so moving between two of them shifted the
 * content sideways and the gutter changed on a phone. The width still varies -
 * a list wants the window and a settings form does not - but only between
 * these two, and the padding never varies at all.
 */
export function PageFrame({
  width = "wide",
  children,
  className = "",
}: {
  /** "wide" for lists and dashboards, "form" for anything read a line at a time. */
  width?: "wide" | "form";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full flex-1 px-4 py-8 sm:px-8 ${width === "wide" ? "max-w-6xl" : "max-w-2xl"} ${className}`}
    >
      {children}
    </div>
  );
}
