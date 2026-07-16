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
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { LayoutVariant, PageMode, TemplateType, ThemeResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { mockSiteFor } from "@/lib/mock-preview-data";

const TEMPLATE_TYPES: { value: TemplateType; icon: string; label: string; description: string }[] = [
  {
    value: "MENU_ORDERING",
    icon: "🍽️",
    label: "Menu & ordering",
    description: "Categories, items, sizes/add-ons, and optional WhatsApp cart ordering. For cafes, restaurants, shops.",
  },
  {
    value: "PORTFOLIO",
    icon: "🎨",
    label: "Portfolio",
    description: "A services showcase with no cart. For salons, studios, agencies, and similar businesses.",
  },
];

const LAYOUT_OPTIONS: Record<TemplateType, { value: LayoutVariant; label: string; description: string }[]> = {
  MENU_ORDERING: [
    { value: "MENU_CLASSIC", label: "Classic", description: "Business-card header, gallery strip, categorized list, cart sidebar." },
    { value: "MENU_GRID", label: "Grid", description: "Full-width cover, sticky category tabs, items as a card grid, cart drawer." },
    { value: "MENU_ELEGANT", label: "Elegant", description: "Fine-dining style list with dotted price leaders and a minimal bottom cart bar." },
  ],
  PORTFOLIO: [
    { value: "PORTFOLIO_HERO", label: "Hero", description: "Full-bleed dark hero, centered content, services grid, work gallery." },
    { value: "PORTFOLIO_MINIMAL", label: "Minimal", description: "Light editorial split-screen - fixed profile panel, scrollable content." },
    { value: "PORTFOLIO_BOLD", label: "Bold", description: "Vibrant creative-agency style with bold type and a masonry work gallery." },
  ],
};

/** BR-SITE-001..004: name, template type, page mode, and an optional theme (null = build from scratch). */
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
    setLayoutVariant(LAYOUT_OPTIONS[type][0].value);
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
      if (layoutVariant !== LAYOUT_OPTIONS[templateType][0].value) {
        await websitesApi.updateLayoutVariant(session.accessToken, website.id, layoutVariant);
      }
      router.push(`/dashboard/websites/${website.id}`);
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
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">What kind of site are you building?</p>
        </Reveal>

        <StaggerGroup className="mt-6 grid gap-3 sm:grid-cols-2">
          {TEMPLATE_TYPES.map((option) => {
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
          Next: pick a design
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
        <h1 className="text-xl font-semibold tracking-tight">Pick a design</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Every design below has the exact same features - only the look changes. You can switch anytime later, too.
        </p>
      </Reveal>

      <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LAYOUT_OPTIONS[templateType].map((option) => {
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
                <p className="mt-3 font-semibold">{option.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{option.description}</p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

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
