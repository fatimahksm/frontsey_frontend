"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ScaledPreviewFrame } from "@/components/dashboard/ScaledPreviewFrame";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { PublicSiteRenderer } from "@/components/public/PublicSiteRenderer";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Stepper, type StepDefinition } from "@/components/ui/Stepper";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { LayoutVariant, PageMode, TemplateType, ThemeResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { mockSiteFor } from "@/lib/mock-preview-data";
import { TEMPLATE_OPTIONS, WEBSITE_TYPES, defaultLayoutVariant } from "@/lib/website/layout-options";

const WIZARD_STEPS: StepDefinition[] = [
  { step: 1, label: "Website type" },
  { step: 2, label: "Template" },
  { step: 3, label: "Business info" },
  { step: 4, label: "Content" },
  { step: 5, label: "Design" },
  { step: 6, label: "Preview" },
  { step: 7, label: "Review & publish" },
];

/** BR-SITE-001..004: name, template type, page mode, and an optional theme (null = build from scratch). Steps 1-2 of the guided creation wizard - steps 3-7 continue at /dashboard/websites/{id}/setup once the website exists. */
export default function NewWebsitePage() {
  const router = useRouter();
  const { session } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("MENU_ORDERING");
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("MENU_CLASSIC");
  const [pageMode, setPageMode] = useState<PageMode>("ONE_PAGE");
  const [themeId, setThemeId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    themeApi.list().then(setThemes).catch(() => setThemes([]));
  }, []);

  function selectTemplateType(type: TemplateType) {
    setTemplateType(type);
    setLayoutVariant(defaultLayoutVariant(type));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const website = await websitesApi.create(session.accessToken, {
        businessName,
        pageMode,
        templateType,
        themeId: themeId || null,
      });
      if (layoutVariant !== defaultLayoutVariant(templateType)) {
        await websitesApi.updateLayoutVariant(session.accessToken, website.id, layoutVariant);
      }
      router.push(`/dashboard/websites/${website.id}/setup`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create website.");
      setIsSubmitting(false);
    }
  }

  if (step === 1) {
    return (
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        <Reveal>
          <h1 className="text-xl font-semibold tracking-tight">Create a website</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Step 1 of 7 - What kind of site are you building?</p>
          <div className="mt-4">
            <Stepper steps={WIZARD_STEPS} currentStep={1} completedSteps={new Set()} />
          </div>
        </Reveal>

        <StaggerGroup className="mt-6 grid gap-3 sm:grid-cols-2">
          {WEBSITE_TYPES.map((option) => {
            const isSelected = templateType === option.value;
            return (
              <StaggerItem key={option.value}>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => selectTemplateType(option.value)}
                  className={`flex h-full w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left text-sm shadow-soft transition-colors duration-200 ${
                    isSelected
                      ? "border-transparent bg-gradient-accent text-white shadow-lift"
                      : "border-black/[.08] bg-surface hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.04]"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {option.icon}
                  </span>
                  <span className="font-semibold">{option.label}</span>
                  <span className={isSelected ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}>{option.description}</span>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Button className="mt-6" onClick={() => setStep(2)}>
          Next: choose a template
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Reveal>
        <button type="button" onClick={() => setStep(1)} className="mb-2 text-sm text-zinc-500 hover:underline">
          ← Back
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Choose a template</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Step 2 of 7 - every template below has the exact same features, only the look changes. You can switch anytime later, too.
        </p>
        <div className="mt-4">
          <Stepper steps={WIZARD_STEPS} currentStep={2} completedSteps={new Set([1])} />
        </div>
      </Reveal>

      <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_OPTIONS[templateType].map((option) => {
          const isSelected = layoutVariant === option.value;
          return (
            <StaggerItem key={option.value}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setLayoutVariant(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLayoutVariant(option.value);
                  }
                }}
                className={`w-full cursor-pointer rounded-2xl border-2 p-4 text-left transition-colors ${
                  isSelected ? "border-[var(--accent-solid)]" : "border-transparent"
                }`}
              >
                <div className="flex justify-center overflow-hidden rounded-xl border border-black/[.08] dark:border-white/[.145]">
                  <ScaledPreviewFrame>
                    <PublicSiteRenderer site={mockSiteFor(option.value)} onFirstView={() => {}} />
                  </ScaledPreviewFrame>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{option.description}</p>
                  </div>
                  <a
                    href={`/preview/mock/${option.value}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-xs font-medium text-[var(--accent-solid)] hover:underline"
                  >
                    Preview ↗
                  </a>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium">
          Live preview - {TEMPLATE_OPTIONS[templateType].find((o) => o.value === layoutVariant)?.label}
        </p>
        <div className="flex justify-center overflow-x-auto rounded-2xl border border-black/[.08] bg-white p-2 dark:border-white/[.145]">
          <ScaledPreviewFrame width={820} height={520}>
            <PublicSiteRenderer site={mockSiteFor(layoutVariant)} onFirstView={() => {}} />
          </ScaledPreviewFrame>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 flex max-w-lg flex-col gap-5">
        {error && <Alert tone="error">{error}</Alert>}

        <TextField
          id="businessName"
          label="Business name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="self-start text-sm font-medium text-[var(--accent-solid)] hover:underline"
        >
          {showAdvanced ? "Hide advanced options" : "Advanced options (optional)"}
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-black/[.12] p-4 dark:border-white/[.18]">
            <Select id="pageMode" label="Page layout" value={pageMode} onChange={(e) => setPageMode(e.target.value as PageMode)}>
              <option value="ONE_PAGE">Single page</option>
              <option value="MULTI_PAGE">Multiple pages</option>
            </Select>

            <Select id="themeId" label="Starting theme" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              <option value="">Build from scratch</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting} disabled={!businessName.trim()} className="mt-2">
          Create website
        </Button>
      </form>
    </div>
  );
}
