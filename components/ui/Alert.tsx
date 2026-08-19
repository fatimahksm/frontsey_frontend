"use client";

import { motion } from "framer-motion";

type Tone = "error" | "warning" | "success" | "info";

// Every tone names its own text colour. A tone that set only a background would
// inherit the body's --foreground, which flips with the colour scheme - the same
// bug that made text vanish on the themed templates.
const TONE_CLASSES: Record<Tone, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  // Something the reader has to act on, but nothing is broken - between info and error.
  warning: "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  info: "border-black/[.12] bg-black/[.03] text-foreground dark:border-white/[.18] dark:bg-white/[.05]",
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${TONE_CLASSES[tone]}`}
    >
      {children}
    </motion.div>
  );
}
