export interface StepDefinition {
  step: number;
  label: string;
}

/**
 * Horizontal step indicator for the guided website-creation wizard. Shows
 * every step's number/label plus a visual state (done / current / upcoming)
 * so the user always knows where they are and what's left.
 */
export function Stepper({ steps, currentStep, completedSteps }: {
  steps: StepDefinition[];
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <ol className="flex w-full flex-wrap items-center gap-x-2 gap-y-3" aria-label="Website setup progress">
      {steps.map((item, index) => {
        const isDone = completedSteps.has(item.step) && item.step !== currentStep;
        const isCurrent = item.step === currentStep;
        return (
          <li key={item.step} className="flex items-center gap-2">
            <div
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isCurrent
                  ? "bg-gradient-accent text-white"
                  : isDone
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-black/[.05] text-zinc-500 dark:bg-white/[.06] dark:text-zinc-400"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  isCurrent ? "bg-white/25" : isDone ? "bg-emerald-500/25" : "bg-black/[.08] dark:bg-white/[.12]"
                }`}
                aria-hidden
              >
                {isDone ? "✓" : item.step}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </div>
            {index < steps.length - 1 && <span className="h-px w-3 shrink-0 bg-black/[.1] dark:bg-white/[.15]" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
