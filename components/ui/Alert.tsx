"use client";

import { motion } from "framer-motion";

type Tone = "error" | "success" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
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
