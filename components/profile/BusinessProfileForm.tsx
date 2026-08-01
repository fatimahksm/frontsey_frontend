"use client";

import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { PhoneField } from "@/components/ui/PhoneField";
import { SuggestButton } from "@/components/ui/SuggestButton";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import type { BusinessProfileRequest, TemplateType } from "@/lib/api/types";

interface Props {
  businessName: string;
  templateType: TemplateType;
  accessToken: string;
  profile: BusinessProfileRequest;
  onChange<K extends keyof BusinessProfileRequest>(key: K, value: BusinessProfileRequest[K]): void;
}

/**
 * The essential-contact-info fields shared by the Business Profile settings
 * tab and Step 3 of the guided creation wizard. Policies and opening hours
 * stay tab-only - they aren't essential first-run information.
 */
export function BusinessProfileForm({ businessName, templateType, accessToken, profile, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Textarea
          id="description"
          label="Description"
          placeholder="A short summary of your business, shown on your public page."
          value={profile.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
        <SuggestButton
          accessToken={accessToken}
          businessName={businessName}
          templateType={templateType}
          fieldType="BUSINESS_DESCRIPTION"
          currentText={profile.description ?? ""}
          onSuggestion={(text) => onChange("description", text)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField
          id="logoUrl"
          label="Logo"
          value={profile.logoUrl ?? ""}
          onChange={(url) => onChange("logoUrl", url)}
          accessToken={accessToken}
        />
        <ImageUploadField
          id="coverImageUrl"
          label="Cover image"
          value={profile.coverImageUrl ?? ""}
          onChange={(url) => onChange("coverImageUrl", url)}
          accessToken={accessToken}
        />
        <PhoneField id="phone" label="Phone number" value={profile.phone ?? ""} onChange={(v) => onChange("phone", v)} />
        <PhoneField
          id="whatsappNumber"
          label="WhatsApp number"
          value={profile.whatsappNumber ?? ""}
          onChange={(v) => onChange("whatsappNumber", v)}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={profile.email ?? ""}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <TextField
          id="address"
          label="Address or location"
          value={profile.address ?? ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
        <TextField
          id="googleMapsUrl"
          label="Google Maps link (optional)"
          value={profile.googleMapsUrl ?? ""}
          onChange={(e) => onChange("googleMapsUrl", e.target.value)}
        />
        <TextField
          id="instagramUrl"
          label="Instagram link (optional)"
          value={profile.instagramUrl ?? ""}
          onChange={(e) => onChange("instagramUrl", e.target.value)}
        />
        <TextField
          id="tiktokUrl"
          label="TikTok link (optional)"
          value={profile.tiktokUrl ?? ""}
          onChange={(e) => onChange("tiktokUrl", e.target.value)}
        />
      </div>
    </div>
  );
}
