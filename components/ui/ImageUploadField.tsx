"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/api/client";
import { uploadsApi } from "@/lib/api/uploads";

interface Props {
  id: string;
  label: string;
  helperText?: string;
  value: string;
  onChange(url: string): void;
  accessToken: string;
}

/** Real file upload (drag/click), replacing the earlier "paste an image URL" text field. */
export function ImageUploadField({ id, label, helperText, value, onChange, accessToken }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  async function handleFileSelected(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadsApi.uploadImage(accessToken, file);
      onChange(url);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to upload image."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {helperText && <span className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</span>}

      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- owner-supplied preview, may be a remote URL
          <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-black/[.08] object-cover dark:border-white/[.145]" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-black/[.15] text-xs text-zinc-400 dark:border-white/[.2]">
            No image
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="w-auto px-4"
            isLoading={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Change image" : "Upload image"}
          </Button>
          <button
            type="button"
            className="text-left text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            onClick={() => setShowUrlField((v) => !v)}
          >
            or paste an image URL instead
          </button>
        </div>
      </div>

      {showUrlField && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="h-10 rounded-lg border border-black/[.12] bg-surface px-3 text-sm outline-none dark:border-white/[.16]"
        />
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
