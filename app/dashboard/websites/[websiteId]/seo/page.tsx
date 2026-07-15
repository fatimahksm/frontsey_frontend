"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { seoApi } from "@/lib/api/seo";
import type { SeoMetadataRequest } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

export default function SeoPage() {
  const { website, accessToken } = useWebsite();
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    seoApi
      .get(accessToken, website.id)
      .then((seo) => {
        setMetaTitle(seo.metaTitle ?? "");
        setMetaDescription(seo.metaDescription ?? "");
        setOgImageUrl(seo.ogImageUrl ?? "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load SEO metadata."))
      .finally(() => setIsLoading(false));
  }, [accessToken, website.id]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      const request: SeoMetadataRequest = {
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImageUrl: ogImageUrl || null,
      };
      await seoApi.update(accessToken, website.id, request);
      setMessage("SEO metadata updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save SEO metadata.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">SEO</h1>
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Search & social preview">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField
            id="metaTitle"
            label="Meta title"
            maxLength={70}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
          <Textarea
            id="metaDescription"
            label="Meta description"
            maxLength={160}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
          />
          <TextField
            id="ogImageUrl"
            label="Social share image URL"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
          />
          <Button type="submit" isLoading={isSaving} className="mt-2 w-auto px-5">
            Save
          </Button>
        </form>
      </Card>
    </div>
  );
}
