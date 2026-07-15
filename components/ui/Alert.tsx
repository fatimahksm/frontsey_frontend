type Tone = "error" | "success" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  error:
    "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  info: "border-black/[.12] bg-black/[.03] text-foreground dark:border-white/[.18] dark:bg-white/[.05]",
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${TONE_CLASSES[tone]}`}
    >
      {children}
    </div>
  );
}
