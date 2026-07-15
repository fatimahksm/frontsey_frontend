"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { PhoneField } from "@/components/ui/PhoneField";
import { SuggestButton } from "@/components/ui/SuggestButton";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { profileApi } from "@/lib/api/profile";
import type { BusinessProfileRequest, OpeningHoursEntry } from "@/lib/api/types";
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

const DAYS: OpeningHoursEntry["dayOfWeek"][] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<OpeningHoursEntry["dayOfWeek"], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function toTimeInput(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

function fromTimeInput(value: string): string | null {
  return value ? `${value}:00` : null;
}

function defaultHours(): OpeningHoursEntry[] {
  return DAYS.map((dayOfWeek) => ({ dayOfWeek, open: false, opensAt: null, closesAt: null }));
}

export default function BusinessProfilePage() {
  const { website, accessToken } = useWebsite();

  const [profile, setProfile] = useState<BusinessProfileRequest>(EMPTY_PROFILE);
  const [hours, setHours] = useState<OpeningHoursEntry[]>(defaultHours());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  useEffect(() => {
    // `cancelled` guards against a stale response overwriting form state the
    // user has already started editing - React Strict Mode's dev-only double
    // effect invocation double-fires this fetch, and without this guard the
    // second (redundant) response can silently wipe out whatever the user
    // typed in the gap between the two resolutions.
    let cancelled = false;
    Promise.all([profileApi.get(accessToken, website.id), profileApi.getOpeningHours(accessToken, website.id)])
      .then(([fetchedProfile, fetchedHours]) => {
        if (cancelled) return;
        setProfile(fetchedProfile);
        if (fetchedHours.length > 0) {
          setHours(DAYS.map((day) => fetchedHours.find((h) => h.dayOfWeek === day) ?? { dayOfWeek: day, open: false, opensAt: null, closesAt: null }));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load business profile.");
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

  async function handleSaveProfile() {
    setError(null);
    setMessage(null);
    setIsSavingProfile(true);
    try {
      const updated = await profileApi.update(accessToken, website.id, profile);
      setProfile(updated);
      setMessage("Business profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save business profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveHours() {
    setError(null);
    setMessage(null);
    setIsSavingHours(true);
    try {
      const updated = await profileApi.updateOpeningHours(accessToken, website.id, hours);
      setHours(updated);
      setMessage("Opening hours updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save opening hours.");
    } finally {
      setIsSavingHours(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Business profile</h1>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Card title="Details" description="Contact info shown on your public page.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Textarea
              id="description"
              label="Description"
              value={profile.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <SuggestButton
              accessToken={accessToken}
              businessName={website.businessName}
              templateType={website.templateType}
              fieldType="BUSINESS_DESCRIPTION"
              currentText={profile.description ?? ""}
              onSuggestion={(text) => updateField("description", text)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              id="logoUrl"
              label="Logo"
              value={profile.logoUrl ?? ""}
              onChange={(url) => updateField("logoUrl", url)}
              accessToken={accessToken}
            />
            <ImageUploadField
              id="coverImageUrl"
              label="Cover image"
              value={profile.coverImageUrl ?? ""}
              onChange={(url) => updateField("coverImageUrl", url)}
              accessToken={accessToken}
            />
            <PhoneField id="phone" label="Phone" value={profile.phone ?? ""} onChange={(v) => updateField("phone", v)} />
            <PhoneField
              id="whatsappNumber"
              label="WhatsApp number"
              value={profile.whatsappNumber ?? ""}
              onChange={(v) => updateField("whatsappNumber", v)}
            />
            <TextField id="email" label="Email" value={profile.email ?? ""} onChange={(e) => updateField("email", e.target.value)} />
            <TextField id="address" label="Address" value={profile.address ?? ""} onChange={(e) => updateField("address", e.target.value)} />
            <TextField
              id="googleMapsUrl"
              label="Google Maps URL"
              value={profile.googleMapsUrl ?? ""}
              onChange={(e) => updateField("googleMapsUrl", e.target.value)}
            />
            <TextField
              id="instagramUrl"
              label="Instagram URL"
              value={profile.instagramUrl ?? ""}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
            />
            <TextField
              id="tiktokUrl"
              label="TikTok URL"
              value={profile.tiktokUrl ?? ""}
              onChange={(e) => updateField("tiktokUrl", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card title="Policies" description="Optional legal/policy pages shown to customers.">
        <div className="flex flex-col gap-5">
          {(
            [
              ["showPrivacyPolicy", "privacyPolicyContent", "Privacy policy"],
              ["showTermsAndConditions", "termsAndConditionsContent", "Terms and conditions"],
              ["showDeliveryPolicy", "deliveryPolicyContent", "Delivery policy"],
              ["showRefundPolicy", "refundPolicyContent", "Refund policy"],
            ] as const
          ).map(([toggleKey, contentKey, label]) => (
            <div key={toggleKey} className="flex flex-col gap-2">
              <Checkbox
                id={toggleKey}
                label={`Show ${label.toLowerCase()}`}
                checked={profile[toggleKey]}
                onChange={(e) => updateField(toggleKey, e.target.checked)}
              />
              {profile[toggleKey] && (
                <Textarea
                  id={contentKey}
                  label={`${label} content`}
                  value={profile[contentKey] ?? ""}
                  onChange={(e) => updateField(contentKey, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <Button onClick={handleSaveProfile} isLoading={isSavingProfile} className="mt-5 w-auto px-5">
          Save profile
        </Button>
      </Card>

      <Card title="Opening hours">
        <div className="flex flex-col gap-3">
          {hours.map((entry, index) => (
            <div key={entry.dayOfWeek} className="flex items-center gap-4">
              <span className="w-28 text-sm font-medium">{DAY_LABELS[entry.dayOfWeek]}</span>
              <Checkbox
                id={`open-${entry.dayOfWeek}`}
                label="Open"
                checked={entry.open}
                onChange={(e) =>
                  setHours((prev) => prev.map((h, i) => (i === index ? { ...h, open: e.target.checked } : h)))
                }
              />
              {entry.open && (
                <>
                  <input
                    type="time"
                    value={toTimeInput(entry.opensAt)}
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, opensAt: fromTimeInput(e.target.value) } : h)),
                      )
                    }
                    className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
                  />
                  <span className="text-sm text-zinc-500">to</span>
                  <input
                    type="time"
                    value={toTimeInput(entry.closesAt)}
                    onChange={(e) =>
                      setHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, closesAt: fromTimeInput(e.target.value) } : h)),
                      )
                    }
                    className="h-9 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <Button onClick={handleSaveHours} isLoading={isSavingHours} className="mt-5 w-auto px-5">
          Save opening hours
        </Button>
      </Card>
    </div>
  );
}
