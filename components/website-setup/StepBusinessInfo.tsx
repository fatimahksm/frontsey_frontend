"use client";

import { useEffect, useState } from "react";

import { BusinessProfileForm } from "@/components/profile/BusinessProfileForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/api/client";
import { profileApi } from "@/lib/api/profile";
import type { BusinessProfileRequest } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

const EMPTY_PROFILE: BusinessProfileRequest = {
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  address: "",
  googleMapsUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  showPrivacyPolicy: false,
  privacyPolicyContent: "",
  showTermsAndConditions: false,
  termsAndConditionsContent: "",
  showDeliveryPolicy: false,
  deliveryPolicyContent: "",
  showRefundPolicy: false,
  refundPolicyContent: "",
};

/** Wizard Step 3 - only the essential business-information fields (BR-SITE Phase 1). */
export function StepBusinessInfo({ onContinue }: { onContinue(): void }) {
  const { website, accessToken } = useWebsite();
  const [profile, setProfile] = useState<BusinessProfileRequest>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileApi
      .get(accessToken, website.id)
      .then((fetched) => {
        if (!cancelled) setProfile(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Failed to load business profile."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, website.id]);

  function updateField<K extends keyof BusinessProfileRequest>(key: K, value: BusinessProfileRequest[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveAndContinue() {
    setError(null);
    setIsSaving(true);
    try {
      await profileApi.update(accessToken, website.id, profile);
      onContinue();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save business information."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Business information</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tell customers how to find and contact you. You can add more detail later from Website Settings.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <BusinessProfileForm
        businessName={website.businessName}
        templateType={website.templateType}
        accessToken={accessToken}
        profile={profile}
        onChange={updateField}
      />

      <Button onClick={handleSaveAndContinue} isLoading={isSaving} className="w-auto self-start px-6">
        Save and continue
      </Button>
    </div>
  );
}
