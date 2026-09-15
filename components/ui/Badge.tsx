type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

/**
 * Tones come from the shared tokens rather than from Tailwind's palette, so a
 * badge, an alert and a danger button are the same red - they were three
 * different ones.
 */
const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted",
  accent: "bg-accent-quiet text-accent-ink",
  success: "bg-success-quiet text-success",
  warning: "bg-warning-quiet text-warning",
  danger: "bg-danger-quiet text-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-tight ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
