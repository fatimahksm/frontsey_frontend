"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Stepper, type StepDefinition } from "@/components/ui/Stepper";
import { StepBusinessInfo } from "@/components/website-setup/StepBusinessInfo";
import { StepReview } from "@/components/website-setup/StepReview";
import { useWebsite } from "@/lib/website/website-context";

export const SETUP_STEPS: StepDefinition[] = [
  { step: 1, label: "Website type" },
  { step: 2, label: "Template" },
  { step: 3, label: "Basics" },
  { step: 4, label: "Publish" },
];

const FIRST_STEP = 3;
const LAST_STEP = 4;

function clampStep(value: number): number {
  return Math.min(LAST_STEP, Math.max(FIRST_STEP, value));
}

/**
 * Steps 3-4 of the guided website-creation wizard. Steps 1-2 (website type,
 * template) happen before the website exists yet, at
 * /dashboard/websites/new - this continues straight from there once the
 * website has been created, and always operates on real, already-persisted
 * data so leaving and coming back never loses progress.
 *
 * It used to run to seven steps, walking the owner through the whole menu or
 * services manager, the theme editor and a preview before they could publish.
 * Every one of those is a dashboard page that does the same job better and can
 * be revisited, so the wizard now asks only for what a site cannot open
 * without - a logo, a line of description, a way to be contacted - and hands
 * over. The dashboard is where a website gets filled in; setup only has to get
 * someone to it.
 */
export function SetupWizard() {
  const { website } = useWebsite();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedStep = Number(searchParams.get("step"));
  const [step, setStep] = useState(() => (requestedStep >= FIRST_STEP && requestedStep <= LAST_STEP ? requestedStep : FIRST_STEP));

  useEffect(() => {
    router.replace(`/dashboard/websites/${website.id}/setup?step=${step}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const completedSteps = useMemo(() => {
    const done = new Set<number>([1, 2]); // always complete by the time this wizard is reachable
    for (let s = FIRST_STEP; s < step; s += 1) done.add(s);
    if (website.status === "PUBLISHED") done.add(LAST_STEP);
    return done;
  }, [step, website.status]);

  function goTo(next: number) {
    setStep(clampStep(next));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Set up {website.businessName}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Step {step} of {LAST_STEP} - {SETUP_STEPS.find((s) => s.step === step)?.label}
          </p>
        </div>
        <Stepper steps={SETUP_STEPS} currentStep={step} completedSteps={completedSteps} />
      </div>

      {step > FIRST_STEP && (
        <button type="button" onClick={() => goTo(step - 1)} className="-mb-2 self-start text-sm text-zinc-500 hover:underline">
          ← Back
        </button>
      )}

      {step === 3 && <StepBusinessInfo onContinue={() => goTo(4)} />}
      {step === 4 && <StepReview onPublished={() => router.push(`/dashboard/websites/${website.id}`)} />}
    </div>
  );
}
