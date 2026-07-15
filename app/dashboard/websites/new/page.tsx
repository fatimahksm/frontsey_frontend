"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { themeApi } from "@/lib/api/theme";
import { websitesApi } from "@/lib/api/websites";
import type { PageMode, ThemeResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

/** BR-SITE-001..004: name, page mode, and an optional theme (null = build from scratch). */
export default function NewWebsitePage() {
  const router = useRouter();
  const { session } = useAuth();

  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [pageMode, setPageMode] = useState<PageMode>("ONE_PAGE");
  const [themeId, setThemeId] = useState("");
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
      <h1 className="text-xl font-semibold tracking-tight">Create a website</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Give your business a name and pick a starting point - you can change everything later.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {error && <Alert tone="error">{error}</Alert>}

        <TextField
          id="businessName"
          label="Business name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <Select
          id="pageMode"
          label="Page layout"
          value={pageMode}
          onChange={(e) => setPageMode(e.target.value as PageMode)}
        >
          <option value="ONE_PAGE">Single page</option>
          <option value="MULTI_PAGE">Multiple pages</option>
        </Select>

        <Select id="themeId" label="Starting theme (optional)" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
          <option value="">Build from scratch</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </Select>

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create website
        </Button>
      </form>
    </div>
  );
}
