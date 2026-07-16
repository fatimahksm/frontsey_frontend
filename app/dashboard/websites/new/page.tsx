"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { PageMode, TemplateType, ThemeResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

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

/** BR-SITE-001..004: name, template type, page mode, and an optional theme (null = build from scratch). */
export default function NewWebsitePage() {
  const router = useRouter();
  const { session } = useAuth();

  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("MENU_ORDERING");
  const [pageMode, setPageMode] = useState<PageMode>("ONE_PAGE");
  const [themeId, setThemeId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    themeApi.list().then(setThemes).catch(() => setThemes([]));
  }, []);

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
      router.push(`/dashboard/websites/${website.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create website.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <Reveal>
        <h1 className="text-xl font-semibold tracking-tight">Create a website</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Give your business a name and pick a starting point - you can change everything later.
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        {error && <Alert tone="error">{error}</Alert>}

        <TextField
          id="businessName"
          label="Business name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">Website type</legend>
          <StaggerGroup className="grid gap-3 sm:grid-cols-2">
            {TEMPLATE_TYPES.map((option) => {
              const isSelected = templateType === option.value;
              return (
                <StaggerItem key={option.value}>
                  <motion.label
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    className={`flex h-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-sm shadow-soft transition-colors duration-200 ${
                      isSelected
                        ? "border-transparent bg-gradient-accent text-white shadow-lift"
                        : "border-black/[.08] bg-surface hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.04]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateType"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => setTemplateType(option.value)}
                    />
                    <span className="text-2xl" aria-hidden>
                      {option.icon}
                    </span>
                    <span className="font-semibold">{option.label}</span>
                    <span className={isSelected ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}>
                      {option.description}
                    </span>
                  </motion.label>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </fieldset>

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
