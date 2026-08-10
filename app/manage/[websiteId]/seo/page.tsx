"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SuggestButton } from "@/components/ui/SuggestButton";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { friendlyMessage } from "@/lib/api/client";
import { seoApi } from "@/lib/api/seo";
import type { SeoMetadataRequest } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

export default function SeoPage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // See BusinessProfilePage for why this guard exists: without it, React
    // Strict Mode's dev-only double effect invocation can let a stale
    // second response silently overwrite text the user already typed.
    let cancelled = false;
    seoApi
      .get(accessToken, website.id)
      .then((seo) => {
        if (cancelled) return;
        setMetaTitle(seo.metaTitle ?? "");
        setMetaDescription(seo.metaDescription ?? "");
        setOgImageUrl(seo.ogImageUrl ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Failed to load SEO metadata."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save SEO metadata."));
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
          <div className="flex flex-col gap-1.5">
            <TextField
              id="metaTitle"
              label="Meta title"
              maxLength={70}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
            <SuggestButton
              accessToken={accessToken}
              businessName={website.businessName}
              templateType={website.templateType}
              fieldType="SEO_META_TITLE"
              currentText={metaTitle}
              onSuggestion={setMetaTitle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Textarea
              id="metaDescription"
              label="Meta description"
              maxLength={160}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
            <SuggestButton
              accessToken={accessToken}
              businessName={website.businessName}
              templateType={website.templateType}
              fieldType="SEO_META_DESCRIPTION"
              currentText={metaDescription}
              onSuggestion={setMetaDescription}
            />
          </div>
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
